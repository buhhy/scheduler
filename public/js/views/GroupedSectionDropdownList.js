Scheduler.views.GroupedSectionDropdownList = Scheduler.views.View.extend({
	"defaults": {
		"sectionList": undefined,
		"createEntryViewFn": undefined,
		"nested": false,
		"$emptyWarningEl": undefined
	},

	"addedEntryMap": undefined,

	"setUp": function (aOpts) {
		this.bindEvents();

		this.addedEntryMap = {};

		aOpts.sectionList.each(function (aEntry) {
			self.addEntry(aEntry);
		});
	},

	"bindEvents": function () {
		var self = this;
		var sectionList = this.options.sectionList;

		sectionList.on("add", function (aInsert) {
			self.addEntry(aInsert, true);
		});

		sectionList.on("remove", function (aRemoved) {
			self.removeEntry(aRemoved, true);
		});

		sectionList.on("reset", function (aModels) {
			self.resetEntries(aModels, false);
		});
	},

	"addEntry": function (aSection) {
		var self = this;

		// Sections are grouped by subject and course number (STV 100)
		var courseKey = aSection.get("courseKey");
		var sectionGroup = this.addedEntryMap[courseKey];

		// Create a new group if one does not already exist
		if (sectionGroup == null) {
			sectionGroup = new Scheduler.views.GroupedSectionDropdownEntry({
				"subject": aSection.get("subject"),
				"catalogNumber": aSection.get("catalogNumber"),
				"title": aSection.get("title"),
				"defaultModels": [ aSection ],
				"createEntryViewFn": this.options.createEntryViewFn,
				"nested": this.options.nested
			});
			this.addedEntryMap[courseKey] = sectionGroup;
			this.$el.append(sectionGroup.$el);
		} else {
			sectionGroup.addSection(aSection);
		}
		this.changeAddedClasses(this.options.sectionList.size());
	},

	"removeEntry": function (aSection) {
		var courseKey = aSection.get("courseKey");
		var sectionGroup = this.addedEntryMap[courseKey];

		if (sectionGroup != null) {
			sectionGroup.removeSection(aSection);

			// If group is empty, we should remove the entire group
			if (sectionGroup.size() === 0) {
				sectionGroup.destroy();
				delete this.addedEntryMap[courseKey];
			}
		}
		this.changeAddedClasses(this.options.sectionList.size());
	},

	"resetEntries": function (aSections) {
		var self = this;
		_.forEach(_.values(this.addedEntryMap), function (aSectionGroup) {
			aSectionGroup.destroy();
		});
		this.addedEntryMap = {};
		aSections.forEach(function (aSection) {
			self.addEntry(aSection);
		});
		this.changeAddedClasses(aSections.size());
	},

	"changeAddedClasses": function (aCount) {
		if (this.options.$emptyWarningEl) {
			var self = this;

			if (aCount > 0) {
				if (this.options.$emptyWarningEl.hasClass("active")) {
					// If no classes have been added, display this message
					this.options.$emptyWarningEl.fadeTo(100, 0.0, function () {
						self.options.$emptyWarningEl.hide().removeClass("active");
					});
				}
			} else {
				if (!this.options.$emptyWarningEl.hasClass("active")) {
					// Otherwise, hide the label
					this.options.$emptyWarningEl.show().fadeTo(100, 1.0, function () {
						self.options.$emptyWarningEl.addClass("active");
					});
				}
			}
		}
	},
});