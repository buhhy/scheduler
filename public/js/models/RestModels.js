/*
Concise:
{
	  "course_id":"010374",
	  "subject":"MATH",
	  "catalog_number":"51",
	  "title":"Pre-University Algebra and Geometry",
	  "units":0,
	  "description":"Topics covered in the course include operations with vectors, scalar multiplications dot and cross products, projections, equations of lines and planes, systems of equations, Gaussian elimination, operations with matrices, determinants, binomial theorem, proof by mathematical induction, complex numbers.",
	  "academic_level":"undergraduate"
}

Verbose:
{
	"course_id":"007407",
	"subject":"PHYS",
	"catalog_number":"234",
	"title":"Quantum Physics 1",
	"units":0.5,
	"description":"Background of quantum physics. Quantization, waves and particles. The uncertainty principle. The Schroedinger equation for one-dimensional problems: bound states in square wells. Harmonic oscillator; transmission through barriers.",
	"instructions":[
	  "LEC",
	  "TUT"
	],
	"prerequisites":"PHYS 112 or 122; MATH 114 or 136; MATH 128 or 138 or 148; One of MATH 228, AMATH 250, AMATH 251.",
	"antirequisites":"CHEM 256\/356, NE 232",
	"corequisites":"MATH 228 or AMATH 250.",
	"crosslistings":null,
	"terms_offered":[
	  "W",
	  "S"
	],
	"notes":"[Note: PHYS 236 or knowledge of computational methods recommended. Offered: W, S]",
	"offerings":{
	  "online":false,
	  "online_only":false,
	  "st_jerome":false,
	  "st_jerome_only":false,
	  "renison":false,
	  "renison_only":false,
	  "conrad_grebel":false,
	  "conrad_grebel_only":false
	},
	"needs_department_consent":false,
	"needs_instructor_consent":false,
	"extra":[

	],
	"calendar_year":"1415",
	"url":"http:\/\/www.ucalendar.uwaterloo.ca\/1415\/COURSE\/course-PHYS.html#PHYS234",
	"academic_level":"undergraduate"
}
 */

Scheduler.models.Course = Scheduler.models.Model.extend({
});

Scheduler.models.CourseCollection = Scheduler.models.Collection.extend({
	"model": Scheduler.models.Course
});

/*
Pre-processing:
	{
		"subject": "STV",
		"catalog_number": "100",
		"units": 0.5,
		"title": "Society, Technology and Values: Introduction",
		"note": null,
		"class_number": 6928,
		"section": "LEC 001",
		"campus": "UW U",
		"associated_class": 1,
		"related_component_1": null,
		"related_component_2": null,
		"enrollment_capacity": 80,
		"enrollment_total": 80,
		"waiting_capacity": 0,
		"waiting_total": 0,
		"topic": null,
		"reserves": [],
		"classes": [],
		"held_with": [],
		"term": 1141,
		"academic_level": "undergraduate",
		"last_updated": "2013-12-31T18:02:45-05:00"
	}
Post-processing:
	{
		"subject": "STV",
		"catalogNumber": "100",
		"sectionType": "LEC",
		"sectionNumber": "001",
		"classes": []
	}
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

		// Split section into type and number.
		var section = this.get("section").split(" ");
		if (section && section.length == 2) {
			this.set("sectionType", section[0]);
			this.set("sectionNumber", section[1]);
		} else {
			this.set("sectionType", "N/A");
			this.set("sectionNumber", "N/A");
		}

		// Changing for consistent naming.
		this.set("catalogNumber", this.get("catalog_number"));

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
		var baseClasses = this.get("classList").filter(function (aClass) {
			var dates = aClass.get("dates");
			return dates.start_time && dates.end_time && dates.weekdays;
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
		"dates": {
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

	"WEEKDAYS_REGEX": /^(m?)((?:t(?:(?!h)))?)(w?)((?:th)?)(f?)((?:s(?:(?!u)))?)((?:su)?)$/,
	"WEEKDAYS_INDEX_LOOKUP": {
		"su": 0,
		"m": 1,
		"t": 2,
		"w": 3,
		"th": 4,
		"f": 5,
		"s": 6
	},

	"WEEKDAYS_TEXT_LOOKUP": ["S", "M", "T", "W", "Th", "F", "Su"],

	"initialize": function () {
		Scheduler.models.Model.prototype.initialize.call(this);

		/*
		This will return a list of matched strings using regex in this format, assuming the
		following input string "TThF":

		[ "TThF", "", "T", "", "Th", "F" ]

		This array will need to be filtered, and converted into a list of day indices.
		 */
		var dates = this.get("dates");

		if (dates.weekdays) {
			// Convert weekday letters to an array index, with Sunday being 0

			var rawDays = dates.weekdays.toLowerCase().match(this.WEEKDAYS_REGEX).slice(1);
			var self = this;
			var days = _.map(
				_.filter(rawDays, function (aDay) {
					return aDay || aDay.length;
				}), function (aDay) {
					return self.WEEKDAYS_INDEX_LOOKUP[aDay];
				});

			this.set("indexedWeekdays", days);
		} else {
			this.set("indexedWeekdays", []);
		}

		// Convert start and end time from string to integer of seconds
		this.set("startTime", TimeUtils.parseTimeToMinutes(dates.start_time || "0:00"));
		this.set("endTime", TimeUtils.parseTimeToMinutes(dates.end_time || "23:59"));

		// Make sure there is a location.
		var location = this.get("location") || {};
		this.set("building", location.building || "N/A");
		this.set("room", location.room || "N/A");
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
