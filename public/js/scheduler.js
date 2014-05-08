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
	"defaults": {

	},

	"initialize": function (aOpts) {
		Backbone.View.prototype.initialize.call(this, aOpts);
		var opts = aOpts;
		if (this.defaults) {
			if (_.isFunction(this.defaults))
				opts = _.defaults(aOpts, this.defaults());
			else
				opts = _.defaults(aOpts, this.defaults);
		}
		this.options = opts;
		this.setUp(aOpts)
	},

	/**
	 * Implement this for constructor behaviour.
	 */
	"setUp": function (aOpts) {},

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

	/**
	 * Converts a 1 argument function to a 2 argument function that passes on the second parameter.
	 */
	"fn2": function (aFn) {
		var self = this;
		return function (a, aValue) { aFn.call(self, aValue); };
	},

	"onDestroy": function () { }
});