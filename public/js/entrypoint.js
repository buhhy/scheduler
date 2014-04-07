$(function () {

	var courseData = new Scheduler.models.ClassData();

	var userData = new Scheduler.models.UserData();

	var themeData = new Scheduler.models.ThemeData();

	var selectedSectionList = new Scheduler.models.SectionCollection();

	// var sectionList = new Scheduler.models.SectionCollection([
	// 	{
	// 		"subject": "STV",
	// 		"catalog_number": "100",
	// 		"units": 0.5,
	// 		"title": "Society, Technology and Values: Introduction",
	// 		"note": null,
	// 		"class_number": 6928,
	// 		"section": "LEC 001",
	// 		"campus": "UW U",
	// 		"associated_class": 1,
	// 		"related_component_1": null,
	// 		"related_component_2": null,
	// 		"enrollment_capacity": 80,
	// 		"enrollment_total": 80,
	// 		"waiting_capacity": 0,
	// 		"waiting_total": 0,
	// 		"topic": null,
	// 		"reserves": [],
	// 		"classes": [
	// 		{
	// 	        "dates": {
	// 	            "start_time": "18:00",
	// 	            "end_time": "21:30",
	// 	            "weekdays": "TTh",
	// 	            "start_date": null,
	// 	            "end_date": null,
	// 	            "is_tba": false,
	// 	            "is_cancelled": false,
	// 	            "is_closed": false
	// 	        },
	// 	        "location": {
	// 	            "building": "E5",
	// 	            "room": "6004"
	// 	        },
	// 	        "instructors": [
	// 	            "Campbell,Scott Martin"
	// 	        ]
	// 	    }],
	// 		"held_with": [],
	// 		"term": 1141,
	// 		"academic_level": "undergraduate",
	// 		"last_updated": "2013-12-31T18:02:45-05:00",
	// 		"uid": "1141+6928"
	// 	}
	// ]);

	var globalTheme = new Scheduler.models.GlobalTheme();

	var sidebar = new Scheduler.views.SidebarGroup({
		"el": "#sidebarGroup",
		"sidebars": [
			new Scheduler.views.AddSectionSidebar({
				"el": "#addSectionSidebar",
				"indicator": "#addSectionIndicator",
				"selectedSectionList": selectedSectionList,
				"courseData": courseData,
				"userData": userData
			}),
			new Scheduler.views.CustomizeSidebar({
				"el": "#customizeSidebar",
				"indicator": "#customizeIndicator",
				"selectedSectionList": selectedSectionList,
				"userData": userData,
				"themeData": themeData
			}),
			new Scheduler.views.PrintSidebar({
				"el": "#printSidebar",
				"indicator": "#printIndicator",
				"userData": userData
			})
		]
	});

	var calendar = new Scheduler.views.Calendar({
		"el": "#scheduleContainer",
		"startTime": 8 * 60 + 30,
		"endTime": 22 * 60 + 30,
		"userData": userData,
		"selectedSectionList": selectedSectionList
	});
});