/**
 * These models store user-set themes, unlike ThemeData, which stores global theme data, such as
 * which colors can be changed and the list of selectable colors.
 */

// TODO: add default revertable theme settings
Scheduler.models.Theme = Scheduler.models.Model.extend({
	"defaults": function () {
		return {
			"backgroundColor": "#fff",
			"fontColor": "#177097",
			"borderColor": [ "#3790b7" ]
		};
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
			"tableTheme": new Scheduler.models.Theme({
				"borderColor": [ "#e8e8e8", "#f7f7f7" ],
				"fontColor": null
			}),
			"daysTheme": new Scheduler.models.Theme({
				"backgroundColor": "#57b0d7",
				"fontColor": "#177097",
				"borderColor": null
			}),
			"timeTheme": new Scheduler.models.Theme({
				"borderColor": null,
				"backgroundColor": "#fffff2",
				"fontColor": "#0694bb"
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