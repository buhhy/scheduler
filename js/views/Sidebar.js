Scheduler.views.Sidebar = Scheduler.views.View.extend({
	"defaults": {
		"indicatorGroup": undefined,
		"currentPage": 0
	},

	"currentPage": 0,
	"numPage": 0,

	"$indicator": undefined,
	"$indicators": undefined,
	"$sidebars": undefined,
	"$sidebarSlider": undefined,

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);
		var self = this;

		this.options = opts;
		this.$indicatorGroup = $(opts.indicatorGroup);
		this.$indicators = this.$indicatorGroup.find(".indicator");
		this.$sidebars = this.$el.find(".sidebar");
		this.$sidebarSlider = this.$el.find("#sidebarSlider");
		this.currentPage = opts.currentPage;
		this.numPage = this.$sidebars.size();

		this.$sidebars.each(function (aIndex, aElem) {
			$elem = $(aElem);
			$elem.css("left", aIndex * 100 + "%");

			if (aIndex === self.currentPage) {
				$elem.fadeTo(0, 1.0);
				$elem.show();
			} else {
				$elem.fadeTo(0, 0.0);
				$elem.hide();
			}
		});

		this.setIndicatorStatus(this.currentPage);
	},

	"next": function () {
		this.transition(1);
	},

	"previous": function () {
		this.transition(-1);
	},

	"transition": function (aOffset) {
		var newOffset = this.currentPage + aOffset;

		if (newOffset < this.numPage && newOffset >= 0) {
			var fromPage = this.$sidebars.eq(this.currentPage);
			var toPage = this.$sidebars.eq(newOffset);

			this.setIndicatorStatus(newOffset);
			this.$sidebarSlider.animate({ "left": newOffset * -100 + "%" }, 500);

			fromPage.fadeTo(500, 0.0);
			toPage.fadeTo(500, 1.0);

			this.currentPage = newOffset;
		}
	},

	"setIndicatorStatus": function (aCurrentPage) {
		this.$indicators.each(function (aIndex, aElem) {
			$elem = $(aElem);

			if (aIndex === aCurrentPage)
				$elem.addClass("active");
			else
				$elem.removeClass("active");
		});
	}
});