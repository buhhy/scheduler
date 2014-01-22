Scheduler.views.Palette = Scheduler.views.View.extend({
	"defaults": {
		"colors": [],			// List of colors strings in hex
		"model": undefined,		// Model to write the color data
		"colorName": ""			// The color in the model to modify
	},

	"colors": undefined,
	"model": undefined,
	"colorName": undefined,
	"$dots": undefined,

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);
		var self = this;

		this.options = opts;

		this.$el.append(_.template($("#templatePalette").html(), {
			"colors": this.options.colors
		}));

		this.$dots = this.$el.find("[data-id='color-indicator']");
		this.$dots.click(function (aEvent) {
			var colorAttr = $(this).attr("data-color");

			if (self.options.model.get(self.options.colorName) === colorAttr)
				colorAttr = "";

			self.options.model.set(self.options.colorName, colorAttr);
		});

		this.options.model.on("change:" + self.options.colorName, function (aModel, aValue) {
			self.refreshSelected();
		});
		this.refreshSelected();
	},

	"refreshSelected": function () {
		var curColor = this.options.model.get(this.options.colorName);
		this.$dots.each(function () {
			var $this = $(this);

			if ($this.attr("data-color") === curColor)
				$this.addClass("active");
			else
				$this.removeClass("active");
		})
	}
});