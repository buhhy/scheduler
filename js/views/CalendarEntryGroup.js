/**
 * A group of class calendar entries that belong to the same section. This aggregation makes it
 * easier to style each set of classes.
 */
Scheduler.views.CalendarEntryGroup = Scheduler.views.View.extend({
	"defaults": {
		"sectionModel": undefined,
		"calendarColumns": [],
		"calendarStartTime": 0,
		"calendarEndTime": 24 * 60
	},

	"WEEKDAYS_REGEX": /^(M?)((?:T(?:(?!h)))?)(W?)((?:Th)?)(F?)$/,
	"WEEKDAYS_INDEX_LOOKUP": {
		"M": 1,
		"T": 2,
		"W": 3,
		"Th": 4,
		"F": 5
	},

	"options": undefined,
	"elementList": [],

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);

		this.options = opts;

		this.elementList = this.buildElements(opts.sectionModel);
	},

	"buildElements": function (aSectionModel) {
		var baseClasses = aSectionModel.get("classes").filter(function (aClass) {
			return !(aClass.get("start_time") || aClass.get("end_time"));
		});
		var self = this;

		return _.flatten(_.map(_.filter(baseClasses, function (aClassModel) {
			return aClassModel.get("dates").weekdays;
		}), function (aClassModel) {
			/*
			This will return a list of matched strings using regex in this format, assuming the
			following input string "TThF":

			[ "TThF", "", "T", "", "Th", "F" ]

			This array will need to be filtered, and converted into a list of day indices.
			 */
			var rawDays = aClassModel.get("dates").weekdays.match(self.WEEKDAYS_REGEX).slice(1);
			var days = _.map(
				_.filter(rawDays, function (aDay) {
					return aDay || aDay.length;
				}), function (aDay) {
					return self.WEEKDAYS_INDEX_LOOKUP[aDay];
				});

			return _.map(days, function (aDay) {
				return new Scheduler.views.CalendarEntry({
					"weekday": aDay,
					"calendarStartTime": self.options.calendarStartTime,
					"calendarEndTime": self.options.calendarEndTime,
					"sectionModel": self.options.sectionModel,
					"classModel": aClassModel
				});
			});
		}));
	},

	"attachElementsToView": function () {
		var self = this;

		_.each(this.elementList, function (aElem) {
			var target = self.options.calendarColumns[aElem.weekday];
			aElem.reposition();
			target.append(aElem.$el);
		});
	},

	"detachElements": function () {
		var self = this;

		_.each(this.elementList, function (aElem) {
			aElem.detachFromView();
		})
	}
});
