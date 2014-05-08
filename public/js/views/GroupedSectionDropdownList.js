Scheduler.views.GroupedSectionDropdownList = Scheduler.views.View.extend({
	"defaults": {
		"sectionList": undefined,
		"createEntryViewFn": undefined
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
				"onClick": function (aSection) {
					self.removeSection(aSection);
				},
				"createEntryViewFn": this.options.createEntryViewFn
			});
			this.addedEntryMap[courseKey] = sectionGroup;
			this.$el.append(sectionGroup.$el);
		} else {
			sectionGroup.addSection(aSection);
		}
	},

	"removeEntry": function (aSection) {
		var courseKey = aSection.get("courseKey");
		var sectionGroup = this.addedEntryMap[courseKey];

		if (sectionGroup != null) {
			sectionGroup.removeSection(aSection);

			// If group is empty, we should remove the entire group
			if (sectionGroup.size() === 0) {
				sectionGroup.destroy();
				this.addedEntryMap[courseKey] = undefined;
			}
		}
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
	}
});