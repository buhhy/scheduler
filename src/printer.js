var path = require("path");
var fs = require('fs');
var sprintf = require('./lib/sprintf');
var wkhtmltopdf = require("./lib/wkhtmltopdf");

var Size = function (aWidth, aHeight, aUnit) {
	this.width = aWidth;
	this.height = aHeight;
	this.unit = aUnit || "px";
};

Size.prototype.widthStr = function () { return sprintf.s("%d%s", this.width, this.unit); };
Size.prototype.heightStr = function () { return sprintf.s("%d%s", this.height, this.unit); };
Size.prototype.flip = function () { return new Size(this.height, this.width, this.unit); };

Size.prototype.toCss = function () {
	return sprintf.s("width: %s; height: %s;", this.widthStr(), this.heightStr());
};

Size.prototype.toQuery = function () {
	return sprintf.s("width=%s&height=%s", this.widthStr(), this.heightStr());
};

var PAPER_SIZES = {
	"A4": new Size(210, 297, "mm"),
	"letter": new Size(279.4, 215.9, "mm")
};

var IMAGE_SIZES = {
	"small": new Size(600, 315),
	"medium": new Size(1200, 650),
	"large": new Size(1600, 850)
};

exports.toPdf = function (aUrl, aPdfPath, aPageSize) {
	pageSize = aPageSize || PAPER_SIZES.A4;

	return wkhtmltopdf.toPdf(aUrl, {
		"output": aPdfPath,
		"pageWidth": pageSize.widthStr(),
		"pageHeight": pageSize.heightStr(),
		"dpi": "96",
		"disable-smart-shrinking": true,
		"disable-javascript": false,
		"debug-javascript": true,
		"marginTop": "0",
		"marginBottom": "0",
		"marginLeft": "0",
		"marginRight": "0",
		"logging": true,
		"custom-header": ["CONTENT-TYPE", "application/x-www-form-urlencoded"]
	});
};

exports.toImage = function (aUrl, aImagePath, aImageSize) {
	imageSize = aImageSize || IMAGE_SIZES.medium;

	return wkhtmltopdf.toImage(aUrl, {
		"output": aImagePath,
		"width": imageSize.width,
		"height": imageSize.height,
		"disable-javascript": false,
		"debug-javascript": true,
		"logging": true,
		"custom-header": ["CONTENT-TYPE", "application/x-www-form-urlencoded"]
	});
};

exports.PAPER_SIZES = PAPER_SIZES;
exports.IMAGE_SIZES = IMAGE_SIZES;
