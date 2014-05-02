Scheduler.models.UserData = Scheduler.models.Model.extend({
	"defaults": function () {
		return {
			"globalTheme": new Scheduler.models.GlobalTheme(),
			"calendarSettings": new Scheduler.models.CalendarSettings(),
			"userClassList": new Scheduler.models.SectionCollection(),
			"hash": undefined
		};
	},

	"imgUrl": "/api/imgify/%s",
	"pdfUrl": "/api/pdfify/%s",
	"urlRoot": "/api/user/schedule",
	"idAttribute": "hash",

	"initialize": function () {
		Scheduler.models.Model.prototype.initialize.call(this);

		if (this.get("hash") !== undefined)
			this.fetch();
	},

	"parse": function (aResp) {
		aResp.globalTheme = this.getAndSet("globalTheme", aResp);
		aResp.calendarSettings = this.getAndSet("calendarSettings", aResp);
		aResp.userClassList = this.getAndSet("userClassList", aResp);

		return aResp;
	},

	"save": function (aSync, aCallback) {
		var self = this;

		$.ajax({
			"method": "POST",
			"contentType": "application/json",
			"url": "/api/user/schedule",
			"data": JSON.stringify(this),
			"async": !aSync
		}).done(function (aResp) {
			self.set("hash", aResp.hash);
			if (aCallback)
				aCallback(aResp.hash);
		});
	},

	"saveAndSend": function (aUrl, aSync, aCallback) {
		var self = this;

		this.save({
			"async": !aSync,
			"success": function (aModel) {
				$.ajax({
					"method": "POST",
					"contentType": "application/json",
					"url": sprintf(aUrl, aModel.get("hash")),
					"async": !aSync
				}).done(function (aResp) {
					if (aCallback)
						aCallback(aResp.path);
				});
			},
			"error": function (aError) {
				console.log(aError);
			}
		});
	},

	"pdfify": function (aSync, aCallback) { this.saveAndSend(this.pdfUrl, aSync, aCallback); },
	"imgify": function (aSync, aCallback) { this.saveAndSend(this.imgUrl, aSync, aCallback); }
});