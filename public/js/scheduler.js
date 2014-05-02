var Scheduler = {
    "views": {},
    "models": {}
};

Scheduler.models.Model = Backbone.Model.extend({
	"getAndSet": function (aKey, aValue) {
		var model = this.get(aKey);
		model.reset(aValue[aKey]);
		return model;
	},

	"reset": function (aValue) {
		this.set(this.parse(aValue));
	}
});

Scheduler.models.Collection = Backbone.Collection.extend({
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