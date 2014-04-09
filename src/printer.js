var path = require("path");
var fs = require('fs');
var wkhtmltopdf = require("./lib/wkhtmltopdf");

exports.print = function (aUrl, aData) {
	aData = aData || {};

	return wkhtmltopdf(aUrl, wkparams = {
		"pageSize": "letter",
		"dpi": "96",
		"disable-smart-shrinking": true,
		"disable-javascript": false,
		"debug-javascript": true,
		"orientation": "landscape",
		"marginTop": "0mm",
		"marginBottom": "0mm",
		"marginLeft": "0mm",
		"marginRight": "0mm",
		"logging": true,
		"post": ["data", aData],
		"custom-header": ["CONTENT-TYPE", "application/x-www-form-urlencoded"]
	});
};