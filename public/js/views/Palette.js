Scheduler.views.Palette = Scheduler.views.View.extend({
	"defaults": {
		"colors": [],			// List of colors strings in hex
		"model": undefined,		// Model bound to color picker
		"colorName": "",		// The color in the model to modify
		"colorNameIndex": undefined	// This is for color shorthands arrays of values
	},

	/**
	 * Collection of color models bound to color picker, this can be used to change the color of multiple
	 * selected entities, like courses.
	 */
	"collection": undefined,
	"$dots": undefined,

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);
		var self = this;

		this.collection = new Scheduler.models.ThemeCollection();

		this.options = opts;

		this.$el.append(_.template($("#templatePalette").html(), {
			"colors": this.options.colors
		}));

		this.$dots = this.$el.find("[data-id='color-indicator']");
		this.$dots.click(function (aEvent) {
			var colorAttr = $(this).attr("data-color");
			var allSetToColor = true;

			// Checks if every bound model is already set to the currently clicked color, if they
			// are, then deactivate the color on those models / reset to default.
			self.collection.forEach(function (aModel) {
				var sameSetting = self.getProperty(aModel) === colorAttr;
				allSetToColor = allSetToColor && sameSetting;
			});

			// TODO: set to default instead of clearing property
			if (allSetToColor)
				colorAttr = "";

			self.collection.forEach(function (aModel) {
				self.setProperty(aModel, colorAttr);
			});
		});

		this.refreshSelected();

		if (opts.model)
			this.setModels([ opts.model ]);
	},

	"getProperty": function (aModel) {
		var key = this.options.colorName;
		var index = this.options.colorNameIndex;

		if (aModel != null && key != null) {
			var prop = aModel.get(key);
			if (index != null)
				if (prop != null)
					return prop[index];
			else
				return prop;
		}
		return null;
	},

	"setProperty": function (aModel, aValue) {
		var key = this.options.colorName;
		var index = this.options.colorNameIndex;

		if (aModel != null && key != null) {
			if (index != null) {
				var prop = _.clone(aModel.get(key));
				prop[index] = aValue;
				aModel.set(key, prop);
			} else {
				aModel.set(key, aValue);
			}
		}
	},

	"setModels": function (aModels) {
		var self = this;
		// Unbind events on existing models
		this.collection.forEach(function (aModel) {
			aModel.off(null, null, self);
		});

		var models = aModels || [];

		this.collection.reset(models);

		// Bind change events to new models
		this.collection.forEach(function (aModel) {
			aModel.on("change:" + self.options.colorName, function (aModel, aValue) {
				self.refreshSelected();
			}, self);
		});
	},

	"refreshSelected": function () {
		var curColors = {};
		var self = this;

		this.collection.forEach(function (aModel) {
			curColors[aModel.get(self.options.colorName)] = true;
		});

		// Add the `active` class to every color dot that is selected in the model collection
		this.$dots.each(function () {
			var $this = $(this);

			if (curColors[$this.attr("data-color")])
				$this.addClass("active");
			else
				$this.removeClass("active");
		});
	}
});