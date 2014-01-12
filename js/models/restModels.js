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
Sample:
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
*/

Scheduler.models.Section = Scheduler.models.Model.extend({
	"idAttribute": "class_number",

	"initialize": function () {
		Scheduler.models.Model.prototype.initialize.call(this);
		var collection = new Scheduler.models.ClassCollection();
		collection.reset(this.get("classes"));
		this.set("classes", collection);
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
Sample:
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
 */

Scheduler.models.Class = Scheduler.models.Model.extend({
});

Scheduler.models.ClassCollection = Scheduler.models.Collection.extend({
	"model": Scheduler.models.Class
});
