/**
 * A view representing an individual entry, or a single event, on a calendar.
 */
Scheduler.views.CalendarEntry = Scheduler.views.View.extend({
	"defaults": {
		"weekday": undefined,
		"sectionModel": undefined,
		"classModel": undefined,
		"calendarSettings": undefined
	},

	"options": undefined,
	"weekday": -1,

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);

		this.options = opts;
		this.weekday = opts.weekday;

		this.setElement(this.buildElement(opts.sectionModel, opts.classModel));
		this.reposition();
		this.bindEvents();
		this.setStyles();
	},

	"buildElement": function (aSectionModel, aClassModel) {
		return $(_.template($("#templateCalendarEntry").html(), {
			"name": aSectionModel.get("title"),
			"subject": aSectionModel.get("subject"),
			"catalog": aSectionModel.get("catalog_number"),
			"section": aSectionModel.get("sectionNumber"),
			"type": aSectionModel.get("sectionType"),
			"building": aClassModel.get("building"),
			"room": aClassModel.get("building")
		}));
	},

	/**
	 * Repositions the view relative to the top of the table cell. This reposition acts relatively,
	 * meaning resizing the window should result in instantly updated positions.
	 */
	"reposition": function () {
		var cst = this.options.calendarSettings.get("startTime");
		var cet = this.options.calendarSettings.get("endTime");
		var thresholds = this.options.calendarSettings.get("thresholds");

		var classStartTime = this.options.classModel.get("startTime");
		var classEndTime = this.options.classModel.get("endTime");
		var classDuration = classEndTime - classStartTime;

		var totalTime = cet - cst;
		var top = 100.0 * (classStartTime - cst) / totalTime;
		var height = 100.0 * (classEndTime - classStartTime) / totalTime;

		for (var i = 0; i < thresholds.length; i++) {
			if (classDuration <= thresholds[i].threshold) {
				this.$el.addClass(thresholds[i].name);
				break;
			}
		}

		this.$el.css("top", top + "%");
		this.$el.css("height", height + "%");
	},

	"bindEvents": function () {
		var self = this;

		this.options.sectionModel.get("theme").on("change", function (aModel) {
			self.setStyles();
		});
	},

	"setStyles": function () {
		var model = this.options.sectionModel.get("theme");
		this.$el.css({
			"background-color": model.get("backgroundColor"),
			"color": model.get("fontColor"),
			"border-color": model.get("borderColor")
		});
	},

	"click": function (aCallback) {
		var self = this;
		this.$el.click(function (aEvent) {
			aEvent.stopPropagation();
			aCallback(self.options.sectionModel, self);
		});
	}

	// "setSelected": function (aSelected) {
	// 	if (aSelected)
	// 		this.$el.addClass("active");
	// 	else
	// 		this.$el.removeClass("active");
	// }
});