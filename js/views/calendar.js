Scheduler.views.Calendar = Scheduler.views.View.extend({
	"defaults": {
		"startTime": 0,				// Calendar start time in minutes
		"endTime": 24 * 60,			// Calendar end time in minutes
		"interval": 60,				// Intervals between time lines in minutes
		"model": undefined
	},

	"model": undefined,

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);
		var self = this;

		this.model = opts.model;

		var timeLabels = [];

		for (var i = opts.startTime; i < opts.endTime; i += opts.interval)
			timeLabels.push(this.minutesToStringFormat(i));

		this.$calendar = _.template($("#templateCalendar").html(), {
			"labels": timeLabels
		});

		this.$el.append(this.$calendar);
	},

	"minutesToStringFormat": function(aMin) {
		var pastNoon = aMin >= 12 * 60;
		var hour = Math.floor(aMin / 60) % 12 || 12;
		var min = aMin % 60;
		// return hour + ":" + this.padZeroes(min, 2) + (pastNoon ? " PM" : " AM");
		return hour + (pastNoon ? " PM" : " AM");
	},

	"padZeroes": function(aInt, aLength) {
		var str = aInt + "";
		return str.length >= aLength ? str : (new Array(aLength - str.length + 1)).join("0") + str;
	}
});
