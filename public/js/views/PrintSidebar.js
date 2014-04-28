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

		this.setUpFacebook();
	},

	"setUpFacebook": function () {
		FB.Event.subscribe("auth.authResponseChange", function (aResp) {
		});

		FB.init({
			"appId": "1390085397942073",
			"status": true,
			"cookie": true,
			"xfbml": true
		});

		FB.ui({
			"method": "feed",
			"link": "www.google.com",
			"caption": "Test"
		}, function (aResp) {
			console.log(aResp);
		});

		FB.getLoginStatus(function (aResp) {
			if (aResp.status === "connected") {
				console.log("connected");

				FB.api('/me', function(response) {
					console.log(response);
				});
			} else if (aResp.status === "not_authorized") {
				console.log("not authorized");
			} else {
				console.log("not logged in");
			}
		});
	},

	"convertToPdf": function (aPrint) {
		// TODO: this is really hacky lol, change this at some point
		if (!this.hiddenForm) {
			var hiddenForm = document.createElement("form");
			hiddenForm.action = "/api/print/5";
			hiddenForm.method = "POST";
			hiddenForm.target = "_blank";
			hiddenForm.style.display = "none";

			var jsonInput = document.createElement("input");
			jsonInput.name = "data";

			var printAfter = document.createElement("input");
			printAfter.name = "print";

			hiddenForm.appendChild(jsonInput);
			hiddenForm.appendChild(printAfter);

			this.hiddenForm = hiddenForm;
			this.jsonInput = jsonInput;
			this.printAfter = printAfter;
			document.body.appendChild(hiddenForm);
		}

		this.jsonInput.value = JSON.stringify(this.options.userData);
		this.printAfter.value = !!aPrint;

		this.hiddenForm.submit();

		console.log(hiddenForm);
		console.log(JSON.stringify(this.options.userData, null, "  "));
	}
});