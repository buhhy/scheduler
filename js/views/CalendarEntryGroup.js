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

	"options": undefined,
	"elementList": [],
	"selected": false,

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
			return _.map(aClassModel.get("dates").indexedWeekdays, function (aDay) {
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
	},

	"click": function (aCallback) {
		var self = this;
		_.forEach(this.elementList, function (aElem) {
			aElem.click(function () {
				aCallback(self.options.sectionModel, self);
			});
		});
	},

	"setSelected": function (aSelected) {
		if (this.selected !== aSelected) {
			this.selected = aSelected;

			_.forEach(this.elementList, function (aElem) {
				aElem.setSelected(aSelected);
			});
		}
	},

	"isSelected": function () {
		return this.selected;
	}
});
