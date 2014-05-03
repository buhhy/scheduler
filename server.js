var express = require("express");
var cors = require("cors");
var lessMiddleware = require("less-middleware");
var path = require("path");
var ejs = require('ejs');
var fs = require('fs');

var sprintf = require("./src/lib/sprintf");

var pathify = function (aDir) { return path.join(__dirname, aDir); };

// Directory names
var srcDir = "src";
var assetDir = "public";
var viewDir = "views";

// Absolute file system paths
var assetPath = pathify(assetDir);
var viewPath = pathify(viewDir);

var encoding = "UTF-8";

var ClassData = require("./src/ClassData");
var MongoStore = require("./src/MongoStore");
var Printer = require("./src/Printer");
var SearchIndex = require("./src/SearchIndex");

var RouteUtils = require("./src/utils/RouteUtils");

var DataController = require("./src/controllers/DataController");
var GenerationController = require("./src/controllers/GenerationController");
var UserController = require("./src/controllers/UserController");


var app = express();

var fbAppId = "1390085397942073";

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


app.get("/", function (aReq, aRes) {
	aRes.render("index.ejs", { "hash": undefined, "appId": fbAppId });
});

app.get("/:hash", function (aReq, aRes) {
	aRes.render("index.ejs", { "hash": aReq.params.hash, "appId": fbAppId });
});

app.get("/loading/img", function (aReq, aRes) {
	aRes.render("loading.ejs", { "msg": "Generating schedule preview..." });
});

app.get("/loading/pdf", function (aReq, aRes) {
	aRes.render("loading.ejs", { "msg": "Generating schedule PDF..." });
});

app.get("/preview/:hash", function (aReq, aRes) {
	var hash = aReq.params.hash;
	var width = aReq.query.width || Printer.PAPER_SIZES.A4.width;
	var height = aReq.query.height || Printer.PAPER_SIZES.A4.height;

	MongoStore.findUserSchedule(hash, function (aData) {
		if (!aData) {
			aRes.send(404, sprintf.s("Could not find schedule with url hash `%s`.", hash));
		} else {
			// TODO: Less hackery here plz
			var pageSize = Printer.PAPER_SIZES.A4;
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

app.get("/preview/:hash/img", function (aReq, aRes) {
	var hash = aReq.params.hash;
	MongoStore.findUserSchedule(hash, function (aSchedule, aError) {
		if (aError) {
			aRes.send(404, aError);
		} else {
			// TODO: store the url
			aRes.render("image-preview.ejs", {
				"appId": fbAppId,
				"siteName": "Pinecone - UW schedule customizer",
				"title": "My schedule", // TODO: more term specific info here
				"url": RouteUtils.getFullUrlFromRequest(aReq),
				"desc": "Create and customize your University of Waterloo class schedules!",
				"type": "object",
				"imgSrc": sprintf.s("%s/gen/img/%s.png", RouteUtils.getRootUrlFromRequest(aReq), hash)
			});
		}
	});
});


app.get("/api/class", DataController.getClasses);
app.get("/api/:term/class", DataController.getClassesByTerm);
app.get("/api/term", DataController.getTerms);

app.post("/api/user/schedule", UserController.insertUserSchedule);
app.put("/api/user/schedule/:hash", UserController.updateUserSchedule);
app.get("/api/user/schedule/:hash", UserController.getUserSchedule);

app.post("/api/pdfify/:hash", GenerationController.genPdf);
app.post("/api/imgify/:hash", GenerationController.genImg);

app.listen(RouteUtils.port);


console.log("Starting server on port " +  RouteUtils.port);


var refreshMongoCache = function (aTerm) {
	ClassData.reloadClassData(aTerm, function (aTerm, aData) {
		console.log("Fetched " + aData.length + " entries.");
		MongoStore.storeClasses(aTerm, aData);
		SearchIndex.rebuildIndex(aTerm, aData);
	});
}

var refreshDataCaches = function () {
	ClassData.currentTerms(function (aTerms) {
		Object.keys(aTerms).forEach(function (aKey) {
			var termId = aTerms[aKey].id;
			console.log(sprintf.s("Verifying data for term %d.", termId));
			MongoStore.findClasses(termId, function (aClasses) {
				if (!aClasses || !aClasses.length) {
					refreshMongoCache(termId);
				} else {
					SearchIndex.rebuildIndex(termId, aClasses);
				}
			});
		});
	});
}

// TODO: In the future, we probably want to refresh the class list once every few days.
refreshDataCaches();
