var express = require("express");
var cors = require("cors");
var lessMiddleware = require("less-middleware");
var path = require("path");
var ejs = require("ejs");
var fs = require("fs");
var http = require("http");
var sprintf = require("./src/lib/sprintf").s;

var ClassData = require("./src/ClassData");
var MongoStore = require("./src/MongoStore");
var SearchIndex = require("./src/SearchIndex");

var RouteUtils = require("./src/utils/RouteUtils");
var JavascriptUtils = require("./src/utils/JavascriptUtils");

var DataController = require("./src/controllers/DataController");
var GenerationController = require("./src/controllers/GenerationController");
var UserController = require("./src/controllers/UserController");
var PreviewController = require("./src/controllers/PreviewController");




var pathify = function (aDir) { return path.join(__dirname, aDir); };

// Absolute file system paths
var assetPath = pathify("public");
var viewPath = pathify("views");

var app = express();
var server = http.createServer(app);
var fbAppId = "1390085397942073";

var clientJs = JavascriptUtils.createJsManager(assetPath);


// Javascript includes for each page
var jsIncludeList = {
	"index": [
		"lib/jquery-2.1.0.min.js",
		"lib/underscore.min.js",
		"lib/backbone.min.js",
		"lib/sprintf.min.js",
		"lib/jquery.throttle-debounce.min.js",
		"lib/jquery.print-preview.js",
		"js/common/Dropdown.js",
		"js/common/TimeUtils.js",
		"js/scheduler.js",
		"js/models/RestModels.js",
		"js/models/ThemeModels.js",
		"js/models/ClassData.js",
		"js/models/UserData.js",
		"js/models/ThemeData.js",
		"js/models/CalendarSettings.js",
		"js/views/Sidebar.js",
		"js/views/SidebarGroup.js",
		"js/views/AddSectionSidebar.js",
		"js/views/CustomizeSidebar.js",
		"js/views/PrintSidebar.js",
		"js/views/SearchResultEntry.js",
		"js/views/SearchResultList.js",
		"js/views/GroupedSectionDropdownEntry.js",
		"js/views/GroupedSectionDropdownList.js",
		"js/views/CalendarEntry.js",
		"js/views/CalendarEntryGroup.js",
		"js/views/Calendar.js",
		"js/views/Palette.js",
		"js/entrypoint.js"
	]
};



// Prevents conflicts with underscore.js templates since both use <% ... %>
ejs.open = "{{";
ejs.close = "}}";

app.engine(".html", ejs.__express);
app.set("view engine", "ejs");
app.set("views", viewPath);

// Put other global configurations here:

// Add the Javascript includes for each page, server will minify and concat for release
for (var key in jsIncludeList) {
	jsIncludeList[key].forEach(function (aScript) {
		clientJs.addFile(key, aScript);
	});
}

app.use(express.bodyParser());
app.use(express.static(assetPath));
app.use(cors());

app.configure("development", function () {
	console.log("Server starting in development mode...");
	app.use(lessMiddleware("../less", {
		"dest": "css",
		"pathRoot": assetPath,
		"force": true,
		"compress": false,
		"debug": true
	}));
});

app.configure("production", function () {
	console.log("Server starting in production mode...");
	clientJs.concatJs();
	app.use(lessMiddleware("../less", {
		"dest": "css",
		"pathRoot": assetPath,
		"once": true,
		"compress": true
	}));


	Log errors on exceptions and exit
	process.on("uncaughtException", function (err) {
		console.error("UncaughtException: ", err.message);
		console.error(err.stack);
		process.exit(1);
	});
});


/**
 * HTML routes
 */

app.get("/", function (aReq, aRes) {
	aRes.render("index.ejs", {
		"hash": undefined,
		"appId": fbAppId,
		"js": clientJs.getJsPaths("index")
	});
});

app.get("/:hash", function (aReq, aRes) {
	aRes.render("index.ejs", {
		"hash": aReq.params.hash,
		"appId": fbAppId,
		"js": clientJs.getJsPaths("index")
	});
});

app.get("/loading/img", function (aReq, aRes) {
	aRes.render("loading.ejs", { "msg": "Generating schedule preview..." });
});

app.get("/loading/pdf", function (aReq, aRes) {
	aRes.render("loading.ejs", { "msg": "Generating schedule PDF..." });
});

app.get("/preview/:hash", PreviewController.htmlPreview);
app.get("/preview/:hash/img", PreviewController.imagePreview);

/**
 * Rest API routes
 */

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
			console.log(sprintf("Verifying data for term %d.", termId));
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
