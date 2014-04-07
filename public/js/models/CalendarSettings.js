Scheduler.models.CalendarSettings = Scheduler.models.Model.extend({
	"defaults": {
		"startTime": 8 * 60 +30,
		"endTime": 22 * 60 + 30,
		"interval": 60,
		"autofit": false
	},

	"initialize": function () {
		Scheduler.models.Model.prototype.initialize.call(this);
	}
});
