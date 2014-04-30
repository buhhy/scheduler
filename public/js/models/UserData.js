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

	"initialize": function () {
		Scheduler.models.Model.prototype.initialize.call(this);
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

		this.save(aSync, function (aHash) {
			$.ajax({
				"method": "POST",
				"contentType": "application/json",
				"url": sprintf(aUrl, aHash),
				"async": !aSync
			}).done(function (aResp) {
				if (aCallback)
					aCallback(aResp.path);
			});
		});
	},

	"pdfify": function (aSync, aCallback) { this.saveAndSend(this.pdfUrl, aSync, aCallback); },
	"imgify": function (aSync, aCallback) { this.saveAndSend(this.imgUrl, aSync, aCallback); }
});