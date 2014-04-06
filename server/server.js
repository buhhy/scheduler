var sprintf = require("./lib/sprintf.min");
var express = require("express");
var cors = require("cors");
var classData = require("./classData");
var mongoStore = require("./mongoStore");
var printer = require("./printer");
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

app.get("/api/class", function (aReq, aRes) {
	var query = aReq.param("search");

	console.log(query);

	classData.currentTerm(function (aCurrentTerm) {
		classQueryResponse(aRes, aCurrentTerm, query);
	});
});

app.get("/api/:term/class", function (aReq, aRes) {
	var term = parseInt(aReq.params.term);
	var query = aReq.param("search");

	if (isNaN(term) || term === null || term === undefined) {
		aRes.json({
			"error": sprintf.sprintf("Invalid term identifier: %s", aReq.params.term)
		});
	} else {
		classQueryResponse(aRes, term, query);
	}
});

app.get("/api/term", function (aReq, aRes) {
	classData.currentTerms(function (aData) {
		aRes.json(aData);
	});
});

app.get("/api/print", function (aReq, aRes) {
	// printer.print(function (aRes) {
	// 	console.log("wut");
	// 	aRes.json({"success": "whoa"});
	// });
	printer.test().pipe(aRes);
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
// refreshDataCaches();
