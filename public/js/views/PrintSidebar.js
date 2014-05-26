Scheduler.views.PrintSidebar = Scheduler.views.Sidebar.extend({
	"defaults": {
		"userData": undefined,
		"appId": undefined
	},

	"initialize": function (aOpts) {
		Scheduler.views.Sidebar.prototype.initialize.call(this, aOpts);
		var opts = _.defaults(aOpts, this.defaults);
		var self = this;

		this.options = opts;

		this.setUpListeners();
		this.setUpFacebook();
	},

	"setUpListeners": function () {
		var self = this;
		var dialogParams = [
			"directories=no",
			"titlebar=no",
			"toolbar=no",
			"location=no",
			"status=no",
			"menubar=no",
			"scrollbars=no",
			"resizable=yes",
			"width=600",
			"height=300"
		].join(",");

		this.$el.find("#savePdfButton").click(function () {
			var dialog = window.open("loading/pdf", "", dialogParams);
			self.options.userData.pdfify(function (aUrl) {
				console.log(aUrl);
				dialog.location.href = aUrl;
			});
		});

		this.$el.find("#shareButton").click(function () {
			var dialog = window.open("loading/img", "", dialogParams);

			self.options.userData.imgify(function (aPath) {
				dialog.location.href = [
					"https://www.facebook.com/dialog/share?",
					"app_id=", self.options.appId,
					"&display=popup",
					"&href=", sprintf("%s//%s/preview/%s/img", window.location.protocol, window.location.host, self.options.userData.get("hash")), // TODO: less hacky here plz
					"&redirect_uri=", window.location.href
				].join("");
				dialog.focus();
			});
		});

		this.$el.find("[data-id='resetBtn']").click(function () {
			self.contextGroup.first();
			self.options.userData.reset();
		});
	},

	"setUpFacebook": function () {
		FB.init({
			"appId": this.options.appId,
			"status": true,
			"cookie": true,
			"xfbml": true
		});
	}
});