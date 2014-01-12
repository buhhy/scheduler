var Scheduler = {
    "views": {},
    "models": {}
};

Scheduler.models.Model = Backbone.Model.extend({
});

Scheduler.models.Collection = Backbone.Collection.Lunr.extend({
});

Scheduler.views.View = Backbone.View.extend({
	/**
	 * Detaches a view from its parent, and calls the parent's detach callback.
	 */
	"detachFromView": function () {
		this.onDestroy();
		this.$el.detach();
	},

	/**
	 * Attaches to a Backbone view.
	 */
	"attachToView": function (aElemView) {
		aElemView.$el.append(this.$el);
	},

	"onDestroy": function () { }
});