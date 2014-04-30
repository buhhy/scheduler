Scheduler.views.PrintSidebar = Scheduler.views.Sidebar.extend({
	"defaults": {
		"userData": undefined
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

		this.$el.find("#savePdfButton").click(function () {
			self.options.userData.pdfify();
		});

		this.$el.find("#printPdfButton").click(function () {
			self.options.userData.pdfify();
		});

		this.$el.find("#shareButton").click(function () {
			self.options.userData.imgify();
			// FB.ui({
			// 	"app_id": "1390085397942073",
			// 	"method": "feed",
			// 	"link": "www.google.com",
			// 	"caption": "Test",
			// 	"description": "Another test"
			// }, function (aResp) {
			// });
		});
	},

	"setUpFacebook": function () {
		// FB.Event.subscribe("auth.authResponseChange", function (aResp) {
		// });

		FB.init({
			"appId": "1390085397942073",
			"status": true,
			"cookie": true,
			"xfbml": true
		});

		// FB.getLoginStatus(function (aResp) {
		// 	if (aResp.status === "connected") {
		// 		console.log("connected");

		// 		FB.api('/me', function(response) {
		// 			console.log(response);
		// 		});
		// 	} else if (aResp.status === "not_authorized") {
		// 		console.log("not authorized");
		// 	} else {
		// 		console.log("not logged in");
		// 	}
		// });
	}
});