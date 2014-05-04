var path = require("path");

var sprintf = require("../lib/sprintf").s;

var MongoStore = require("../MongoStore");
var Printer = require("../Printer");
var RouteUtils = require("../utils/RouteUtils");

var createRoute = function (aSize, aFileNameTemplate, aFolderName, aFn, aCallback) {
	var callback = aCallback || function (aContinuationFn) { aContinuationFn(); };

	return function (aReq, aRes) {
		var hash = aReq.params.hash;

		MongoStore.findUserSchedule(hash, function (aSchedule, aError) {
			if (aError) {
				aRes.send(400, aError);
			} else {
				var previewUrl = sprintf("%s/preview/%s?%s",
					RouteUtils.localUrl, hash, aSize.toQuery());

				var fileName = sprintf(aFileNameTemplate, hash)

				var fileUrl = sprintf("%s/gen/%s/%s",
					RouteUtils.getRootUrlFromRequest(aReq), aFolderName, fileName);

				var filePath =
					path.join(RouteUtils.rootDir, "public", "gen", aFolderName, fileName);

				console.log(sprintf("Generating file from `%s` to directory `%s` with URL `%s`.",
					previewUrl, filePath, fileUrl));

				aFn(previewUrl, filePath, aSize, function () {
					callback(function () {
						aRes.json({ "path": fileUrl });
					});
				});
			}
		});
	};
};

exports.genPdf = createRoute(Printer.PAPER_SIZES.A4.flip(), "%s.pdf", "pdf", Printer.toPdf);
exports.genImg = createRoute(Printer.IMAGE_SIZES.medium, "%s.png", "img", Printer.toImage);
