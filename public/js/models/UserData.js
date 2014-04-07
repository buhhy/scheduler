Scheduler.models.UserData = Scheduler.models.Model.extend({
	"defaults": function () {
		return {
			"globalTheme": new Scheduler.models.GlobalTheme(),
			"calendarSettings": new Scheduler.models.CalendarSettings(),
			"userClassList": new Scheduler.models.SectionCollection()
		};
	},

	"initialize": function () {
		Scheduler.models.Model.prototype.initialize.call(this);
	}
});