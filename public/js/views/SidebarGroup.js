Scheduler.views.SidebarGroup = Scheduler.views.View.extend({
	"defaults": {
		"sidebars": [],
		"currentPage": 0
	},

	"currentPage": 0,
	"numPage": 0,

	"sidebars": undefined,

	"$sidebarSlider": undefined,

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);
		var self = this;

		this.options = opts;
		this.sidebars = opts.sidebars;
		this.$sidebarSlider = this.$el.find("#sidebarSlider");
		this.currentPage = opts.currentPage;
		this.numPage = this.sidebars.length;

		$.each(this.sidebars, function (aIndex, aView) {
			aView.setIndex(aIndex);

			if (aIndex === self.currentPage) {
				aView.show();
				aView.onShow();
			} else {
				aView.hide();
			}

			aView.setOnIndicatorClick(function (aEvent) {
				aEvent.preventDefault();
				self.transition(aIndex - self.currentPage);
			});
		});
	},

	"next": function () {
		this.transition(1);
	},

	"previous": function () {
		this.transition(-1);
	},

	"transition": function (aOffset) {
		if (aOffset) {
			var newOffset = this.currentPage + aOffset;

			if (newOffset < this.numPage && newOffset >= 0) {
				var fromPage = this.sidebars[this.currentPage];
				var toPage = this.sidebars[newOffset];

				this.$sidebarSlider.animate({ "left": newOffset * -100 + "%" }, 500);

				fromPage.hide(true);
				fromPage.onHide();
				toPage.show(true);
				toPage.onShow();

				this.currentPage = newOffset;
			}
		}
	}
});