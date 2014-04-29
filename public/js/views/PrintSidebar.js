Scheduler.views.PrintSidebar = Scheduler.views.Sidebar.extend({
	"defaults": {
		"userData": undefined,
		"imgUrl": "/api/imgify/%s",
		"pdfUrl": "/api/pdfify/%s"
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
			self.convertToPdf(false);
		});

		this.$el.find("#printPdfButton").click(function () {
			self.convertToPdf(true);
			// window.print();
		});

		this.$el.find("#shareButton").click(function () {
			self.convertToImage(function (aItem) {
				console.log(aItem);
			});
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
	},

	"convertToImage": function (aCallback) {
		var hash = "c";
		$.ajax({
			"method": "POST",
			"contentType": "application/json",
			"url": sprintf(this.options.imgUrl, hash)
		}).done(function (aResp) {
			aCallback(aResp);
		});
	},

	"convertToPdf": function (aPrint) {
		// TODO: this is really hacky lol, change this at some point
		var hash = "c";

		if (!this.hiddenForm) {
			var hiddenForm = document.createElement("form");
			hiddenForm.action = sprintf(this.options.pdfUrl, hash);
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