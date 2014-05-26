if (!window.Common)
	window.Common = {};

/**
 * This class builds a dropdown that can contain more dropdowns, Backbone views, or simple HTML. The
 * dropdown expands and animates vertically on click, and closes upon another click.
 */
Common.Dropdown = Backbone.View.extend({
	"defaults": {
		"open": false,
		"titleHtml": "Default Title",
		"titleIndicatorHtml": undefined,
		"titleClass": "",
		"optionClass": "",
		"optionList": []
	},

	"open": undefined,						// is the dropdown open?
	"optionList": undefined,				// list of views & wrappers used for dropdown entries

	"$header": undefined,
	"$headerContent": undefined,
	"$optionList": undefined,
	"$optionListContainer": undefined,

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);
		var self = this;

		this.options = opts;

		this.$el.addClass("dropdown");
		this.$el.append(_.template($("#templateDropdown").html(), {
			"titleHtml": opts.titleHtml,
			"titleClass": opts.titleClass,
			"titleIndicatorHtml": opts.titleIndicatorHtml
		}));

		this.$header = this.$el.find("[data-id='header']");
		this.$headerContent = this.$el.find("[data-id='headerContent']");
		this.$optionList = this.$el.find("[data-id='optionList']");
		this.$optionListContainer = this.$el.find("[data-id='optionListContainer']");

		this.$header.click(function (aEvent) {
			aEvent.stopPropagation();
			self.setOpen(!self.open, true);
		});

		this.optionList = _.map(opts.optionList, function (aElem) {
			var entry = self.createEntry(aElem);
			self.$optionList.append(entry.$wrapper);
			return entry;
		});

		this.setOpen(opts.open, false);
	},

	"setTitleHtml": function (aHtml) {
		this.$headerContent.html(aHtml);
	},

	/**
	 * Creates a dropdown entry from the provided view.
	 * @param  {Object} aView Entry view
	 * @return {Object} Created entry jQuery element
	 */
	"createEntry": function (aView) {
		// Check if Backbone view.
		var elem = aView.$el || aView;

		// Silly me, simply using a template to autogenerate HTML unbinds all events
		// in the child entry view.
		var $wrapper = $(_.template($("#templateDropdownOption").html(), {
			"optionClass": this.options.optionClass
		}));

		return {
			"view": aView,
			"$wrapper": $wrapper.append(elem)
		};
	},

	"add": function (aView, aIndex, aClickFn, aAnimated) {
		var index = aIndex;
		var animate = aAnimated == null? true : !!aAnimated;
		var newEntry = this.createEntry(aView);

		if (aClickFn)
			newEntry.$wrapper.click(aClickFn);

		if (index == null) {
			this.optionList.push(newEntry);
			this.$optionList.append(newEntry.$wrapper);
		} else {
			this.optionList.splice(index, 0, newEntry);
			if (index === 0)
				this.$optionList.prepend(newEntry.$wrapper);
			else if (index === this.optionList.length - 1)
				this.$optionList.append(newEntry.$wrapper);
			else
				this.$optionList.children().eq(index).before(newEntry.$wrapper);
		}

		return this;
	},

	"remove": function (aIndex, aAnimated) {
		var animate = aAnimated == null? true : !!aAnimated;
		this.optionList[aIndex].$wrapper.detach();
		this.optionList.splice(aIndex, 1);
		return this;
	},

	"setActive": function (aIndex, aActive) {
		var item = this.optionList[aIndex];
		if (item) {
			if (aActive)
				item.$wrapper.addClass("active");
			else
				item.$wrapper.removeClass("active");
		}
	},

	"setOpen": function (aOpen, aAnimate) {
		if (this.open !== aOpen) {
			var self = this;
			var targetHeight = 0;
			var targetOpacity = 0;

			this.open = aOpen;

			if (aOpen) {
				this.$header.addClass("active");
				this.$optionListContainer.show();
				targetHeight = this.$optionList.outerHeight();
				targetOpacity = 1.0;
			} else {
				this.$header.removeClass("active");
				if (!aAnimate)
					self.$optionListContainer.hide();
			}

			if (aAnimate) {
				this.$optionListContainer.animate({
					"height": targetHeight,
					"opacity": targetOpacity
				}, 300, function () {
					if (!self.open)
						self.$optionListContainer.hide();
					else
						self.$optionListContainer.css("height", "auto");
				});
			} else {
				this.$optionListContainer.css({
					"height": targetHeight,
					"opacity": targetOpacity
				});
			}
		}
		return this;
	},

	"destroy": function () {
		var self = this;
		this.$el.fadeTo(200, 0.0, function () {
			self.$el.detach();
		});
		return this;
	},

	"appendTo": function (aView) {
		aView.append(this.$el);
		return this;
	}
});
