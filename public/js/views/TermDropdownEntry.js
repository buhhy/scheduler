/**
 * A view representing an individual entry for the term selection dropdown.
 */
Scheduler.views.TermDropdownEntry = Scheduler.views.View.extend({
	"defaults": {
		"term": undefined
	},

	"setUp": function (aOpts) {
		this.term = aOpts.term;
		this.setElement(sprintf("<span>%s</span>", aOpts.term.name));
	}
});
