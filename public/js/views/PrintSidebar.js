Scheduler.views.PrintSidebar = Scheduler.views.Sidebar.extend({
	"defaults": {
		"userData": undefined
	},

	"$btnPdf": undefined,
	"$btnPrint": undefined,
	"$btnSave": undefined,

	"initialize": function (aOpts) {
		Scheduler.views.Sidebar.prototype.initialize.call(this, aOpts);
		var opts = _.defaults(aOpts, this.defaults);

		this.options = opts;

		this.$el.find("#printButton").click(function () {
			window.print();
		});
	}
});