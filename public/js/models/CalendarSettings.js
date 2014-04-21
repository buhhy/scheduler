Scheduler.models.CalendarSettings = Scheduler.models.Model.extend({
	"defaults": {
		"startTime": 8 * 60 +30,
		"endTime": 22 * 60 + 30,
		"interval": 60,
		"startOffset": 30,
		"autofit": false,
		// different styling applied to classes of different lengths in minutes
		"thresholds": [
			{ name: "mini", threshold: 30},
			{ name: "short", threshold: 60},
			{ name: "regular", threshold: 90},
			{ name: "long", threshold: Number.MAX_VALUE}
		]
	},

	"initialize": function () {
		Scheduler.models.Model.prototype.initialize.call(this);
	}
});
