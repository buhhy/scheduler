Scheduler.views.Palette = Scheduler.views.View.extend({
	"defaults": {
		"colors": [],			// List of colors strings in hex
		"model": undefined,		// Model to write the color data
		"colorName": ""			// The color in the model to modify
	},

	"colors": undefined,
	"collection": undefined,
	"colorName": undefined,
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
			var allSame = true;

			self.collection.forEach(function (aModel) {
				allSame = allSame && (aModel.get(self.options.colorName) === colorAttr);
			});

			if (allSame)
				colorAttr = "";

			self.collection.forEach(function (aModel) {
				aModel.set(self.options.colorName, colorAttr);
			});
		});

		this.refreshSelected();

		if (opts.model)
			this.setModels([ opts.model ]);
	},

	"setModels": function (aModels) {
		var self = this;
		this.collection.forEach(function (aModel) {
			aModel.off(null, null, self);
		});

		var models = aModels || [];

		this.collection.reset(models);

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

		this.$dots.each(function () {
			var $this = $(this);

			if (curColors[$this.attr("data-color")])
				$this.addClass("active");
			else
				$this.removeClass("active");
		});
	}
});