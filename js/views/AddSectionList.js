Scheduler.views.AddSectionList = Scheduler.views.View.extend({
	"defaults": {
		"sectionList": undefined	// Default data model
	},

	"options": undefined,
	"sectionList": undefined,

	// A hashmap of elements mapped by the class id.
	"sectionViewList": undefined,

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);
		var self = this;

		this.options = opts;
		this.sectionViewList = [];

		this.sectionList = this.sectionList || new Scheduler.models.SectionCollection();

		// Sets event listener for data collection.
		this.sectionList.on("all", function (aModel, aResponse) {
			self.refreshData();
		});

		this.refreshData();
	},

	"refreshData": function () {
		var self = this;

		this.sectionViewList = this.sectionList.map(function (aSectionModel) {
			return new Scheduler.views.CalendarEntryGroup({
				"sectionModel": aSectionModel,
				"calendarColumns": self.columnList,
				"calendarStartTime": self.options.startTime,
				"calendarEndTime": self.options.endTime
			});
		});

		_.each(this.sectionViewList, function (aView) {
			aView.attachElementsToView();
		});
	}
});