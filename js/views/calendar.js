Scheduler.views.Calendar = Scheduler.views.View.extend({
	"defaults": {
		"startTime": 0,				// Calendar start time in minutes
		"endTime": 24 * 60,			// Calendar end time in minutes
		"interval": 60,				// Intervals between time lines in minutes
		"sectionList": undefined
	},

	// The calendar displays an extra 30 minutes at the top.
	"CALENDAR_START_TIME_OFFSET": 30,

	"options": undefined,

	// A hashmap of elements mapped by the class id.
	"sectionViewList": undefined,
	"columnList": undefined,

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);
		var self = this;

		this.options = opts;
		this.sectionViewList = [];

		var timeLabels = [];

		for (var i = opts.startTime; i < opts.endTime; i += opts.interval)
			timeLabels.push(this.minutesToStringFormat(i));

		this.$calendar = $(_.template($("#templateCalendar").html(), {
			"labels": timeLabels
		}));

		this.$el.append(this.$calendar);
		this.columnList = this.$el.find(".position-container").map(function (aIndex, aElem) {
			return $(aElem);
		});

		// Sets event listener for data collection.
		opts.sectionList.on("all", function (aModel, aResponse) {
			self.refreshData(aModel);
		});

		this.refreshData(opts.sectionList);
	},

	"refreshData": function (aData) {
		var self = this;

		this.sectionViewList = this.options.sectionList.map(function (aSectionModel) {
			return new Scheduler.views.CalendarEntryGroup({
				"sectionModel": aSectionModel,
				"calendarColumns": self.columnList,
				"calendarStartTime": self.options.startTime - self.CALENDAR_START_TIME_OFFSET,
				"calendarEndTime": self.options.endTime
			});
		});

		_.each(this.sectionViewList, function (aView) {
			aView.attachElementsToView();
		});
	},

	"minutesToStringFormat": function(aMin) {
		var pastNoon = aMin >= 12 * 60;
		var hour = Math.floor(aMin / 60) % 12 || 12;
		var min = aMin % 60;
		// return hour + ":" + this.padZeroes(min, 2) + (pastNoon ? " PM" : " AM");
		return hour + (pastNoon ? " PM" : " AM");
	},

	"padZeroes": function(aInt, aLength) {
		var str = aInt + "";
		return str.length >= aLength ? str : (new Array(aLength - str.length + 1)).join("0") + str;
	}
});

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

		return _.flatten(_.map(baseClasses, function (aClassModel) {
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
	}
});

Scheduler.views.CalendarEntry = Scheduler.views.View.extend({
	"defaults": {
		"weekday": undefined,
		"sectionModel": undefined,
		"classModel": undefined,
		"calendarStartTime": 0,
		"calendarEndTime": 24 * 60
	},

	"options": undefined,
	"weekday": -1,

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);

		this.options = opts;
		this.weekday = opts.weekday;

		this.setElement(this.buildElement(opts.sectionModel, opts.classModel));
		this.reposition();
	},

	"buildElement": function (aSectionModel, aClassModel) {
		var sectionSplit = aSectionModel.get("section").split(" ");

		return $(_.template($("#templateCalendarEntry").html(), {
			"name": aSectionModel.get("title"),
			"subject": aSectionModel.get("subject"),
			"catalog": aSectionModel.get("catalog_number"),
			"section": sectionSplit[1],
			"type": sectionSplit[0],
			"location": aClassModel.get("location")
		}));
	},

	"reposition": function () {
		var cst = this.options.calendarStartTime;
		var cet = this.options.calendarEndTime;

		var classStartTime = this.parseTime(this.options.classModel.get("dates").start_time);
		var classEndTime = this.parseTime(this.options.classModel.get("dates").end_time);

		var totalTime = cet - cst;
		var top = 100.0 * (classStartTime - cst) / totalTime;
		var height = 100.0 * (classEndTime - classStartTime) / totalTime;

		this.$el.css("top", top + "%");
		this.$el.css("height", height + "%");
	},

	/**
	 * Parses time in the format hh:mm.
	 */
	"parseTime": function (aTimeStr) {
		var split = aTimeStr.split(":");
		return parseInt(split[0]) * 60 + parseInt(split[1]);
	}
});