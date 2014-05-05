var sprintf = require("./lib/sprintf").s;
var sprintfv = require("./lib/sprintf").v;
var https = require("https");

var HOST = "api.uwaterloo.ca";
var API_KEY = "fa310af514876676292c421cf7673a49";
var TERM_LIST_API_URL = "/v2/terms/list";
var SUBJECT_LIST_API_URL = "/v2/codes/subjects";
var TERM_SUBJECT_API_URL = "/v2/terms/%d/%s/schedule";

var WEEKDAYS_REGEX = /^(m?)((?:t(?:(?!h)))?)(w?)((?:th)?)(f?)((?:s(?:(?!u)))?)((?:su)?)$/;
var WEEKDAYS_INDEX_LOOKUP = {
	"su": 0,
	"m" : 1,
	"t" : 2,
	"w" : 3,
	"th": 4,
	"f" : 5,
	"s" : 6
};

// Since Array.find isn't standardised yet...
Array.prototype.find = function (aIterator) {
	for (var i = 0; i < this.length; i++) {
		if (aIterator(this[i], i, this))
			return this[i];
	}
	return null;
};

/**
 * Parses time in the format hh:mm.
 */
var parseTimeToMinutes = function (aTimeStr) {
	if (!aTimeStr)
		return null;
	var split = aTimeStr.split(":");
	return parseInt(split[0]) * 60 + parseInt(split[1]);
}

/**
 * Process the returned data from the Waterloo API into something more digestable.
 */
var processSections = function (aSections) {
	return aSections.map(function (aSection) {
		// Split the section string into type and number
		var section = aSection.section.split(" ");

		// Build the related component array
		var relatedComponents = [];

		if (aSection.related_component_1 != null)
			relatedComponents.push(aSection.related_component_1);
		if (aSection.related_component_2 != null)
			relatedComponents.push(aSection.related_component_2);

		return {
			"associatedClass": aSection.associated_class,
			"campus": aSection.campus,
			"catalogNumber": aSection.catalog_number,
			"classes": processClasses(aSection.classes),
			"classNumber": aSection.class_number,
			"relatedComponents": relatedComponents,
			"sectionNumber": section[1] || "N/A",
			"sectionType": section[0] || "N/A",
			"subject": aSection.subject,
			"term": aSection.term,
			"title": aSection.title
		};
	});
};

var processClasses = function (aClasses) {
	return aClasses.map(function (aClass) {
		/*
		This will return a list of matched strings using regex in this format, assuming the
		following input string "TThF":

		[ "TThF", "", "T", "", "Th", "F" ]

		This array will need to be filtered, and converted into a list of day indices.
		 */
		var weekdays = aClass.date.weekdays;
		var indexedWeekdays = [];

		if (weekdays) {
			// Convert weekday letters to an array index, with Sunday being 0
			indexedWeekdays = weekdays.toLowerCase().match(WEEKDAYS_REGEX).slice(1)
				.filter(function (aDay) { return aDay || aDay.length; })
				.map(function (aDay) { return WEEKDAYS_INDEX_LOOKUP[aDay]; });
		}

		return {
			"indexedWeekdays": indexedWeekdays,
			"startTime": parseTimeToMinutes(aClass.date.start_time),
			"endTime": parseTimeToMinutes(aClass.date.end_time),
			"startDate": aClass.date.start_date,
			"endDate": aClass.date.end_date,
			"isTba": aClass.date.is_tba,
			"instructors": aClass.instructors,
			"building": aClass.location.building || "N/A",
			"room": aClass.location.room || "N/A"
		};
	});
};

var buildApiUrl = function (aUrl, aArgs) {
	var args = aArgs || [];
	var url = sprintfv(aUrl, args);
	return sprintf("%s.json?key=%s", url, API_KEY);
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

exports.currentTerms = function (aOnFinish) {
	// Fetch the 3 current terms.
	request(buildApiUrl(TERM_LIST_API_URL), function (aResult) {
		var result = resultValid(aResult);

		if (result) {
			var flattened = [];
			var keys = Object.keys(result.listings);

			for (var i = 0; i < keys.length; i++)
				flattened = flattened.concat(result.listings[keys[i]]);

			// Massage the retarded data format into something more usable.
			var retJson = {
				"currentTerm": flattened.find(function (aElem) {
					return aElem.id === result.current_term;
				}),
				"previousTerm": flattened.find(function (aElem) {
					return aElem.id === result.previous_term;
				}),
				"nextTerm": flattened.find(function (aElem) {
					return aElem.id === result.next_term;
				})
			};

			aOnFinish(retJson);
		}
	});
};

exports.currentTerm = function (aOnFinish) {
	// Fetch current term ID.
	request(buildApiUrl(TERM_LIST_API_URL), function (aResult) {
		var result = resultValid(aResult);

		if (result) {
			var currentTerm = result.current_term;
			console.log(sprintf("The current term code is %d.", currentTerm));

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
		console.log(sprintf(
			"Fetching %d subject courses for term %d.", classCountdown, aCurrentTerm));

		subjects.forEach(function (aElem) {
			var subject = aElem.subject;
			var url = buildApiUrl(
				TERM_SUBJECT_API_URL, [ aCurrentTerm, subject ]);

			request(url, function (aResult) {
				var result = resultValid(aResult);

				if (result) {
					classCountdown --;

					classList = classList.concat(processSections(result));

					if (!classCountdown && aOnFinish)
						aOnFinish(aCurrentTerm, classList, subjects);
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
			console.log(sprintf(
				"%d subjects were found for term %d.", result.length, aCurrentTerm));

			fetchClasses();
		}
	});
};