Scheduler.views.AddSectionSidebar = Scheduler.views.Sidebar.extend({
	"defaults": {
		"courseData": undefined,
		"userData": undefined
	},

	"SEARCH_RESULT_GROUP_HEADER_TEMPLATE": "#templateSearchResultGroupHeader",
	"ADDED_SECTION_ENTRY_TEMPLATE": "#templateAddSectionAddedListEntry",

	"courseData": undefined,
	"userData": undefined,

	"addedTermsList": undefined,
	"addedSectionList": undefined,
	"searchResultDropdowns": undefined,
	"termSelectorDropdown": undefined,

	"$searchBox": undefined,
	"$searchButton": undefined,
	"$searchResultList": undefined,
	"$searchWarningLabel": undefined,
	"$addedWarningLabel": undefined,
	"$termSelector": undefined,

	"initialize": function (aOpts) {
		Scheduler.views.Sidebar.prototype.initialize.call(this, aOpts);
		var opts = _.defaults(aOpts, this.defaults);
		var self = this;

		this.courseData = opts.courseData;
		this.userData = opts.userData;

		this.searchResultDropdowns = [];
		this.addedTermsList = [];

		this.$searchBox = this.$el.find("#sectionSearchBox");
		this.$searchButton = this.$el.find("#sectionSearchButton");
		this.$searchResultList = this.$el.find("[data-id='searchResultList']");
		this.$searchWarningLabel = this.$el.find("[data-id='searchWarningLabel']");
		this.$addedWarningLabel = this.$el.find("[data-id='addedWarningLabel']");

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
			"el": "[data-id='addedList']",
			"$emptyWarningEl": this.$addedWarningLabel
		});

		this.termSelectorDropdown = new Common.Dropdown({
			"el": "[data-id='termSelector']",
			"titleHtml": "Select a term",
			"titleClass": "heading-1",
			"optionClass": "heading-2",
			"optionList": []
		});

		this.bindEvents();
		this.changeSelectedTerm(this.courseData.get("selectedTermId"));
	},

	"onShow": function () {
		this.$searchBox.focus();
	},

	"bindEvents": function () {
		var self = this;

		// Close term dropdown on outside click
		$("html").click(function () {
			self.termSelectorDropdown.setOpen(false, true);
		});

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

		var addTermEntry = function (aTerm) {
			var view = new Scheduler.views.TermDropdownEntry({
				"term": aTerm
			});
			self.termSelectorDropdown.add(view, null, function () {
				self.courseData.set("selectedTermId", aTerm.id);
				self.termSelectorDropdown.setOpen(false, true);
			});
			self.addedTermsList.push(view);
		};

		this.courseData.on("change:termList", function (_, aTermList) {
			addTermEntry(aTermList["previousTerm"]);
			addTermEntry(aTermList["currentTerm"]);
			addTermEntry(aTermList["nextTerm"]);
		});

		this.courseData.on("change:selectedTermId", function (_, aTermId) {
			self.changeSelectedTerm(aTermId);
		});
	},

	"changeSelectedTerm": function (aTermId) {
		if (aTermId != null) {
			for (var i = 0; i < this.addedTermsList.length; i++) {
				var curTerm = this.addedTermsList[i].term;
				var comp = curTerm.id === aTermId;
				this.termSelectorDropdown.setActive(i, comp);
				if (comp)
					this.termSelectorDropdown.setTitleHtml(curTerm.name);
			}
		}
	},

	"search": function () {
		var input = this.$searchBox.val();
		var self = this;

		if (input && input.length) {
			this.courseData.search(input, function (aData) {
				self.buildSearchResultList(aData, input);
			});
		}
	},

	"buildSearchResultList": function (aSearchData, aSearchQuery) {
		_.forEach(this.searchResultDropdowns, function (aView) {
			aView.destroy();
		});

		var self = this;

		if (aSearchData.length > 0) {
			// If the search returned results, then build the result list and hide the label
			if (this.$searchWarningLabel.hasClass("active")) {
				this.$searchWarningLabel.fadeTo(100, 0.0, function () {
					self.$searchWarningLabel.hide().removeClass("active");
				});
			}

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
		} else {
			if (!this.$searchWarningLabel.hasClass("active")) {
				// Otherwise, show the no results label and the search query
				this.$searchWarningLabel.show().fadeTo(100, 1.0, function () {
					self.$searchWarningLabel.addClass("active");
				});
			}
			this.$searchWarningLabel.text(
				sprintf("No results found for '%s', try searching by course code (STV 100) or by " +
						"course name (Society, Technology and Values).", aSearchQuery));
		}
	},

	"addSection": function (aSection) {
		this.userData.get("userClassList").add(aSection);
	},

	"removeSection": function (aSection) {
		this.userData.get("userClassList").remove(aSection);
	}
});