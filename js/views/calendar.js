Scheduler.views.Calendar = Scheduler.views.View.extend({
	"defaults": {
		"startTime": 0,
		"endTime": 24 * 60,
		"model": undefined
	},

	"model": undefined,

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);
		var self = this;

		this.model = opts.model;
	}
});
