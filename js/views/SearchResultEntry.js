/**
 * A view representing an entry found through the search engine.
 */
Scheduler.views.SearchResultEntry = Scheduler.views.View.extend({
	"defaults": {
		"sectionList": []
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

	/**
	 * Repositions the view relative to the top of the table cell. This reposition acts relatively,
	 * meaning resizing the window should result in instantly updated positions.
	 */
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