var express = require("express");
var cors = require("cors");
var lessMiddleware = require("less-middleware");
var path = require("path");
var ejs = require('ejs');
var fs = require('fs');

var pathify = function (aDir) { return path.join(__dirname, aDir); };

// Directory names
var srcDir = "src";
var assetDir = "public";
var viewDir = "views";

// Absolute file system paths
var srcPath = pathify(srcDir);
var assetPath = pathify(assetDir);
var viewPath = pathify(viewDir);
var genPath = path.join(assetPath, "gen");

var encoding = "UTF-8";

var sprintf = require(path.join(srcPath, "lib", "sprintf"));
var classData = require(path.join(srcPath, "classData"));
var mongoStore = require(path.join(srcPath, "mongoStore"));
var printer = require(path.join(srcPath, "printer"));
var searchIndex = require(path.join(srcPath, "searchIndex"));

var app = express();
var port = process.env.PORT || 4888;
var localUrl = sprintf.s("http://%s:%d", "localhost", port);

// Prevents conflicts with underscore.js templates since both use <% ... %>
ejs.open = "{{";
ejs.close = "}}";

app.engine('.html', require('ejs').__express);
app.set("view engine", "ejs");
app.set("views", viewPath);

app.configure(function () {
	// Put other configurations here:

	// TODO: Remove force: true, add once: true, change compress: true
	app.use(lessMiddleware("../less", {
		"dest": "css",
		"pathRoot": assetPath,
		"force": true,
		"compress": false,
		"debug": true
	}));

	app.use(express.bodyParser());
	app.use(express.static(assetPath));
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
	aRes.render("index.ejs", { "hash": undefined });
});

app.get("/:hash", function (aReq, aRes) {
	aRes.render("index.ejs", { "hash": aReq.params.hash });
});

app.get("/preview/:hash", function (aReq, aRes) {
	var hash = aReq.params.hash;
	var width = aReq.query.width || printer.PAPER_SIZES.A4.width;
	var height = aReq.query.height || printer.PAPER_SIZES.A4.height;

	mongoStore.findUserSchedule(hash, function (aData) {
		if (!aData) {
			aRes.send(404, sprintf.s("Could not find schedule with url hash `%s`.", hash));
		} else {
			// TODO: Less hackery here plz, retrieve page size from request
			var pageSize = printer.PAPER_SIZES.A4;
			var globalTheme = aData.globalTheme;
			var userClassList = aData.userClassList;


			var calStartTime = aData.calendarSettings.startTime;
			var calEndTime = aData.calendarSettings.endTime;
			var interval = aData.calendarSettings.interval;
			var startOffset = aData.calendarSettings.startOffset;
			var thresholds = aData.calendarSettings.thresholds;

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
					styles.borderColor = sprintf.s("border-color:%s;", aTheme.borderColor);

				return styles;
			};

			/**
			 * Determines which calendar bracket the given time belongs to. For example, for a
			 * calendar starting at 8:00AM and a bracket size of 60 minutes, 8:30AM would be bracket
			 * 0.5, 9:00AM would be bracket 1, and 11:30AM would be bracket 3.5.
			 * @param  {[number]} aTime [Time in minutes]
			 * @return {[number]}
			 */
			var calculateBracketPosition = function (aTime) {
				return (aTime - calStartTime + startOffset) / interval;
			};

			var classesByDays = [];

			// Retrives for each day, a list of classes that occur on that day
			userClassList.forEach(function (aSection) {
				aSection.classList.forEach(function (aClass) {
					aClass.indexedWeekdays.forEach(function (aIndex) {
						var classesByDay = classesByDays[aIndex] || [];

						// Determines what CSS class to apply to the class element, `short`,
						// `regular`, `long`, etc
						var classDurationClass = "";
						var classDuration = aClass.endTime - aClass.startTime;
						for (var i = 0; i < thresholds.length; i++) {
							if (classDuration <= thresholds[i].threshold) {
								classDurationClass = thresholds[i].name;
								break;
							}
						}

						classesByDay.push({
							"name": aSection.title,
							"subject": aSection.subject,
							"catalog": aSection.catalogNumber,
							"section": aSection.sectionNumber,
							"type": aSection.sectionType,
							"building": aClass.building,
							"room": aClass.room,
							"classDuration": classDurationClass,
							"styles": themeToStyle(aSection.theme),
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
			var pageSizeStyle = sprintf.s("width: %s; height: %s;", width, height);

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
		}
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
		aRes.send(404, sprintf.s("Invalid term identifier: %s", aReq.params.term));
	} else {
		classQueryResponse(aRes, term, query);
	}
});

var sendMongoResult = function (aRes) {
	return function (aResult, aError) {
		if (aError)
			aRes.send(400, aError);
		else
			aRes.json(aResult);
	};
}

app.get("/api/term", function (aReq, aRes) {
	classData.currentTerms(sendMongoResult(aRes));
});

app.post("/api/user/schedule", function (aReq, aRes) {
	mongoStore.upsertUserSchedule(aReq.body, sendMongoResult(aRes));
});

app.put("/api/user/schedule/:hash", function (aReq, aRes) {
	var schedule = aReq.body;
	schedule.hash = aReq.params.hash;
	mongoStore.upsertUserSchedule(schedule, sendMongoResult(aRes));
});

app.get("/api/user/schedule/:hash", function (aReq, aRes) {
	mongoStore.findUserSchedule(aReq.params.hash, sendMongoResult(aRes));
});

app.post("/api/pdfify/:hash", function (aReq, aRes) {
	// TODO: Less hackery here too plz
	var hash = aReq.params.hash;

	mongoStore.findUserSchedule(hash, function (aSchedule, aError) {
		if (aError) {
			aRes.send(400, aError);
		} else {
			var size = printer.PAPER_SIZES.A4.flip();
			var previewUrl = sprintf.s("%s/preview/%s?%s", localUrl, hash, size.toQuery());
			var pdfName = sprintf.s("%s.pdf", hash);
			var pdfUrl = sprintf.s("%s/gen/pdf/%s", localUrl, pdfName);
			var pdfPath = path.join(assetDir, "gen", "pdf", pdfName);

			console.log(sprintf.s("Generating PDF from `%s` to `%s` with URL `%s`.",
				previewUrl, pdfPath, pdfUrl));

			printer.toPdf(previewUrl, pdfPath, size, function () {
				aRes.json({ "path": pdfUrl });
			});
		}
	});
});

app.post("/api/imgify/:hash", function (aReq, aRes) {
	// TODO: Less hackery here too plz
	var hash = aReq.params.hash;

	mongoStore.findUserSchedule(hash, function (aSchedule, aError) {
		if (aError) {
			aRes.send(400, aError);
		} else {
			var size = printer.IMAGE_SIZES.medium;
			var previewUrl = sprintf.s("%s/preview/%s?%s", localUrl, hash, size.toQuery());
			var imageName = sprintf.s("%s.png", hash);
			var imageUrl = sprintf.s("%s/gen/img/%s", localUrl, imageName);
			var imagePath = path.join(assetDir, "gen", "img", imageName);

			console.log(sprintf.s("Generating PNG from `%s` to `%s` with URL `%s`.",
				previewUrl, imagePath, imageUrl));

			printer.toImage(previewUrl, imagePath, size, function () {
				aRes.json({ "path": imageUrl });
			});
		}
	});
});

app.listen(port);

console.log("Starting server on port " +  port);




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
