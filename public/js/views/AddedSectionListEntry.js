/**
 * A view representing the course dropdown in the added section list that contains all
 * the added sections belonging to the course.
 */
Scheduler.views.AddedSectionListEntry = Scheduler.views.View.extend({
	"defaults": {
		"subject": undefined,
		"catalogNumber": undefined,
		"title": undefined,
		"defaultModels": undefined,
		"onClick": undefined
	},

	"HEADER_TEMPLATE_ID": "#templateAddSectionAddedListGroupHeader",
	"ENTRY_TEMPLATE_ID": "#templateAddSectionAddedListEntry",

	"dropdown": undefined,
	"addedEntries": undefined,

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);

		this.options = opts;
		this.addedEntries = [];

		this.dropdown = this.buildElement();

		this.setElement(this.dropdown.$el);

		_.forEach(opts.defaultModels, $.proxy(this.addSection, this));
	},

	"buildElement": function () {
		var opts = this.options;

		return new Common.Dropdown({
			"el": "<section></section>",
			"titleHtml": _.template($(this.HEADER_TEMPLATE_ID).html(), {
				"subject": opts.subject,
				"catalog": opts.catalogNumber,
				"title": opts.title
			}),
			"titleClass": "heading-1",
			"optionClass": "heading-2",
			"optionList": []
		});
	},

	"addSection": function (aSectionModel) {
		var self = this;
		var $addedEntry = $(_.template($(this.ENTRY_TEMPLATE_ID).html(), {
			"section": aSectionModel.get("sectionNumber"),
			"type": aSectionModel.get("sectionType"),
			"times": aSectionModel.getAggregateTimeString()
		}));

		$addedEntry.find("[data-id='remove']").click(function (aEvent) {
			if (self.options.onClick)
				self.options.onClick(aSectionModel);
		});

		var addIndex = 0;

		// The list is sorted by section type (LEC), then by section number (001)
		for (; addIndex < this.addedEntries.length; addIndex ++) {
			var ent = this.addedEntries[addIndex];
			var st1 = aSectionModel.get("sectionType"), st2 = ent.get("sectionType");
			var sn1 = aSectionModel.get("sectionNumber"), sn2 = ent.get("sectionNumber");

			if (st1 < st2 || (st1 === st2 && sn1 <= sn2))
				break;
		}

		this.dropdown.add($addedEntry, addIndex);
		this.addedEntries.splice(addIndex, 0, aSectionModel);
		return this;
	},

	"removeSection": function (aSectionModel) {
		var remove = -1;

		// Get the index of the to-be-removed model
		for (var i = 0; i < this.addedEntries.length; i++) {
			if (this.addedEntries[i].get("uid") === aSectionModel.get("uid")) {
				remove = i;
				break;
			}
		}

		if (remove !== -1) {
			this.dropdown.remove(remove);
			this.addedEntries.splice(remove, 1);
		}

		return this;
	},

	"size": function () {
		return this.addedEntries.length;
	},

	"destroy": function () {
		this.dropdown.destroy();
		this.$el.detach();
		this.addedEntries = [];
		this.dropdown = undefined;
	}
});