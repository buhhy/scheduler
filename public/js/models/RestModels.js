/*
{
	"courseName": "STV 100",
	"subject": "STV",
	"catalogNumber": "100",
	"title": "Society, Technology and Values: Introduction",
	"sections": {
		"LEC": [ SectionModel ]
	}
}
 */

Scheduler.models.Course = Scheduler.models.Model.extend({
	"defaults": function () {
		return {
			"courseName": undefined,
			"subject": undefined,
			"catalogNumber": undefined,
			"title": undefined,
			"sections": {},
			"idAttribute": "courseName"
		};
	}
});

Scheduler.models.CourseCollection = Scheduler.models.Collection.extend({
	"model": Scheduler.models.Course,

	"addSection": function (aSectionModel) {
		// Get the course model at the course key (CS 100), since they are unique
		var course = this.get(aSectionModel.get("courseKey"));

		if (course == null) {
			// Create one if it doesn't exist
			var sections = {};

			sections[aSectionModel.get("sectionType")] = [ aSectionModel ];

			this.add(new Scheduler.models.Course({
				"courseName": aSectionModel.get("courseKey"),
				"subject": aSectionModel.get("subject"),
				"catalogNumber": aSectionModel.get("catalogNumber"),
				"title": aSectionModel.get("title"),
				"sections": sections
			}));
		} else {
			// Ensure the current section doesn't already exist
			var sections = course.sections[aSectionModel.get("sectionType")];

			if (_.some(sections, function (aExistingSectionModel) {
				return aSectionModel.equals(aExistingSectionModel);
			})) {
				console.log(sprintf("Section %s - %s (%s) is already added.",
						aSectionModel.get("courseKey"),
						aSectionModel.get("sectionNumber"),
						aSectionModel.get("uid")));
			} else {
				sections.push(aSectionModel);
				// Sort by section number
				course.sections = _.sort(sections, function (aSection1, aSection2) {
					if (aSection1.get("sectionNumber") > aSection2.get("sectionNumber"))
						return 1;
					else if (aSection1.get("sectionNumber") < aSection2.get("sectionNumber"))
						return -1;
					return 0;
				});
				this.trigger("add");
			}
		}
	},

	"removeSection": function (aSectionModel) {
// TODO: implement
	}
});

/*
*/

Scheduler.models.Section = Scheduler.models.Model.extend({
	"defaults": function () {
		return {
			"theme": undefined,
			"classList": undefined
		};
	},

	"idAttribute": "uid",

	"constructor": function (aArgs) {
		// Initialize Backbone collection of classes.
		aArgs.classList = new Scheduler.models.ClassCollection(aArgs.classes);
		aArgs.theme = new Scheduler.models.Theme(aArgs.theme);
		Scheduler.models.Model.call(this, aArgs);
	},

	"initialize": function () {
		Scheduler.models.Model.prototype.initialize.call(this);

		// Aggregate multiple classes in a section to a single displayable class.
		this.aggregateClasses();
	},

	"parse": function (aResp) {
		aResp.theme = this.getAndSet("theme", aResp);
		aResp.classList = this.getAndSet("classList", aResp);

		return aResp;
	},

	/**
	 * Aggregates a list of classes into a single class instance.
	 */
	"aggregateClasses": function () {
		// Filter out classes that don't have a time set
		var baseClasses = this.get("classList").filter(function (aClass) {
			return aClass.get("startTime") && aClass.get("endTime") && aClass.get("indexedWeekdays");
		});

		var self = this;
		var aggregates = {};

		this.set("aggregatedClasses", this.get("classList").reduce(function (aAggregate, aClass) {
			var push = true;
			for (var i = 0; i < aAggregate.length; i++) {
				if (aAggregate[i].equals(aClass))
					push = false;
			}
			if (push)
				aAggregate.push(aClass);
			return aAggregate;
		}, []));
	},

	"getAggregateTimeString": function () {
		var clazz = this.get("aggregatedClasses");

		if (clazz.length > 1)
			return "multiple";
		else if (clazz.length == 1)
			return clazz[0].getAggregateTimeString();
		else
			return "none"
	},

	"equals": function (thatModel) {
		return thatModel.get("uid") === this.get("uid");
	}
});

Scheduler.models.SectionCollection = Scheduler.models.Collection.extend({
	"model": Scheduler.models.Section,

	"findSection": function (aClassNumber) {
		return this.find(function (aSection) {
			return aSection.get("class_number") === aClassNumber;
		});
	},

	"addSection": function (aSection) {
		if (!this.findSection(aSection.get("class_number")))
			this.push(aSection);
	},

	"removeSection": function (aClassNumber) {
		var item = this.findSection(aClassNumber);
		this.remove(item);
	}
});

/*
Pre-processing:
	{
		"date": {
			"start_time": "18:30",
			"end_time": "21:20",
			"weekdays": "M",
			"start_date": null,
			"end_date": null,
			"is_tba": false,
			"is_cancelled": false,
			"is_closed": false
		},
		"location": {
			"building": "E5",
			"room": "6004"
		},
		"instructors": [
			"Campbell,Scott Martin"
		]
	}
Post-processing:
	{
		"startTime": 1110,
		"endTime": 1280,
		"indexedWeekdays": [ 1 ],
		"building": "E5",
		"room": "6004"
	}
 */

Scheduler.models.Class = Scheduler.models.Model.extend({
	"defaults": {
		"indexedWeekdays": undefined,
		"startTime": undefined,
		"endTime": undefined,
		"building": undefined,
		"room": undefined
	},

	"WEEKDAYS_TEXT_LOOKUP": ["S", "M", "T", "W", "Th", "F", "Su"],

	"initialize": function () {
		Scheduler.models.Model.prototype.initialize.call(this);
	},

	"getAggregateTimeString": function () {
		var self = this;
		return sprintf("%s-%s %s",
			TimeUtils.minutesToStringFormat(this.get("startTime")),
			TimeUtils.minutesToStringFormat(this.get("endTime")),
			_.reduce(
				this.get("indexedWeekdays"),
				function (aAgg, aDay) {
					return aAgg + self.WEEKDAYS_TEXT_LOOKUP[aDay];
				}, ""));
	},

	"equals": function (aClass) {
		return
			aClass.get("startTime") === this.get("startTime") &&
			aClass.get("endTime") === this.get("endTime") &&
			aClass.get("indexedWeekdays") === this.get("indexedWeekdays") &&
			aClass.get("building").toLowerCase === this.get("building").toLowerCase &&
			aClass.get("room").toLowerCase === this.get("room").toLowerCase;
	}
});

Scheduler.models.ClassCollection = Scheduler.models.Collection.extend({
	"model": Scheduler.models.Class
});
