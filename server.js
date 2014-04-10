var express = require("express");
var cors = require("cors");
var lessMiddleware = require("less-middleware");
var path = require("path");
var ejs = require('ejs');
var fs = require('fs');

var srcDir = path.join(__dirname, "src");
var assetDir = path.join(__dirname, "public");
var viewDir = path.join(__dirname, "views");
var encoding = "UTF-8";

var sprintf = require(path.join(srcDir, "lib", "sprintf"));
var classData = require(path.join(srcDir, "classData"));
var mongoStore = require(path.join(srcDir, "mongoStore"));
var printer = require(path.join(srcDir, "printer"));
var searchIndex = require(path.join(srcDir, "searchIndex"));

var app = express();
var port = process.env.PORT || 4888;

// Prevents conflicts with underscore.js templates since both use <% ... %>
ejs.open = "{{";
ejs.close = "}}";

app.engine('.html', require('ejs').__express);
app.set("view engine", "ejs");
app.set("views", viewDir);

app.configure(function () {
	// Put other configurations here:

	// TODO: Remove force: true, add once: true, change compress: true
	app.use(lessMiddleware("../less", {
		"dest": "css",
		"pathRoot": assetDir,
		"force": true,
		"compress": false,
		"debug": true
	}));

	app.use(express.bodyParser());
	app.use(express.static(assetDir));
	app.use(cors());
});


var classQueryResponse = function (aResponse, aTerm, aQuery) {
	if (aQuery && aQuery.length) {
		aResponse.json(searchIndex.search(aTerm, aQuery));
	} else {
		mongoStore.findClasses(aTerm, function (aClasses) {
			aResponse.json(aClasses || []);
		});
	}
}


app.get("/", function (aReq, aRes) {
	aRes.render("index.html", { /* params */ });
});

app.get("/preview/:hash", function (aReq, aRes) {
	mongoStore.findUserSchedule(aReq.params.hash, function (aData) {
		console.log(aData);
		// TODO: Less hackery here plz, retrieve page size from request
		var pageSize = printer.PAPER_SIZES.A4;
		var globalTheme = aData.globalTheme;
		var userClassList = aData.userClassList;


		var calStartTime = aData.calendarSettings.startTime;
		var calEndTime = aData.calendarSettings.endTime;
		var interval = aData.calendarSettings.interval;
		var startOffset = aData.calendarSettings.startOffset;

		var timeLabels = [];
		var dayLabels = [
			"<b>SUN</b>DAY",
			"<b>MON</b>DAY",
			"<b>TUE</b>SDAY",
			"<b>WED</b>NESDAY",
			"<b>THU</b>RSDAY",
			"<b>FRI</b>DAY",
			"<b>SAT</b>URDAY"
		];

		var minutesToStringFormat = function (aMin) {
			var pastNoon = aMin >= 12 * 60;
			var hour = Math.floor(aMin / 60) % 12 || 12;
			var min = aMin % 60;
			return hour + (pastNoon ? " PM" : " AM");
		};

		var themeToStyle = function (aTheme) {
			var styles = {}

			if (aTheme.backgroundColor)
				styles.backgroundColor = sprintf.s("background-color:%s;", aTheme.backgroundColor);
			if (aTheme.fontColor)
				styles.fontColor = sprintf.s("color:%s;", aTheme.fontColor);
			if (aTheme.borderColor)
				styles.fontColor = sprintf.s("border-color:%s;", aTheme.borderColor);

			return styles;
		};

		var calculateBracketPosition = function (aTime) {
			return (aTime - calStartTime + startOffset) / interval;
		};

		var classesByDays = [];

		// Retrives for each day, a list of classes that occur on that day
		userClassList.forEach(function (aSection) {
			aSection.classes.forEach(function (aClass) {
				aClass.indexedWeekdays.forEach(function (aIndex) {
					var classesByDay = classesByDays[aIndex] || [];

					classesByDay.push({
						"name": aSection.title,
						"subject": aSection.subject,
						"catalog": aSection.catalogNumber,
						"section": aSection.sectionNumber,
						"type": aSection.sectionType,
						"building": aClass.building,
						"room": aClass.room,
						"startTimeBracket": calculateBracketPosition(aClass.startTime),
						"endTimeBracket": calculateBracketPosition(aClass.endTime)
					});

					classesByDays[aIndex] = classesByDay;
				});
			});
		});

		for (var i = calStartTime + startOffset; i < calEndTime; i += interval)
			timeLabels.push(minutesToStringFormat(i));

		var dayData = dayLabels.map(function (aLabel, aIndex) {
			return {
				"label": aLabel,
				"entries": classesByDays[aIndex] || []
			};
		});

		// Landscape, hence reversed page sizes
		var pageSizeStyle = sprintf.s("width: %dmm;height: %dmm;", pageSize.height, pageSize.width);

		var renderParams = {
			"timeLabels": timeLabels,
			"dayData": dayData,
			"pageSizeStyle": pageSizeStyle,
			"dayStyles": themeToStyle(globalTheme.daysTheme),
			"timeStyles": themeToStyle(globalTheme.timeTheme),
			"tableStyles": themeToStyle(globalTheme.tableTheme)
		};

		console.log(JSON.stringify(renderParams, null, "  "));

		aRes.render("preview.ejs", renderParams);
	});
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
			"error": sprintf.s("Invalid term identifier: %s", aReq.params.term)
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

app.post("/api/print/:hash", function (aReq, aRes) {
	// TODO: Less hackery here too plz
	var hash = aReq.params.hash;

	mongoStore.storeUserSchedule(JSON.parse(aReq.body.data), undefined, function (aResult) {
		try {
			var previewUrl = sprintf.s("%s/preview/%s", getHostFromRequest(aReq), aResult.hash);
			console.log(previewUrl);
			printer.print(previewUrl).pipe(aRes);
		} catch (err) {
			console.log(err);
		}
	});
});

app.listen(port);

console.log("Starting server on port " +  port);

var getHostFromRequest = function(aReq) {
	return aReq.protocol + '://' + aReq.get('host');
}




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
			console.log(sprintf.s("Verifying data for term %d.", termId));
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
