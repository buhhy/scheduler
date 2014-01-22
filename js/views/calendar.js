Scheduler.views.Calendar = Scheduler.views.View.extend({
	"defaults": {
		"startTime": 0,						// Calendar start time in minutes
		"endTime": 24 * 60,					// Calendar end time in minutes
		"interval": 60,						// Intervals between time lines in minutes
		"userData": undefined,				// Default data model
		"selectedSectionList": undefined 	// List of selected sections on the calendar
	},

	// The calendar displays an extra 30 minutes at the top.
	"CALENDAR_START_TIME_OFFSET": 30,

	"options": undefined,
	"userData": undefined,

	// A hashmap of elements mapped by the class id.
	"sectionViewList": undefined,
	"columnList": undefined,

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);
		var self = this;

		this.options = opts;
		this.sectionViewList = {};

		var timeLabels = [];

		// The time labels should begin 30 minutes after the start time.
		for (var i = opts.startTime + this.CALENDAR_START_TIME_OFFSET;
			i < opts.endTime; i += opts.interval) {

			timeLabels.push(this.minutesToStringFormat(i));
		}

		this.$calendar = $(_.template($("#templateCalendar").html(), {
			"labels": timeLabels
		}));

		this.$el.append(this.$calendar);

		this.userData = opts.userData;

		// Find the table columns which will be containing all the event views, then wrap them all
		// inside jQuery wrapper objects, because accessing each element of a jQuery selector
		// returns not the jQuery-ized element, but the bare element.
		this.columnList = this.$el.find(".position-container").map(function (aIndex, aElem) {
			return $(aElem);
		});

		this.bindEvents();
		this.refreshData();
		this.refreshSelection();
	},

	"bindEvents": function () {
		var self = this;

		// Sets event listener for data collection.
		this.userData.get("userClassList").on("all", function (aModel, aResponse) {
			self.refreshData();
			self.refreshSelection();
		});

		this.options.selectedSectionList.on("all", function () {
			self.refreshSelection();
		});
	},

	"refreshData": function () {
		var self = this;

		_.each(this.sectionViewList, function (aView) {
			aView.detachElements();
		});

		this.sectionViewList = {};
		this.userData.get("userClassList").map(function (aSectionModel) {
			var newEntryGroup = new Scheduler.views.CalendarEntryGroup({
				"sectionModel": aSectionModel,
				"calendarColumns": self.columnList,
				"calendarStartTime": self.options.startTime,
				"calendarEndTime": self.options.endTime
			});

			newEntryGroup.click(function (aSection, aCalendarGroup) {
				self.selectSection(aSection);
			});

			self.sectionViewList[aSectionModel.id] = newEntryGroup;
		});

		_.each(this.sectionViewList, function (aView) {
			aView.attachElementsToView();
		});
	},

	"refreshSelection": function () {
		var self = this;
		var changed = {};

		self.options.selectedSectionList.forEach(function (aSection) {
			changed[aSection.id] = true;
		});

		_.forEach(self.sectionViewList, function (aElem, aKey) {
			aElem.setSelected(!!changed[aKey]);
		});
	},

	"selectSection": function (aSection) {
		// Currently, only one item can be selected at a time. Clicking on a selected item will
		// deselect it, while clicking on another item will deselect all previous items and select
		// the newly clicked entry.
		if (this.options.selectedSectionList.get(aSection)) {
			this.options.selectedSectionList.remove(aSection)
		} else {
			this.options.selectedSectionList.reset(aSection);
		}
	},

	"minutesToStringFormat": function (aMin) {
		var pastNoon = aMin >= 12 * 60;
		var hour = Math.floor(aMin / 60) % 12 || 12;
		var min = aMin % 60;
		// return hour + ":" + this.padZeroes(min, 2) + (pastNoon ? " PM" : " AM");
		return hour + (pastNoon ? " PM" : " AM");
	},

	"padZeroes": function (aInt, aLength) {
		var str = aInt + "";
		return str.length >= aLength ? str : (new Array(aLength - str.length + 1)).join("0") + str;
	}
});
