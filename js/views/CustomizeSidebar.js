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
		var globalTheme = this.userData.get("globalTheme");

		this.dropdownMap = {
			"table": new Common.Dropdown({
				"el": rootElem,
				"titleHtml": "TABLE",
				"titleClass": "heading-1",
				"optionList": [
					this.buildPaletteDropdown(
						"BACKGROUND",
						["#f00", "#0f0", "#00f"],
						globalTheme.get("tableTheme"),
						"backgroundColor")
				]
			})
			// "weeks": new Common.Dropdown({
			// 	"el": rootElem,
			// 	"titleHtml": "DAYS OF THE WEEK",
			// 	"titleClass": "heading-1",
			// 	"optionClass": "heading-2",
			// 	"optionList": [
			// 		"BACKGROUND",
			// 		"FONT",
			// 		"BORDER"
			// 	]
			// }),
			// "time": new Common.Dropdown({
			// 	"el": rootElem,
			// 	"titleHtml": "TIMES",
			// 	"titleClass": "heading-1",
			// 	"optionClass": "heading-2",
			// 	"optionList": [
			// 		"BACKGROUND",
			// 		"FONT",
			// 		"BORDER"
			// 	]
			// })
		};

		_.map(this.dropdownMap, function (aElem) {
			aElem.appendTo(self.$customizeDropdownList);
		});
	},

	"buildPaletteDropdown": function (aTitle, aColors, aThemeObject, aKey) {
		var dropdown = new Common.Dropdown({
			"el": "<section></section>",
			"titleHtml": aTitle,
			"titleClass": "heading-2",
			"optionClass": "heading-3 palette",
			"titleIndicatorHtml": _.template($("#templatePalette").html(), {
				"colors": [ aThemeObject.get(aKey) ]
			}),
			"optionList": [
				new Scheduler.views.Palette({
					"colors": aColors,
					"model": aThemeObject,
					"colorName": aKey
				})
			]
		});

		var $indicator = dropdown.$header.find("[data-id='color-indicator']");

		// Bind a change event on the model, so if the global theme changes, then change the color
		// indicator on the dropdown header.
		aThemeObject.on("change:" + aKey, function (aModel, aValue) {
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