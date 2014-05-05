var sprintf = require("./lib/sprintf");
var lunr = require("./lib/lunr.min");

// Index by term.
var lunrIndexMap = {};
// Data hashmap for quick lookups.
var dataCache = {};

/**
 * Groups a flattened list of classes by subject and then catalog number.
 */
// var groupClassList = function (aClasses) {
// 	var searchResultMap = {};		// This is used for fast lookup of results.
// 	var searchResultList = [];		// This stores results in deterministic ordering.

// 	aData.forEach(function (aElem) {
// 		var courseKey =
// 			sprintf("%s %s", aElem.get("subject"), aElem.get("catalog_number"));
// 		var sectionKey = aElem.get("sectionType");

// 		var courseMap = searchResultMap[courseKey];
// 		if (!courseMap) {
// 			courseMap = {};
// 			searchResultList.push({
// 				"courseName": courseKey,
// 				"sections": courseMap
// 			});
// 		}

// 		var sectionList = courseMap[sectionKey];
// 		if (!sectionList)
// 			sectionList = [];

// 		sectionList.push(aElem);
// 		courseMap[sectionKey] = sectionList;
// 		searchResultMap[courseKey] = courseMap;
// 	});

// 	console.log(searchResultList);
// 	self.buildSearchResultList(searchResultList);
// }

exports.search = function (aTerm, aSearchStr, aCount) {
	console.log(sprintf.s("Searching with query '%s'.", aSearchStr));

	if (lunrIndexMap[aTerm] && aSearchStr && aSearchStr.length) {
		var ret = lunrIndexMap[aTerm].search(aSearchStr);
		var cache = dataCache[aTerm];

		console.log(sprintf.s("Found %d entries match query '%s'.", ret.length, aSearchStr));

		// Convert from the reference UID to actual class object.
		var results = ret.map(function (aElem) {
			return cache[aElem.ref];
		});

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
		this.field("catalog_number", { "boost": 3 });
		this.field("title", { "boost": 1 });
		this.field("class_number", { "boost": 6});
		this.ref("uid");
	});

	aClasses.forEach(function (aElem) {
		aElem.uid = sprintf.s("%d+%s", aElem.term, aElem.class_number);

		newIndex.add(aElem);
		newCache[aElem.uid] = aElem;
	});

	lunrIndexMap[aTerm] = newIndex;
	dataCache[aTerm] = newCache;

	console.log(sprintf.s("Indexed %d classes for term %d.", aClasses.length, aTerm));
}