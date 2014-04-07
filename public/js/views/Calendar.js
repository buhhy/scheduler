Scheduler.views.Calendar = Scheduler.views.View.extend({
	"defaults": {
		"userData": undefined,				// Default data model
		"selectedSectionList": undefined 	// List of selected sections on the calendar
	},

	// The calendar displays an extra 30 minutes at the top.
	"START_TIME_OFFSET": 30,

	"options": undefined,

	// A hashmap of elements mapped by the class id.
	"sectionViewList": undefined,
	"columnList": undefined,

	"$timeTable": undefined,
	"$dayTable": undefined,
	"$timeLabels": undefined,
	"$dayLabels": undefined,

	"startTime": 0,						// Calendar start time in minutes
	"endTime": 24 * 60,					// Calendar end time in minutes
	"interval": 60,						// Intervals between time lines in minutes
	"autofit": false,					// Auto-fits the start and end bounds depending on classes

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);
		var self = this;
		var calendarSettings = opts.userData.get("calendarSettings");

		this.options = opts;
		this.sectionViewList = {};
		this.startTime = calendarSettings.get("startTime") || this.startTime;
		this.endTime = calendarSettings.get("endTime") || this.endTime;
		this.interval = calendarSettings.get("interval") || this.interval;
		this.autofit = !!calendarSettings.get("autofit");		// Converts to boolean

		var timeLabels = [];
		var dayLabels = [
			"<b>SUN</b>DAY",
			"<b>MON</b>DAY",
			"<b>TUE</b>SDAY",
			"<b>WED</b>NESDAY",
			"<b>THU</b>RSDAY",
			"<b>FRI</b>DAY",
			"<b>SAT</b>URDAY"
		];

		// The time labels should begin 30 minutes after the start time.
		for (var i = this.startTime + this.START_TIME_OFFSET; i < this.endTime; i += this.interval)
			timeLabels.push(this.minutesToStringFormat(i));

		this.$calendar = $(_.template($("#templateCalendar").html(), {
			"timeLabels": timeLabels,
			"dayLabels": dayLabels
		}));

		this.$el.append(this.$calendar);
		this.$el.addClass("cl");

		this.$timeTable = this.$el.find("[data-id='timeTable']");
		this.$dayTable = this.$el.find("[data-id='dayTable']");
		this.$timeLabels = this.$el.find("[data-id='timeLabel']");
		this.$dayLabels = this.$el.find("[data-id='dayLabel']");


		// Find the table columns which will be containing all the event views, then wrap them all
		// inside jQuery wrapper objects, because accessing each element of a jQuery selector
		// returns not the jQuery-ized element, but the bare element.
		this.columnList = this.$el
				.find("[data-id='positionContainer']")
				.map(function (aIndex, aElem) {
					return $(aElem);
				});

		this.bindEvents();
		this.refreshData();
		this.refreshSelection();
	},

	"bindEvents": function () {
		var self = this;
		var globalTheme = this.options.userData.get("globalTheme");
		var userClassList = this.options.userData.get("userClassList");

		// Sets event listener for data collection.
		userClassList.on("all", function (aModel, aResponse) {
			self.refreshData();
			self.refreshSelection();
		});

		globalTheme.get("tableTheme").on({
			"change:backgroundColor": function (aModel, aValue) {
				self.$el.css("background-color", aValue);
			}
		});

		globalTheme.get("daysTheme").on({
			"change:backgroundColor": function (aModel, aValue) {
				self.$dayLabels.css("background-color", aValue);
			},

			"change:fontColor": function (aModel, aValue) {
				self.$dayTable.css("color", aValue);
			}
		});

		globalTheme.get("timeTheme").on({
			"change:fontColor": function (aModel, aValue) {
				self.$timeTable.css("color", aValue);
			}
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
		this.options.userData.get("userClassList").map(function (aSectionModel) {
			var newEntryGroup = new Scheduler.views.CalendarEntryGroup({
				"sectionModel": aSectionModel,
				"calendarColumns": self.columnList,
				"calendarStartTime": self.startTime,
				"calendarEndTime": self.endTime
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
