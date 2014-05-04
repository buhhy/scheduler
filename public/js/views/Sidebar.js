Scheduler.views.Sidebar = Scheduler.views.View.extend({
	"defaults": {
		"indicator": undefined
	},

	"index": 0,

	"contextGroup": undefined,

	"$indicator": undefined,

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);
		var self = this;

		this.$indicator = $(opts.indicator);

		this.$el.find("[data-id='nextBtn']").click(function () {
			self.contextGroup.next();
		});

		this.$el.find("[data-id='backBtn']").click(function () {
			self.contextGroup.previous();
		});
	},

	"show": function (aAnimated) {
		var time = aAnimated ? 400 : 0;

		this.$indicator.addClass("active");
		this.$el.show();
		this.$el.fadeTo(time, 1.0);
	},

	"hide": function (aAnimated) {
		var time = aAnimated ? 400 : 0;
		var self = this;

		self.$indicator.removeClass("active");
		self.$el.fadeTo(time, 0.0, function () {
			self.$el.hide();
		});
	},

	"onShow": function () {},	// called when this sidebar enters the view
	"onHide": function () {},	// called when this sidebar disappears

	"setOnIndicatorClick": function (aClickFn) {
		this.$indicator.click(aClickFn);
	},

	"setIndex": function (aIndex) {
		this.index = aIndex;

		this.$el.css("left", aIndex * 100 + "%");
	},

	"setContextGroup": function (aContextGroup) {
		this.contextGroup = aContextGroup;
	},

	"getDropdownListEntryHtml": function () {
		return _.template($("#templateDropdownListEntry").html());
	}
});