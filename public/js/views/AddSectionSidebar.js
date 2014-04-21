Scheduler.views.AddSectionSidebar = Scheduler.views.Sidebar.extend({
	"defaults": {
		"courseData": undefined,
		"userData": undefined
	},

	"ADDED_LIST_ENTRY_TEMPLATE": "#templateAddSectionAddedListEntry",

	"courseData": undefined,
	"userData": undefined,

	"addedEntryMap": {},
	"searchResultDropdowns": [],

	"$searchBox": undefined,
	"$searchButton": undefined,
	"$searchResultList": undefined,
	"$addedList": undefined,

	"initialize": function (aOpts) {
		Scheduler.views.Sidebar.prototype.initialize.call(this, aOpts);
		var opts = _.defaults(aOpts, this.defaults);
		var self = this;

		this.courseData = opts.courseData;
		this.userData = opts.userData;

		this.addedEntryMap = {};
		this.searchResultDropdowns = [];

		this.$searchBox = this.$el.find("#sectionSearchBox");
		this.$searchButton = this.$el.find("#sectionSearchButton");
		this.$searchResultList = this.$el.find("#searchResultList");
		this.$addedList = this.$el.find("#addedList");

		this.userData.get("userClassList").each(function (aEntry) {
			self.addAddedClassEntry(aEntry, false);
		});

		this.bindEvents();
	},

	"bindEvents": function () {
		var self = this;

		// this.courseData.on("change:classList", function () {
		// 	console.log("changed!");
		// });
		var userClassList = this.userData.get("userClassList");

		userClassList.on("add", function (aInsert) {
			self.addAddedClassEntry(aInsert, true);
		});

		userClassList.on("remove", function (aRemoved) {
			self.removeAddedClassEntry(aRemoved, true);
		});

		this.$searchBox.keyup($.debounce(250, $.proxy(this.search, this)));

		this.$searchButton.click(function (aEvent) {
			aEvent.preventDefault();
			self.search();
		});
	},

	"search": function () {
		var input = this.$searchBox.val();
		var self = this;

		if (input && input.length) {
			// Massage data into correct format: course [] -> section [] -> class
			this.courseData.search(input, function (aData) {
				var searchResultMap = {};		// This is used for fast lookup of results.
				var searchResultList = [];		// This stores results in deterministic ordering.

				aData.forEach(function (aElem) {
					var courseKey =
						sprintf("%s %s", aElem.get("subject"), aElem.get("catalog_number"));
					var sectionKey = aElem.get("sectionType");

					var courseMap = searchResultMap[courseKey];
					if (!courseMap) {
						courseMap = {};
						searchResultList.push({
							"courseName": courseKey,
							"sections": courseMap
						});
					}

					var sectionList = courseMap[sectionKey];
					if (!sectionList)
						sectionList = [];

					sectionList.push(aElem);
					courseMap[sectionKey] = sectionList;
					searchResultMap[courseKey] = courseMap;
				});

				console.log(searchResultList);
				self.buildSearchResultList(searchResultList);
			});
		}
	},

	"buildSearchResultList": function (aSearchData) {
		_.forEach(this.searchResultDropdowns, function (aView) {
			aView.destroy();
		});

		var self = this;

		this.searchResultDropdowns = _.map(aSearchData, function (aElem, aIndex) {
			var rootElem = self.getDropdownListEntryHtml();

			var dropdown = new Common.Dropdown({
				"el": rootElem,
				"titleHtml": aElem.courseName,
				"titleClass": "heading-1",
				"optionList": _.map(aElem.sections, function (aElem, aKey) {
					return new Common.Dropdown({
						"el": "<section></section>",
						"titleHtml": aKey,
						"titleClass": "heading-2",
						"optionClass": "heading-3 clickable",
						"optionList": _.map(aElem, function (aElem) {
							return new Scheduler.views.SearchResultEntry({
								"section": aElem
							}).click($.proxy(self.addSection, self));
						})
					});
				})
			});

			self.$searchResultList.append(dropdown.$el);

			return dropdown;
		});
	},

	"addSection": function (aSection) {
		this.userData.get("userClassList").add(aSection);
	},

	"removeSection": function (aSection) {
		this.userData.get("userClassList").remove(aSection);
	},

	"addAddedClassEntry": function (aSection, aAnimated) {
		var self = this;
		var $addedEntry = $(_.template($(this.ADDED_LIST_ENTRY_TEMPLATE).html(), {
			"subject": aSection.get("subject"),
			"catalog": aSection.get("catalog_number"),
			"section": aSection.get("sectionNumber"),
			"type": aSection.get("sectionType"),
			"times": aSection.getAggregateTimeString()
		}));

		$addedEntry.find("[data-id='remove']").click(function (aEvent) {
			self.removeSection(aSection);
		});

		this.addedEntryMap[aSection.get("uid")] = $addedEntry;
		this.$addedList.append($addedEntry);
	},

	"removeAddedClassEntry": function (aSection, aAnimated) {
		var uid = aSection.get("uid");
		this.addedEntryMap[uid].detach();
		this.addedEntryMap[uid] = undefined;
	}
});