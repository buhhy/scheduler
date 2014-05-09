Scheduler.views.AddSectionSidebar = Scheduler.views.Sidebar.extend({
	"defaults": {
		"courseData": undefined,
		"userData": undefined
	},

	"SEARCH_RESULT_GROUP_HEADER_TEMPLATE": "#templateSearchResultGroupHeader",
	"ADDED_SECTION_ENTRY_TEMPLATE": "#templateAddSectionAddedListEntry",

	"courseData": undefined,
	"userData": undefined,

	"addedSectionList": undefined,
	"searchResultDropdowns": undefined,

	"$searchBox": undefined,
	"$searchButton": undefined,
	"$searchResultList": undefined,

	"initialize": function (aOpts) {
		Scheduler.views.Sidebar.prototype.initialize.call(this, aOpts);
		var opts = _.defaults(aOpts, this.defaults);
		var self = this;

		this.courseData = opts.courseData;
		this.userData = opts.userData;

		this.searchResultDropdowns = [];

		this.$searchBox = this.$el.find("#sectionSearchBox");
		this.$searchButton = this.$el.find("#sectionSearchButton");
		this.$searchResultList = this.$el.find("#searchResultList");

		this.userData.get("userClassList").each(function (aEntry) {
			self.addAddedClassEntry(aEntry, false);
		});

		this.addedSectionList = new Scheduler.views.GroupedSectionDropdownList({
			"sectionList": this.userData.get("userClassList"),
			"createEntryViewFn": function (aSectionModel) {
				var $addedEntry = $(_.template($(self.ADDED_SECTION_ENTRY_TEMPLATE).html(), {
					"section": aSectionModel.get("sectionNumber"),
					"type": aSectionModel.get("sectionType"),
					"times": aSectionModel.getAggregateTimeString()
				}));

				$addedEntry.find("[data-id='remove']").click(function (aEvent) {
					self.removeSection(aSectionModel);
				});

				return $addedEntry;
			},
			"el": "#addedList"
		});

		this.bindEvents();
	},

	"onShow": function () {
		this.$searchBox.focus();
	},

	"bindEvents": function () {
		var self = this;

		// Removing auto-search on type because of performance, and because that feature sucks
		// this.$searchBox.keyup($.debounce(250, $.proxy(this.search, this)));
		this.$searchBox.keyup(function (aEvent) {
			if (event.which == 13 /* enter key */)
				self.search();
		});

		this.$searchButton.click(function (aEvent) {
			aEvent.preventDefault();
			self.search();
		});
	},

	"search": function () {
		var input = this.$searchBox.val();
		var self = this;

		if (input && input.length) {
			this.courseData.search(input, function (aData) {
				self.buildSearchResultList(aData);
			});
		}
	},

	"buildSearchResultList": function (aSearchData) {
		_.forEach(this.searchResultDropdowns, function (aView) {
			aView.destroy();
		});

		var self = this;

		this.searchResultDropdowns = _.map(aSearchData, function (aGroup, aIndex) {
			var rootElem = self.getDropdownListEntryHtml();

			var dropdown = new Common.Dropdown({
				"el": rootElem,
				"titleHtml": _.template($(self.SEARCH_RESULT_GROUP_HEADER_TEMPLATE).html(), {
					"subject": aGroup.subject,
					"catalog": aGroup.catalogNumber,
					"title": aGroup.title
				}),
				"titleClass": "heading-1",
				"optionList": _.map(aGroup.sections, function (aSection, aKey) {
					return new Common.Dropdown({
						"el": "<section></section>",
						"titleHtml": aKey,
						"titleClass": "heading-2",
						"optionClass": "heading-3 clickable no-padding",
						"optionList": aSection.map(function (aSection) {
							return new Scheduler.views.SearchResultEntry({
								"section": aSection
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
	}
});