Scheduler.views.CustomizeSidebar = Scheduler.views.Sidebar.extend({
	"defaults": {
		"selectedSectionList": undefined,
		"userData": undefined,
		"themeData": undefined
	},

	"userData": undefined,

	"globalThemeDropdownMap": {},

	"sectionThemeDropdown": undefined,

	"sectionThemeContainer": undefined,

	"$customizeGlobalDropdownList": undefined,
	"$customizeSectionDropdownList": undefined,

	"initialize": function (aOpts) {
		Scheduler.views.Sidebar.prototype.initialize.call(this, aOpts);
		var opts = _.defaults(aOpts, this.defaults);

		this.options = opts;
		this.userData = opts.userData;

		this.$customizeGlobalDropdownList = this.$el.find("#customizeGlobalDropdownList");
		this.$customizeSectionDropdownList = this.$el.find("#customizeSectionDropdownList");
		this.sectionThemeContainer = this.$el.find("#sectionThemeContainer");

		this.buildDropdowns();
		this.bindEvents();
	},

	"buildDropdowns": function () {
		var rootElem = this.getDropdownListEntryHtml();
		var self = this;
		var globalTheme = this.userData.get("globalTheme");
		var themeData = this.options.themeData;

		this.sectionThemeDropdown = new Common.Dropdown({
			"el": rootElem,
			"titleHtml": "COURSE",
			"titleClass": "heading-1",
			"optionList": [
				this.buildMultiPaletteDropdown(
					"BACKGROUND",
					themeData.get("section"),
					"backgroundColor"),
				this.buildMultiPaletteDropdown(
					"FONT",
					themeData.get("section"),
					"fontColor"),
				this.buildMultiPaletteDropdown(
					"BORDER",
					themeData.get("section"),
					"borderColor")
			]
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
						"BORDER",
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
		this.sectionThemeDropdown.appendTo(this.$customizeSectionDropdownList);
	},

	"buildPaletteDropdown": function (aTitle, aDefaultColor, aPaletteColors, aThemeModel, aKey) {
		var palette = new Scheduler.views.Palette({
			"colors": aPaletteColors,
			"model": aThemeModel,
			"colorName": aKey
		});

		return {
			"dropdown": new Common.Dropdown({
				"el": "<section></section>",
				"titleHtml": aTitle,
				"titleClass": "heading-2",
				"optionClass": "heading-3 palette",
				"titleIndicatorHtml": _.template($("#templatePalette").html(), {
					"colors": [ aDefaultColor ]
				}),
				"optionList": [ palette ]
			}),
			"palette": palette
		};
	},

	"buildSinglePaletteDropdown": function (aTitle, aThemeData, aThemeModel, aKey) {
		var dropdown = this.buildPaletteDropdown(aTitle, aThemeModel.get(aKey), aThemeData[aKey],
			aThemeModel, aKey).dropdown;

		var $indicator = dropdown.$header.find("[data-id='color-indicator']");

		// Bind a change event on the model, so if the global theme changes, then change the color
		// indicator on the dropdown header.
		aThemeModel.on("change:" + aKey, function (aModel, aValue) {
			$indicator.css("background-color", aValue);
		});

		return dropdown;
	},

	"buildMultiPaletteDropdown": function (aTitle, aThemeData, aKey) {
		var unselectedColor = "#fff";
		var multiSelectedColor = "#ddd";

		var result = this.buildPaletteDropdown(aTitle, unselectedColor, aThemeData[aKey],
			undefined, aKey);
		var dropdown = result.dropdown;
		var palette = result.palette;

		var $indicator = dropdown.$header.find("[data-id='color-indicator']");
		var self = this;
		var selectedSectionList = this.options.selectedSectionList;

		var setIndicatorColor = function (aCollection, aColor) {
			var collection = aCollection || selectedSectionList;
			var color = unselectedColor;

			if (collection.size() > 1)
				color = multiSelectedColor
			else if (collection.size() === 1)
				color = aColor || collection.at(0).get("theme").get(aKey);

			$indicator.css("background-color", color);
		};

		var setPaletteModels = function (aCollection) {
			var collection = aCollection || selectedSectionList;
			palette.setModels(collection.pluck("theme"));
		};

		var attachChangeEvent = function (aSectionModel) {
			// Bind a change event on the model, so if the global theme changes, then change the
			// color indicator on the dropdown header.
			aSectionModel.get("theme").on("change:" + aKey, function (aModel, aValue) {
				setIndicatorColor(undefined, aValue);
			}, self);
		};

		var removeChangeEvent = function (aSectionModel) {
			aSectionModel.get("theme").off("change:" + aKey, undefined, self);
		};

		selectedSectionList.each(function (aModel) {
			attachChangeEvent(aModel);
		});

		selectedSectionList.on("add", function (aModel, aCollection) {
			attachChangeEvent(aModel);
			setIndicatorColor(aCollection);
			setPaletteModels(aCollection);
		});

		selectedSectionList.on("remove", function (aModel, aCollection) {
			removeChangeEvent(aModel);
			setIndicatorColor(aCollection);
			setPaletteModels(aCollection);
		});

		selectedSectionList.on("reset", function (aCollection, aOptions) {
			_.forEach(aOptions.previousModels, function (aModel) {
				removeChangeEvent(aModel);
			});

			aCollection.each(function (aModel) {
				attachChangeEvent(aModel);
			});

			setIndicatorColor(aCollection);
			setPaletteModels(aCollection);
		});

		setIndicatorColor();
		setPaletteModels();

		return dropdown;
	},

	"bindEvents": function () {
	}
});