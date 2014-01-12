Scheduler.views.AddSectionSidebar = Scheduler.views.Sidebar.extend({
	"defaults": {
		"data": undefined
	},

	"initialize": function (aOpts) {
		Scheduler.views.Sidebar.prototype.initialize.call(this, aOpts);

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
							sectionList.addSection(aSection);
						});
					}
				});
			}
		});
	}
});