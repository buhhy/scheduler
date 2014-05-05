/**
 * A view representing an entry found through the search engine.
 */
Scheduler.views.SearchResultEntry = Scheduler.views.View.extend({
	"defaults": {
		"section": undefined
	},

	"TEMPLATE_ID": "#templateSearchResultEntry",

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);

		this.options = opts;

		this.setElement(this.buildElement(opts.section));
	},

	"buildElement": function (aSectionModel) {
		return $(_.template($(this.TEMPLATE_ID).html(), {
			"catalog": aSectionModel.get("sectionNumber"),
			"times": aSectionModel.getAggregateTimeString()
		}));
	},

	"click": function (aCallback) {
		var self = this;
		if (aCallback) {
			this.$el.click(function (aEvent) {
				aEvent.preventDefault();
				aCallback(self.options.section);
			});
		}
		return this;
	}
});