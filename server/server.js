var sprintf = require("./lib/sprintf.min");
var express = require("express");
var cors = require("cors");
var classData = require("./classData");
var mongoStore = require("./mongoStore");
var app = express();

var port = 4888;

app.use(cors());

app.get("/api/class", function (req, res) {
	classData.currentTerm(function (aCurrentTerm) {
		mongoStore.findClasses(aCurrentTerm, function (aClasses) {
			res.json(aClasses || []);
		});
	});
});

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

classData.currentTerm(function (aCurrentTerm) {
	mongoStore.findClasses(aCurrentTerm, function (aClasses) {
		if (!aClasses || !aClasses.length) {
			classData.reloadClassData(aCurrentTerm, function (aData, aTerm) {
				console.log("Fetched " + aData.length + " entries.");
				mongoStore.storeClasses(aData, aTerm)
			});
		}
	});
});
