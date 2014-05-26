var fs = require("fs");
var path = require("path");
var sprintf = require("../lib/sprintf").s;

var FILE_ENCODING = "utf-8";
var LINE_ENDING = "\n";

var JSManager = function (aAssetPath) {
	this.assetDir = aAssetPath;
	this.cacheDir = path.join(aAssetPath, "gen/js");
	this.cacheUrl = "/gen/js";
	this.filePaths = {};
};

JSManager.prototype.addFile = function (aNamespace, aFilePath) {
	var namespace = aNamespace || "_global";
	this.filePaths[aNamespace] = this.filePaths[aNamespace] || [];
	this.filePaths[aNamespace].push(aFilePath);
};

JSManager.prototype.concatJs = function () {
	var self = this;

	for (var key in this.filePaths) {
		var filePaths = this.filePaths[key];
		var fn = key + ".js";
		var destPath = path.join(this.cacheDir, fn);
		var destUrl = sprintf("%s/%s", this.cacheUrl, fn);

		var fileContents = filePaths.map(function (aFilePath) {
			return fs.readFileSync(path.join(self.assetDir, aFilePath), FILE_ENCODING);
		});

		fs.writeFileSync(destPath, fileContents.join(LINE_ENDING), FILE_ENCODING);

		console.log(sprintf("Concatenated %d Javascript files into file: `%s`.", filePaths.length, fn));

		this.filePaths[key] = [ destUrl ];
	}
}

JSManager.prototype.getJsPaths = function (aNamespace) {
	return this.filePaths[aNamespace];
};

exports.createJsManager = function (aAssetPath) {
	return new JSManager(aAssetPath);
};
