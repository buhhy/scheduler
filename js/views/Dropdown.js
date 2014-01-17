if (!Common)
	Common = {};

Common.Dropdown = Backbone.View.extend({
	"default": {

	},

	"initialize": {
		var opts = _.defaults(aOpts, this.defaults);
	}
});

$(function () {
	$(".dropdown").click(function (aEvent) {
		aEvent.stopPropagation();
		$(this).toggleClass("active");
	});

	$(document).click(function() {
		// all dropdowns
		$(".dropdown").removeClass('active');
	});
});