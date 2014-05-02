/**
 * These models store user-set themes, unlike ThemeData, which stores global theme data, such as
 * which colors can be changed and the list of selectable colors.
 */

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

Scheduler.models.ThemeCollection = Scheduler.models.Collection.extend({
	"model": Scheduler.models.Theme
});

Scheduler.models.GlobalTheme = Scheduler.models.Model.extend({
	"defaults": function () {
		return {
			"tableTheme": new Scheduler.models.Theme(),
			"daysTheme": new Scheduler.models.Theme({
				"borderColor": ""
			}),
			"timeTheme": new Scheduler.models.Theme({
				"borderColor": ""
			})
		}
	},

	"initialize": function () {
		Scheduler.models.Model.prototype.initialize.call(this);
	},

	"parse": function (aResp) {
		aResp.tableTheme = this.getAndSet("tableTheme", aResp);
		aResp.daysTheme = this.getAndSet("daysTheme", aResp);
		aResp.timeTheme = this.getAndSet("timeTheme", aResp);

		return aResp;
	},
});