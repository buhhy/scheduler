Scheduler.models.Theme = Scheduler.models.Model.extend({
	"defaults": {
		"backgroundColor": "#eee",
		"fontColor": "#444",
		"borderColor": "#ddd"
	},

	"initialize": function () {
		Scheduler.models.Model.prototype.initialize.call(this);
	}
});

Scheduler.models.GlobalTheme = Scheduler.models.Model.extend({
	"defaults": function () {
		return {
			"tableTheme": new Scheduler.models.Theme(),
			"daysTheme": new Scheduler.models.Theme({
				"borderColor": undefined
			}),
			"timeTheme": new Scheduler.models.Theme({
				"borderColor": undefined
			})
		}
	},

	"initialize": function () {
		Scheduler.models.Model.prototype.initialize.call(this);
	}
});