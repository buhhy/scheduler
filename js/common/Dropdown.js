if (!window.Common)
	window.Common = {};

Common.Dropdown = Backbone.View.extend({
	"defaults": {
		"open": false,
		"titleHtml": "Default Title",
		"titleIndicatorHtml": undefined,
		"titleClass": "",
		"optionClass": "",
		"optionList": []
	},

	"open": undefined,
	"optionList": undefined,
	"optionViewList": undefined,

	"$header": undefined,
	"$optionList": undefined,
	"$optionListContainer": undefined,

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);
		var self = this;

		this.optionList = opts.optionList.slice();

		this.$el.addClass("dropdown");
		this.$el.append(_.template($("#templateDropdown").html(), {
			"titleHtml": opts.titleHtml,
			"titleClass": opts.titleClass,
			"titleIndicatorHtml": opts.titleIndicatorHtml
		}));

		this.$header = this.$el.find("[data-id='header']");
		this.$optionList = this.$el.find("[data-id='optionList']");
		this.$optionListContainer = this.$el.find("[data-id='optionListContainer']");

		this.$header.click(function (aEvent) {
			self.setOpen(!self.open, true);
		});

		this.optionViewList = _.map(this.optionList, function (aElem) {
			// Check if Backbone view.
			var elem = aElem;
			if (aElem.$el)
				elem = aElem.$el;

			// Silly me, simply using a template to autogenerate HTML unbinds all events
			// in the child entry view.
			var $wrapper = $(_.template($("#templateDropdownOption").html(), {
				"optionClass": opts.optionClass
			}));

			$wrapper.append(elem);

			self.$optionList.append($wrapper);
		});

		this.setOpen(opts.open, false);
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
	},

	"destroy": function () {
		var self = this;
		this.$el.fadeTo(200, 0.0, function () {
			self.$el.detach();
		});
	},

	"appendTo": function (aView) {
		aView.append(this.$el);
	}
});

$(function () {
	// $(".dropdown").click(function (aEvent) {
	// 	aEvent.stopPropagation();
	// 	$(this).toggleClass("active");
	// });

	// $(document).click(function() {
	// 	// all dropdowns
	// 	$(".dropdown").removeClass('active');
	// });
});