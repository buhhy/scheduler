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

	"saveAndSend": function (aUrl, aCallback, aSync) {
		var self = this;

		this.save(null, {
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

	"reset": function () {
		this.get("userClassList").reset();
	},

	"pdfify": function (aCallback, aSync) { this.saveAndSend(this.pdfUrl, aCallback, aSync); },
	"imgify": function (aCallback, aSync) { this.saveAndSend(this.imgUrl, aCallback, aSync); }
});