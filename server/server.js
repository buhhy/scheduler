var sprintf = require("./lib/sprintf.min");
var express = require("express");
var classData = require("./classData");
var mongoStore = require("./mongoStore");
var app = express();

var port = 4888;

app.get("/api/:term/class", function (req, res) {
	var term = parseInt(req.params.term);
	if (isNaN(term) || term === null || term === undefined) {
		res.json({
			"error": sprintf.sprintf("Invalid term identifier: %s", req.params.term)
		});
	} else {
		mongoStore.findClasses(term, function (aClasses) {
			res.json(aClasses || []);
		});
	}
});

app.listen(port);

console.log("Starting server on port " +  "4888");

classData.reloadClassData(function (aData, aTerm) {
	console.log("Fetched " + aData.length + " entries.");
	mongoStore.storeClasses(aData, aTerm)
});