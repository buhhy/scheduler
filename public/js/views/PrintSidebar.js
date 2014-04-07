Scheduler.views.PrintSidebar = Scheduler.views.Sidebar.extend({
	"defaults": {
		"userData": undefined
	},

	"initialize": function (aOpts) {
		Scheduler.views.Sidebar.prototype.initialize.call(this, aOpts);
		var opts = _.defaults(aOpts, this.defaults);
		var self = this;

		this.options = opts;

		this.$el.find("#savePdfButton").click(function () {
			self.convertToPdf(false);
		});

		this.$el.find("#printPdfButton").click(function () {
			self.convertToPdf(true);
			// window.print();
		});
	},

	"convertToPdf": function (aPrint) {
		// TODO: this is really hacky lol, change this at some point
		var hiddenForm = document.createElement("form");
		hiddenForm.action = "/api/print/5";
		hiddenForm.method = "POST";
		hiddenForm.target = "_blank";

		var jsonInput = document.createElement("form");
		jsonInput.type = "hidden";
		jsonInput.value = JSON.stringify(this.options.userData);
		jsonInput.name = "data";

		hiddenForm.submit();
		// console.log(JSON.stringify(this.options.userData, null, "  "));
	}
});