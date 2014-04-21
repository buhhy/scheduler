/**
 * A view representing an entry found through the search engine.
 */
Scheduler.views.SearchResultEntry = Scheduler.views.View.extend({
	"defaults": {
		"section": undefined
	},

	"section": undefined,

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);

		this.options = opts;
		this.section = opts.section;

		this.setElement(this.buildElement(opts.section));
	},

	"buildElement": function (aSectionModel) {
		return $(_.template($("#templateSearchResultEntry").html(), {
			"catalog": aSectionModel.get("sectionNumber"),
			"times": aSectionModel.getAggregateTimeString()
		}));
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