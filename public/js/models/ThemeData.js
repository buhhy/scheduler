// TODO: pull from server
var colors = [
	0xFFFFFF,
	0xFF7D7D,
	0xFFFCD2,
	0x7FBC57,
	0x26B4DB,
	0xE598D3,
	0xFFE299,
	0xBCBCBC,
	0xE06E6E,
	0xFFF799,
	0x60963E,
	0x3790B7,
	0xCC71B4,
	0xF9BF1C,
	0x6D6D6D,
	0xBA4343,
	0xF2E568,
	0x537C38,
	0x2D618C,
	0x894DA0,
	0xB27200,
	0x444444,
	0x893030,
	0xEAD436,
	0x40632A,
	0x1D4872,
	0x703B8C,
	0x75421B
];

var stringifyColors = function (aColors) {
	return _.map(aColors, function (aColor) {
		var cstr = aColor.toString(16);
		while (cstr.length < 6)
			cstr = "0" + cstr;
		return sprintf("#%s", cstr);
	});
};

var offset = function(aColor, aShift, aAmount) {
	return Math.max(Math.min(((aColor & (0xFF << aShift)) >>> aShift) + aAmount, 0xff), 0);
};

var offsetColors = function (aColors, aAmount) {

	return _.map(aColors, function (aColor) {
		var r = offset(aColor, 16, aAmount);
		var g = offset(aColor, 8, aAmount);
		var b = offset(aColor, 0, aAmount);

		var results = r << 16 | g << 8 | b;

		return results;
	});
};

var bgColors = stringifyColors(offsetColors(colors, 0x20));
var fontColors = stringifyColors(offsetColors(colors, -0x20));
var borderColors = stringifyColors(offsetColors(colors, 0));

Scheduler.models.ThemeData = Scheduler.models.Model.extend({
	"defaults": {
		"table": {
			"backgroundColor": bgColors,
			"fontColor": fontColors,
			"borderColor": borderColors
		},
		"days": {
			"backgroundColor": bgColors,
			"fontColor": fontColors
		},
		"time": {
			"backgroundColor": bgColors,
			"fontColor": fontColors
		},
		"section": {
			"backgroundColor": bgColors,
			"fontColor": fontColors,
			"borderColor": borderColors
		}
	}
});