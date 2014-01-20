Scheduler.views.Palette = Scheduler.views.View.extend({
	"defaults": {
		"colors": [],			// List of colors strings in hex
		"model": undefined,		// Model to write the color data
		"colorName": ""			// The color in the model to modify
	},

	"colors": undefined,
	"$dots": undefined,

	"initialize": function (aOpts) {
		var opts = _.defaults(aOpts, this.defaults);

		this.colors = opts.colors.slice();

		this.$el.append(_.template($("#templatePalette").html(), {
			"colors": this.colors
		}));
		this.$dots = this.$el.find(".color-indicator");
	}
});