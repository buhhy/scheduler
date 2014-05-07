var sprintf = require("./lib/sprintf");
var lunr = require("./lib/lunr.min");

// Index by term.
var lunrIndexMap = {};
// Data hashmap for quick lookups.
var dataCache = {};

/**
 * Massage data into correct format: course [] -> section [] -> class
 * Groups a flattened list of sections by subject (CS) and catalog number (101), then by type (LEC).
 */
var groupClassList = function (aSections) {
	var searchResultMap = {};		// This is used for fast lookup of results.
	var searchResultList = [];		// This stores results in deterministic ordering.

	aSections.forEach(function (aSection) {
		var courseMap = searchResultMap[aSection.courseKey];
		if (courseMap == null) {
			courseMap = {};
			searchResultList.push({
				"courseName": aSection.courseKey,
				"subject": aSection.subject,
				"catalogNumber": aSection.catalogNumber,
				"title": aSection.title,
				"sections": courseMap
			});
		}

		var sectionList = courseMap[aSection.sectionType] || [];

		sectionList.push(aSection);
		courseMap[aSection.sectionType] = sectionList;
		searchResultMap[aSection.courseKey] = courseMap;
	});

	// Return the grouped sections sorted by subject first, then catalog number
	return searchResultList.sort(function (aGroup1, aGroup2) {
		var c1 = 0;
		if (aGroup1.subject > aGroup2.subject) c1 = 2;
		else if (aGroup1.subject < aGroup2.subject) c1 = -2;

		var c2 = 0;
		if (aGroup1.catalogNumber > aGroup2.catalogNumber) c2 = 1;
		else if (aGroup1.catalogNumber < aGroup2.catalogNumber) c2 = -1;

		return c1 + c2;
	});
};

exports.search = function (aTerm, aSearchStr, aCount) {
	console.log(sprintf.s("Searching with query '%s'.", aSearchStr));

	if (lunrIndexMap[aTerm] != null && dataCache[aTerm] != null) {
		var results = [];
		var cache = dataCache[aTerm];

		if (aSearchStr == null) {
			results = Object.keys(cache)
		} else {
			results = lunrIndexMap[aTerm].search(aSearchStr).map(function (aElem) {
				return aElem.ref;
			});
		}

		console.log(sprintf.s("Found %d entries match query '%s'.", results.length, aSearchStr));

		// Convert from the reference UID to actual class object.
		results = results.map(function (aElem) {
			return cache[aElem];
		});

		// Group all LEC, TUT, LAB, etc of a course together
		results = groupClassList(results);

		if (aCount != null)
			return results.slice(0, aCount);
		else
			return results;
	}

	return [];
};

exports.rebuildIndex = function (aTerm, aClasses) {
	newCache = {};

	newIndex = lunr(function () {
		this.field("subject", { "boost": 4 });
		this.field("catalogNumber", { "boost": 3 });
		this.field("title", { "boost": 1 });
		this.field("classNumber", { "boost": 6});
		this.ref("uid");
	});

	aClasses.forEach(function (aElem) {
		newIndex.add(aElem);
		newCache[aElem.uid] = aElem;
	});

	lunrIndexMap[aTerm] = newIndex;
	dataCache[aTerm] = newCache;

	console.log(sprintf.s("Indexed %d classes for term %d.", aClasses.length, aTerm));
}