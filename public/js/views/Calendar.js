Scheduler.views.Calendar = Scheduler.views.View.extend({
	"defaults": {
		"userData": undefined,				// Default data model
		"selectedSectionList": undefined 	// List of selected sections on the calendar
	},

	"options": undefined,

	// A hashmap of elements mapped by the class id.
	"sectionViewList": undefined,
	"columnList": undefined,

	"$timeTable": undefined,
	"$dayTable": undefined,
	"$timeLabels": undefined,
	"$dayLabelBackgrounds": undefined,

	"startTime": 0,						// Calendar start time in minutes
	"endTime": 24 * 60,					// Calendar end time in minutes
	"interval": 60,						// Intervals between time lines in minutes
	"autofit": false,					// Auto-fits the start and end bounds depending on classes
	"startOffset": 30, 					// The calendar displays an extra 30 minutes at the top.

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);
		var self = this;
		var calendarSettings = opts.userData.get("calendarSettings");

		this.options = opts;
		this.sectionViewList = {};
		this.startTime = calendarSettings.get("startTime") || this.startTime;
		this.endTime = calendarSettings.get("endTime") || this.endTime;
		this.interval = calendarSettings.get("interval") || this.interval;
		this.startOffset = calendarSettings.get("startOffset") || this.startOffset;
		this.autofit = calendarSettings.get("autofit");

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

		// The time labels should begin 30 minutes er the start time.
		for (var i = this.startTime + this.startOffset; i < this.endTime; i += this.interval)
			timeLabels.push(TimeUtils.minutesToStringFormat(i, true));

		this.$calendar = $(_.template($("#templateCalendar").html(), {
			"timeLabels": timeLabels,
			"dayLabels": dayLabels
		}));

		this.$el.append(this.$calendar);
		this.$el.addClass("cl");

		this.$timeTable = this.$el.find("[data-id='timeTable']");
		this.$dayTable = this.$el.find("[data-id='dayTable']");
		this.$timeLabels = this.$el.find("[data-id='timeLabel']");

		this.$calendarBackground = this.$el.find("[data-id='calendarBackground']");
		this.$dayLabelBackgrounds = this.$el.find("[data-id='dayLabelBackground']");


		// Find the table columns which will be containing all the event views, then wrap them all
		// inside jQuery wrapper objects, because accessing each element of a jQuery selector
		// returns not the jQuery-ized element, but the bare element.
		this.columnList = this.$el
				.find("[data-id='positionContainer']")
				.map(function (aIndex, aElem) {
					return $(aElem);
				});

		this.bindEvents();
		this.setUpInitialStyles();
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
				self.setTableBg(aValue);
			}
		});

		globalTheme.get("daysTheme").on({
			"change:backgroundColor": function (aModel, aValue) {
				self.setDayLabelBg(aValue);
			},

			"change:fontColor": function (aModel, aValue) {
				self.setDayLabelFont(aValue);
			}
		});

		globalTheme.get("timeTheme").on({
			"change:fontColor": function (aModel, aValue) {
				self.setTimeFont(aValue);
			}
		});

		this.options.selectedSectionList.on("all", function () {
			self.refreshSelection();
		});
	},

	"setUpInitialStyles": function () {
		var globalTheme = this.options.userData.get("globalTheme");

		this.setTableBg(globalTheme.get("tableTheme").get("backgroundColor"));
		this.setDayLabelBg(globalTheme.get("daysTheme").get("backgroundColor"));
		this.setDayLabelFont(globalTheme.get("daysTheme").get("fontColor"));
		this.setTimeFont(globalTheme.get("timeTheme").get("fontColor"));
	},

	"setTableBg": function (aValue) {
		this.$calendarBackground.css("background-color", aValue);
	},

	"setDayLabelBg": function (aValue) {
		this.$dayLabelBackgrounds.css("background-color", aValue);
	},

	"setDayLabelFont": function (aValue) {
		this.$dayLabelBackgrounds.css("color", aValue);
	},

	"setTimeFont": function (aValue) {
		this.$timeTable.css("color", aValue);
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
				"calendarSettings": self.options.userData.get("calendarSettings")
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
	}
});
