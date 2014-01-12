Scheduler.views.AddSectionSidebar = Scheduler.views.Sidebar.extend({
	"defaults": {
		"classData": undefined
	},

	"SEARCH_ENGINE_DB_NAME": "class_list",

	"classData": undefined,
	"fullproofEngine": undefined,

	"initialize": function (aOpts) {
		Scheduler.views.Sidebar.prototype.initialize.call(this, aOpts);
		var opts = _.defaults(aOpts, this.defaults);
		var self = this;

		this.classData = opts.classData;

		this.classData.on("change:classList", function () {
			console.log("changed!");
		});

		this.$searchBox = $("#sectionSearchBox");
		this.$searchButton = $("#sectionSearchButton");

		this.$searchButton.click(function (aEvent) {
			aEvent.preventDefault();
			var input = self.$searchBox.val();

			if (input && input.length) {
				// Display data here.
				console.log(self.classData.search(input));
			}
		});
	}
});