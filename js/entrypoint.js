$(function () {
	var sectionList = new Scheduler.models.SectionCollection([
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
			"classes": [
			{
		        "dates": {
		            "start_time": "18:00",
		            "end_time": "21:30",
		            "weekdays": "TTh",
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
		    }],
			"held_with": [],
			"term": 1141,
			"academic_level": "undergraduate",
			"last_updated": "2013-12-31T18:02:45-05:00"
		}
	]);

	var calendar = new Scheduler.views.Calendar({
		"el": "#scheduleContainer",
		"startTime": 8 * 60 + 30,
		"endTime": 22 * 60 + 30,
		"sectionList": sectionList
	});

	var $searchBox = $("#sectionSearchBox");

	$("#sectionSearchButton").click(function (aEvent) {
		aEvent.preventDefault();
		var input = parseInt($searchBox.val());

		if (input) {
			$.ajax({
				"url": "https://api.uwaterloo.ca/v2/courses/" + input + "/schedule.json?key=fa310af514876676292c421cf7673a49",
				"method": "get",
			}).done(function (aResult) {
				if (aResult && aResult.data && aResult.data.length) {
					var sections = new Scheduler.models.SectionCollection(aResult.data);
					sections.forEach(function (aSection) {
						console.log(aSection);
						calendar.addSection(aSection);
					});
				}
			});
		}
	});
});
