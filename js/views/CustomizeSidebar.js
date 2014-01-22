Scheduler.views.CustomizeSidebar = Scheduler.views.Sidebar.extend({
	"defaults": {
		"userData": undefined
	},

	"userData": undefined,

	"globalThemeDropdownMap": {},

	"sectionThemeDropdown": undefined,

	"sectionThemeContainer": undefined,

	"$customizeDropdownList": undefined,

	"initialize": function (aOpts) {
		Scheduler.views.Sidebar.prototype.initialize.call(this, aOpts);
		var opts = _.defaults(aOpts, this.defaults);

		this.options = opts;
		this.userData = opts.userData;

		this.$customizeDropdownList = this.$el.find("#customizeDropdownList");
		this.sectionThemeContainer = this.$el.find("#sectionThemeContainer");

		// this.userData.each(function (aEntry) {
		// 	self.addAddedClassEntry(aEntry, false);
		// });

		this.buildDropdowns();
		this.bindEvents();
	},

	"buildDropdowns": function () {
		var rootElem = this.getDropdownListEntryHtml();
		var self = this;
		var globalTheme = this.userData.get("globalTheme");
		var themeData = this.options.themeData;

		// this.sectionThemeDropdown = new Common.Dropdown({
		// 	"el": "#sectionThemeDropdown",
		// 	"titleHtml": "COURSE",
		// 	"titleClass": "heading-1",
		// 	"optionList": [
		// 		this.buildPaletteDropdown(
		// 			"BACKGROUND",
		// 			themeData.get("table"),
		// 			globalTheme.get("tableTheme"),
		// 			"backgroundColor"),
		// 		this.buildPaletteDropdown(
		// 			"FONT COLOR",
		// 			themeData.get("table"),
		// 			globalTheme.get("tableTheme"),
		// 			"fontColor"),
		// 		this.buildPaletteDropdown(
		// 			"BORDER COLOR",
		// 			themeData.get("table"),
		// 			globalTheme.get("tableTheme"),
		// 			"borderColor")
		// 	]
		// });

		this.globalThemeDropdownMap = {
			"table": new Common.Dropdown({
				"el": rootElem,
				"titleHtml": "TABLE",
				"titleClass": "heading-1",
				"optionList": [
					this.buildPaletteDropdown(
						"BACKGROUND",
						themeData.get("table"),
						globalTheme.get("tableTheme"),
						"backgroundColor"),
					this.buildPaletteDropdown(
						"FONT COLOR",
						themeData.get("table"),
						globalTheme.get("tableTheme"),
						"fontColor"),
					this.buildPaletteDropdown(
						"BORDER COLOR",
						themeData.get("table"),
						globalTheme.get("tableTheme"),
						"borderColor")
				]
			}),
			"days": new Common.Dropdown({
				"el": rootElem,
				"titleHtml": "DAYS OF THE WEEK",
				"titleClass": "heading-1",
				"optionList": [
					this.buildPaletteDropdown(
						"BACKGROUND",
						themeData.get("days"),
						globalTheme.get("daysTheme"),
						"backgroundColor"),
					this.buildPaletteDropdown(
						"FONT COLOR",
						themeData.get("days"),
						globalTheme.get("daysTheme"),
						"fontColor")
				]
			}),
			"time": new Common.Dropdown({
				"el": rootElem,
				"titleHtml": "TIME",
				"titleClass": "heading-1",
				"optionList": [
					this.buildPaletteDropdown(
						"BACKGROUND",
						themeData.get("time"),
						globalTheme.get("timeTheme"),
						"backgroundColor"),
					this.buildPaletteDropdown(
						"FONT COLOR",
						themeData.get("time"),
						globalTheme.get("timeTheme"),
						"fontColor")
				]
			})
		};

		_.map(this.globalThemeDropdownMap, function (aElem) {
			aElem.appendTo(self.$customizeDropdownList);
		});
	},

	"buildPaletteDropdown": function (aTitle, aThemeData, aThemeModel, aKey) {
		var dropdown = new Common.Dropdown({
			"el": "<section></section>",
			"titleHtml": aTitle,
			"titleClass": "heading-2",
			"optionClass": "heading-3 palette",
			"titleIndicatorHtml": _.template($("#templatePalette").html(), {
				"colors": [ aThemeModel.get(aKey) ]
			}),
			"optionList": [
				new Scheduler.views.Palette({
					"colors": aThemeData[aKey],
					"model": aThemeModel,
					"colorName": aKey
				})
			]
		});

		var $indicator = dropdown.$header.find("[data-id='color-indicator']");

		// Bind a change event on the model, so if the global theme changes, then change the color
		// indicator on the dropdown header.
		aThemeModel.on("change:" + aKey, function (aModel, aValue) {
			$indicator.css("background-color", aValue);
		});

		return dropdown;
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