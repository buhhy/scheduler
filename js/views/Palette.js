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

		this.colors = opts.colors.slice();
		this.model = opts.model;
		this.colorName = opts.colorName;

		this.$el.append(_.template($("#templatePalette").html(), {
			"colors": this.colors
		}));
		this.$dots = this.$el.find("[data-id='color-indicator']");
		this.$dots.click(function (aEvent) {
			self.model.set(self.colorName, $(this).attr("data-color"));
		});
	}
});