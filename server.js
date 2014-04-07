var express = require("express");
var cors = require("cors");
var lessMiddleware = require("less-middleware");
var path = require("path");
var ejs = require('ejs');

var srcDir = path.join(__dirname, "src");
var assetDir = path.join(__dirname, "public");
var viewDir = path.join(__dirname, "views");

var sprintf = require(path.join(srcDir, "lib", "sprintf.min"));
var classData = require(path.join(srcDir, "classData"));
var mongoStore = require(path.join(srcDir, "mongoStore"));
var printer = require(path.join(srcDir, "printer"));
var searchIndex = require(path.join(srcDir, "searchIndex"));

var app = express();
var port = process.env.PORT || 4888;

// Prevents conflicts with underscore.js templates since both use <% ... %>
ejs.open = "@{";
ejs.close = "}";

app.configure(function () {
	// Put other configurations here:

	// TODO: Change force: true to once: true
	app.use(lessMiddleware("../less", {
		"dest": "css",
		"pathRoot": assetDir,
		"force": true,
		"compress": true,
		"debug": true
	}));

	app.use(express.static(assetDir));
});

app.engine('.html', require('ejs').__express);
app.set("view engine", "ejs");
app.set("views", viewDir);

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

app.get("/", function (aReq, aRes) {
	aRes.render("index.html", { /* params */ });
});

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
refreshDataCaches();
