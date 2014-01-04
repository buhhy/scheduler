Scheduler.models.ScheduleData = Scheduler.models.Model.extend({
	"defaults": function () {
		return {
			"sectionList": new Scheduler.models.SectionCollection()
		};
	},

	"addClass"
});