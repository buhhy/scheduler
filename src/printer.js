var path = require("path");
var fs = require('fs');
var wkhtmltopdf = require("./lib/wkhtmltopdf");

var wkparams = {
	"pageSize": "letter",
	"orientation": "landscape",
	"marginTop": "0mm",
	"marginBottom": "0mm",
	"marginLeft": "0mm",
	"marginRight": "0mm"
};

exports.print = function (aOnFinish) {
	var wkhtmltopdf = require('wkhtmltopdf');

	// URL
	wkhtmltopdf('http://apple.com/', wkparams).pipe(fs.createWriteStream('out1.pdf'));

	// HTML
	// wkhtmltopdf('<h1>Test</h1><p>Hello world</p>', wkparams).pipe(res);

	// output to a file directly
	wkhtmltopdf('http://apple.com/', { "pageSize": "letter", output: 'out2.pdf' });

	// Optional callback
	wkhtmltopdf('http://google.com/', { pageSize: 'letter' }, function (code, signal) {
	});
	wkhtmltopdf('http://google.com/', function (code, signal) {
		aOnFinish();
	});
};

exports.test = function () {
	// URL
	return wkhtmltopdf('http://google.com/', wkparams);
};