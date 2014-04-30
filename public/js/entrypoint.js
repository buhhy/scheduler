$(function () {

	var courseData = new Scheduler.models.ClassData();

	var userData = new Scheduler.models.UserData({
		"hash": hash
	});

	var themeData = new Scheduler.models.ThemeData();

	var selectedSectionList = new Scheduler.models.SectionCollection();

	var globalTheme = new Scheduler.models.GlobalTheme();

	courseData.fetchTermList();

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
