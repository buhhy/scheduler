var sprintf = require("./lib/sprintf.min");
var https = require("https");

var HOST = "api.uwaterloo.ca";
var API_KEY = "fa310af514876676292c421cf7673a49";
var TERM_LIST_API_URL = "/v2/terms/list";
var SUBJECT_LIST_API_URL = "/v2/codes/subjects";
var TERM_SUBJECT_API_URL = "/v2/terms/%d/%s/schedule";

var buildApiUrl = function (aUrl, aArgs) {
	var args = aArgs || [];
	var url = sprintf.vsprintf(aUrl, args);
	return sprintf.sprintf("%s.json?key=%s", url, API_KEY);
};

var request = function (aUrl, aCallback) {
	var req = https.get({
		"host": HOST,
		"port": 443,
		"path": aUrl,
		"header": {
			"Content-Type": "application/json"
		}
	}, function (res) {
		// Apparently, the data callback is called before the entire request is finished, which
		// leads to incomplete data, need to wait until end event to actually process data.
		var data = "";
		res.on("data", function (aChunk) {
			data += aChunk;
		});
		res.on("end", function () {
			aCallback(data);
		});
	}).on("error", function (e) {
		console.log("Request error: " + e.message);
	});
};

var resultValid = function (aResult) {
	var result = JSON.parse(aResult);
	if (result && result.data)
		return result.data;
	return null;
};

exports.currentTerm = function (aOnFinish) {
	// Fetch current term.
	request(buildApiUrl(TERM_LIST_API_URL), function (aResult) {
		var result = resultValid(aResult);

		if (result) {
			var currentTerm = result.current_term;
			console.log(sprintf.sprintf("The current term code is %d.", currentTerm));

			aOnFinish(currentTerm);
		}
	});
};

exports.reloadClassData = function (aCurrentTerm, aOnFinish) {
	var subjects = undefined;
	var classList = [];

	var fetchClasses = function () {
		// Fetch all classes.
		// subjects.splice(3, subjects.length - 3);
		var classCountdown = subjects.length;
		console.log(sprintf.sprintf("Fetching %d subject courses.", classCountdown));

		subjects.forEach(function (aElem) {
			var subject = aElem.subject;
			var url = buildApiUrl(
				TERM_SUBJECT_API_URL, [ aCurrentTerm, subject ]);

			request(url, function (aResult) {
				var result = resultValid(aResult);

				if (result) {
					classCountdown --;

					classList = classList.concat(result);

					if (!classCountdown && aOnFinish)
						aOnFinish(classList, aCurrentTerm, subjects);
				}
			});
		});
	}

	console.log("Starting to fetch data from UWaterloo public API...");

	// Fetch list of all subjects.
	request(buildApiUrl(SUBJECT_LIST_API_URL, [ aCurrentTerm ]), function (aResult) {
		var result = resultValid(aResult);

		if (result) {
			subjects = result;
			console.log(sprintf.sprintf("%d subjects were found.", result.length));

			fetchClasses();
		}
	});
};