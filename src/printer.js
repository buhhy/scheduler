var path = require("path");
var fs = require('fs');
var sprintf = require('./lib/sprintf');
var wkhtmltopdf = require("./lib/wkhtmltopdf");

var size = function (aWidth, aHeight) { return { "width": aWidth, "height": aHeight }; };
var mm = function (aNum) { return sprintf.s("%dmm", aNum); };

var PAPER_SIZES = {
	"A4": size(210, 297),
	"letter": size(279.4, 215.9)
};

exports.print = function (aUrl, aPageSize) {
	pageSize = aPageSize || PAPER_SIZES.A4;

	return wkhtmltopdf(aUrl, {
		"pageWidth": mm(pageSize.width),
		"pageHeight": mm(pageSize.height),
		"dpi": "96",
		"disable-smart-shrinking": true,
		"disable-javascript": false,
		"debug-javascript": true,
		"orientation": "landscape",
		"marginTop": "0",
		"marginBottom": "0",
		"marginLeft": "0",
		"marginRight": "0",
		"logging": true,
		"post": {
			"pageSize": pageSize
		},
		"custom-header": ["CONTENT-TYPE", "application/x-www-form-urlencoded"]
	});
};

exports.PAPER_SIZES = PAPER_SIZES;