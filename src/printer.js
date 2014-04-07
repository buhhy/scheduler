var path = require("path");
var fs = require('fs');
var wkhtmltopdf = require("./lib/wkhtmltopdf");

var wkparams = {
	"pageSize": "letter",
	"dpi": "96",
	"disable-smart-shrinking": "",
	"disable-javascript": "",
	"debug-javascript": "",
	"orientation": "landscape",
	"marginTop": "0mm",
	"marginBottom": "0mm",
	"marginLeft": "0mm",
	"marginRight": "0mm",
	"logging": false
};

exports.print = function (aUrl) {
	return wkhtmltopdf(aUrl, JSON.parse(JSON.stringify(wkparams))); // Clones the parameters
};