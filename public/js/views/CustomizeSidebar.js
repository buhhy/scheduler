Scheduler.views.CustomizeSidebar = Scheduler.views.Sidebar.extend({
	"defaults": {
		"selectedSectionList": undefined,
		"userData": undefined,
		"themeData": undefined
	},

	"userData": undefined,

	"sectionThemeList": undefined,
	"sectionThemeMap": undefined,

	"$customizeGlobalDropdownList": undefined,

	"initialize": function (aOpts) {
		Scheduler.views.Sidebar.prototype.initialize.call(this, aOpts);
		var opts = _.defaults(aOpts, this.defaults);

		this.options = opts;
		this.userData = opts.userData;

		this.$customizeGlobalDropdownList = this.$el.find("#customizeGlobalDropdownList");

		this.sectionThemeMap = {};

		this.buildDropdowns();
	},

	"buildDropdowns": function () {
		var rootElem = this.getDropdownListEntryHtml();
		var self = this;
		var globalTheme = this.userData.get("globalTheme");
		var themeData = this.options.themeData;

		this.sectionThemeList = new Scheduler.views.GroupedSectionDropdownList({
			"sectionList": this.userData.get("userClassList"),
			"createEntryViewFn": $.proxy(this.buildSectionDropdown, this),
			"el": "#customizeSectionDropdownList",
			"nested": true
		});

		this.globalThemeDropdownMap = {
			"table": new Common.Dropdown({
				"el": rootElem,
				"titleHtml": "TABLE",
				"titleClass": "heading-1",
				"optionList": [
					this.buildSinglePaletteDropdown(
						"BACKGROUND",
						themeData.get("table"),
						globalTheme.get("tableTheme"),
						"backgroundColor"),
					this.buildSinglePaletteDropdown(
						"HORIZONTAL DIVIDERS",
						themeData.get("table"),
						globalTheme.get("tableTheme"),
						"borderColor", 0),
					this.buildSinglePaletteDropdown(
						"VERTICAL DIVIDERS",
						themeData.get("table"),
						globalTheme.get("tableTheme"),
						"borderColor", 1)
				]
			}),
			"days": new Common.Dropdown({
				"el": rootElem,
				"titleHtml": "DAYS OF THE WEEK",
				"titleClass": "heading-1",
				"optionList": [
					this.buildSinglePaletteDropdown(
						"BACKGROUND",
						themeData.get("days"),
						globalTheme.get("daysTheme"),
						"backgroundColor"),
					this.buildSinglePaletteDropdown(
						"FONT",
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
					this.buildSinglePaletteDropdown(
						"BACKGROUND",
						themeData.get("time"),
						globalTheme.get("timeTheme"),
						"backgroundColor"),
					this.buildSinglePaletteDropdown(
						"FONT",
						themeData.get("time"),
						globalTheme.get("timeTheme"),
						"fontColor")
				]
			})
		};

		_.map(this.globalThemeDropdownMap, function (aElem) {
			aElem.appendTo(self.$customizeGlobalDropdownList);
		});
	},

	"buildPaletteDropdown": function (
		aTitle, aDefaultColor,
		aPaletteColors, aThemeModel,
		aKey, aIndex,
		aClass1, aClass2
	) {
		var palette = new Scheduler.views.Palette({
			"colors": aPaletteColors,
			"model": aThemeModel,
			"colorName": aKey,
			"colorNameIndex": aIndex
		});

		var class1 = aClass1 || "heading-2";
		var class2 = aClass2 || "heading-3 no-padding";

		return {
			"dropdown": new Common.Dropdown({
				"el": "<section></section>",
				"titleHtml": aTitle,
				"titleClass": class1,
				"optionClass": class2 + " palette",
				"titleIndicatorHtml": _.template($("#templatePalette").html(), {
					"colors": [ aDefaultColor ]
				}),
				"optionList": [ palette ]
			}),
			"palette": palette
		};
	},

	"buildSinglePaletteDropdown": function (
		aTitle, aThemeData,
		aThemeModel,
		aKey, aIndex,
		aClass1, aClass2
	) {
		var defaultColor = aIndex == null? aThemeModel.get(aKey) : aThemeModel.get(aKey)[aIndex];
		var dropdown = this.buildPaletteDropdown(
			aTitle, defaultColor, aThemeData[aKey],
			aThemeModel, aKey, aIndex, aClass1, aClass2).dropdown;

		var $indicator = dropdown.$header.find("[data-id='color-indicator']");

		// Bind a change event on the model, so if the global theme changes, then change the color
		// indicator on the dropdown header.
		aThemeModel.on("change:" + aKey, function (aModel, aValue) {
			var value = aIndex == null? aValue : aValue[aIndex];
			$indicator.css("background-color", value);
		});

		return dropdown;
	},

	"buildSectionDropdown": function (aSectionModel) {
		var rootElem = this.getDropdownListEntryHtml();
		var themeData = this.options.themeData;

		var dropdown = new Common.Dropdown({
			"el": rootElem,
			"titleHtml": sprintf("%s %s", aSectionModel.get("sectionType"), aSectionModel.get("sectionNumber")),
			"titleClass": "heading-2",
			"optionList": [
				this.buildSinglePaletteDropdown(
					"BACKGROUND",
					themeData.get("section"),
					aSectionModel.get("theme"),
					"backgroundColor", undefined,
					"heading-3 clickable", "heading-4"),
				this.buildSinglePaletteDropdown(
					"FONT",
					themeData.get("section"),
					aSectionModel.get("theme"),
					"fontColor", undefined,
					"heading-3 clickable", "heading-4"),
				this.buildSinglePaletteDropdown(
					"BORDER",
					themeData.get("section"),
					aSectionModel.get("theme"),
					"borderColor", 0,
					"heading-3 clickable", "heading-4")
			]
		});

		this.sectionThemeMap[aSectionModel.get("uid")] = dropdown;
		return dropdown.$el;
	}
});