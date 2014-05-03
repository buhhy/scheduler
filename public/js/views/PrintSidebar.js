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
			self.options.userData.pdfify(function (aUrl) {
				console.log(aUrl);
				window.open(aUrl, "_blank");
			}, true);
		});

		this.$el.find("#printPdfButton").click(function () {
			self.options.userData.pdfify(function (aUrl) {
				console.log(aUrl);
				self.printPdf(aUrl);
			});
		});

		this.$el.find("#shareButton").click(function () {
			// TODO: add loading page here
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
			var dialog = window.open("about:blank", "", dialogParams);

			self.options.userData.imgify(function (aPath) {
				dialog.location.href = [
					"https://www.facebook.com/dialog/share?",
					"app_id=1390085397942073",
					"&display=popup",
					"&href=", sprintf("%s://%s/preview/%s/img", window.location.protocol, window.location.host, self.options.userData.get("hash")), // TODO: less hacky here plz
					"&redirect_uri=", window.location.href
				].join("");
				dialog.focus();
			}, true);
		});
	},

	"setUpFacebook": function () {
		FB.init({
			"appId": "1390085397942073",
			"status": true,
			"cookie": true,
			"xfbml": true
		});
	},

	"printPdf": function (aUrl) {
		var $iFrame = $('<iframe></iframe>');

		$iFrame.ready(function () {
			var tempFrame = $iFrame[0];
			var tempFrameWindow = tempFrame.contentWindow? tempFrame.contentWindow : tempFrame.contentDocument.defaultView;
			tempFrameWindow.focus();
			tempFrameWindow.print();
			$iFrame.detach();
		});

		$iFrame
				.attr("id", "printframe")
				.attr("name", "printframe")
				.attr("src", aUrl)
				.css("width", "0")
				.css("height", "0")
				.css("position", "absolute")
				.css("left", "-1000px")
				.css("top", "0")
				.appendTo($("body"));
	}
});