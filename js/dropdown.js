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