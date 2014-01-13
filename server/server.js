var sprintf = require("./lib/sprintf.min");
var express = require("express");
var cors = require("cors");
var classData = require("./classData");
var mongoStore = require("./mongoStore");
var searchIndex = require("./searchIndex");

var app = express();
var port = 4888;

var classQueryResponse = function (aResponse, aTerm, aQuery) {
	if (aQuery && aQuery.length) {
		aResponse.json(searchIndex.search(aTerm, aQuery));
	} else {
		mongoStore.findClasses(aTerm, function (aClasses) {
			aResponse.json(aClasses || []);
		});
	}
}

app.use(cors());

app.get("/api/class", function (req, res) {
	var query = req.param("search");

	console.log(query);

	classData.currentTerm(function (aCurrentTerm) {
		classQueryResponse(res, aCurrentTerm, query);
	});
});

app.get("/api/:term/class", function (req, res) {
	var term = parseInt(req.params.term);
	var query = req.param("search");

	if (isNaN(term) || term === null || term === undefined) {
		res.json({
			"error": sprintf.sprintf("Invalid term identifier: %s", req.params.term)
		});
	} else {
		classQueryResponse(res, term, query);
	}
});

app.get("/api/term", function (req, res) {
	classData.currentTerms(function (aData) {
		res.json(aData);
	});
});

app.listen(port);

console.log("Starting server on port " +  "4888");




var refreshMongoCache = function (aTerm) {
	classData.reloadClassData(aTerm, function (aTerm, aData) {
		console.log("Fetched " + aData.length + " entries.");
		mongoStore.storeClasses(aTerm, aData);
		searchIndex.rebuildIndex(aTerm, aData);
	});
}

var refreshDataCaches = function () {
	classData.currentTerms(function (aTerms) {
		Object.keys(aTerms).forEach(function (aKey) {
			var termId = aTerms[aKey].id;
			console.log(sprintf.sprintf("Verifying data for term %d.", termId));
			mongoStore.findClasses(termId, function (aClasses) {
				if (!aClasses || !aClasses.length) {
					refreshMongoCache(termId);
				} else {
					searchIndex.rebuildIndex(termId, aClasses);
				}
			});
		});
	});
}

// TODO: In the future, we probably want to refresh the class list once every few days.
refreshDataCaches();
