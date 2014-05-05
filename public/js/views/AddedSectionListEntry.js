/**
 * A view representing the course dropdown in the added section list that contains all
 * the added sections belonging to the course.
 */
Scheduler.views.AddedSectionListEntry = Scheduler.views.View.extend({
	"defaults": {
		"course": undefined
	},

	"TEMPLATE_ID": "#templateAddSectionAddedListEntry",

	"addedEntryMap": undefined

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);

		this.options = opts;
		this.addedEntryMap = {};

		this.setElement(this.buildElement(opts.section));
	},

	"buildElement": function (aCourseModel) {
		return $(_.template($(this.TEMPLATE_ID).html(), {
			"catalog": aCourseModel.get("sectionNumber"),
			"times": aCourseModel.getAggregateTimeString()
		}));
	},

	"addSection": function (aSectionModel) {
		var self = this;
		var $addedEntry = $(_.template($(this.TEMPLATE_ID).html(), {
			"subject": aSectionModel.get("subject"),
			"catalog": aSectionModel.get("catalogNumber"),
			"section": aSectionModel.get("sectionNumber"),
			"type": aSectionModel.get("sectionType"),
			"times": aSectionModel.getAggregateTimeString()
		}));

		$addedEntry.find("[data-id='remove']").click(function (aEvent) {
			self.removeSection(aSectionModel);
		});

		this.addedEntryMap[aSectionModel.get("uid")] = $addedEntry;
		this.$addedList.append($addedEntry);
	},

	"click": function (aCallback) {
		var self = this;
		if (aCallback) {
			this.$el.click(function (aEvent) {
				aEvent.preventDefault();
				aCallback(self.section);
			});
		}
		return this;
	}
});