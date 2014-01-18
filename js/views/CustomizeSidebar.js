Scheduler.views.CustomizeSidebar = Scheduler.views.Sidebar.extend({
	"defaults": {
		"userData": undefined
	},

	"userData": undefined,

	"dropdownMap": {},

	"$customizeDropdownList": undefined,

	"initialize": function (aOpts) {
		Scheduler.views.Sidebar.prototype.initialize.call(this, aOpts);
		var opts = _.defaults(aOpts, this.defaults);

		this.userData = opts.userData;

		this.$customizeDropdownList = this.$el.find("#customizeDropdownList");

		// this.userData.each(function (aEntry) {
		// 	self.addAddedClassEntry(aEntry, false);
		// });

		this.buildDropdowns();
		this.bindEvents();
	},

	"buildDropdowns": function () {
		var rootElem = this.getDropdownListEntryHtml();
		var self = this;

		this.dropdownMap = {
			"table": new Common.Dropdown({
				"el": rootElem,
				"titleHtml": "TABLE",
				"titleClass": "heading-1",
				"optionClass": "heading-2",
				"optionList": [
					"BACKGROUND",
					"FONT",
					"BORDER"
				]
			}),
			"weeks": new Common.Dropdown({
				"el": rootElem,
				"titleHtml": "DAYS OF THE WEEK",
				"titleClass": "heading-1",
				"optionClass": "heading-2",
				"optionList": [
					"BACKGROUND",
					"FONT",
					"BORDER"
				]
			}),
			"time": new Common.Dropdown({
				"el": rootElem,
				"titleHtml": "TIMES",
				"titleClass": "heading-1",
				"optionClass": "heading-2",
				"optionList": [
					"BACKGROUND",
					"FONT",
					"BORDER"
				]
			})
		};

		_.map(this.dropdownMap, function (aElem) {
			aElem.appendTo(self.$customizeDropdownList);
		});
	},

	"bindEvents": function () {
		var self = this;

		// this.classData.on("change:classList", function () {
		// 	console.log("changed!");
		// });

		// this.userData.on("add", function (aInsert) {
		// 	self.addAddedClassEntry(aInsert, true);
		// });

		// this.userData.on("remove", function (aRemoved) {
		// 	self.removeAddedClassEntry(aRemoved, true);
		// });

		// this.$searchBox.keyup($.debounce(250, $.proxy(this.search, this)));

		// this.$searchButton.click(function (aEvent) {
		// 	aEvent.preventDefault();
		// 	self.search();
		// });
	}
});