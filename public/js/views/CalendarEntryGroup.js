/**
 * A group of class calendar entries that belong to the same section. This aggregation makes it
 * easier to style each set of classes.
 */
Scheduler.views.CalendarEntryGroup = Scheduler.views.View.extend({
	"defaults": {
		"sectionModel": undefined,
		"calendarColumns": [],
		"calendarSettings": undefined
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
		var baseClasses = aSectionModel.get("classList").filter(function (aClass) {
			return aClass.get("startTime") && aClass.get("endTime");
		});
		var self = this;

		return _.flatten(_.map(_.filter(baseClasses, function (aClassModel) {
			return aClassModel.get("indexedWeekdays");
		}), function (aClassModel) {
			return _.map(aClassModel.get("indexedWeekdays"), function (aDay) {
				return new Scheduler.views.CalendarEntry({
					"weekday": aDay,
					"calendarSettings": self.options.calendarSettings,
					"sectionModel": self.options.sectionModel,
					"classModel": aClassModel
				});
			});
		}));
	},

	"attachElementsToView": function (aTimesCount) {
		var self = this;

		_.forEach(this.elementList, function (aElem) {
			var target = self.options.calendarColumns[aElem.weekday];
			aElem.reposition(aTimesCount || {});
			target.append(aElem.$el);
		});
	},

	"detachElements": function () {
		var self = this;

		_.forEach(this.elementList, function (aElem) {
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
