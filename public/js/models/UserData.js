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

	"save": function (aCallback) {
		var self = this;

		$.ajax({
			"method": "POST",
			"contentType": "application/json",
			"url": "/api/user/schedule",
			"data": JSON.stringify(this)
		}).done(function (aResp) {
			self.set("hash", aResp.hash);
			if (aCallback)
				aCallback(aResp.hash);
		});
	},

	"saveAndSend": function (aUrl, aCallback) {
		var self = this;

		this.save(function (aHash) {
			$.ajax({
				"method": "POST",
				"contentType": "application/json",
				"url": sprintf(aUrl, aHash)
			}).done(function (aResp) {
				if (aCallback)
					aCallback(aResp);
			});
		});
	},

	"pdfify": function (aCallback) { this.saveAndSend(this.pdfUrl, aCallback); },
	"imgify": function (aCallback) { this.saveAndSend(this.imgUrl, aCallback); }
});