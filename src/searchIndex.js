var sprintf = require("./lib/sprintf");
var lunr = require("./lib/lunr.min");

// Index by term.
var lunrIndexMap = {};
// Data hashmap for quick lookups.
var dataCache = {};

exports.search = function (aTerm, aSearchStr) {
	console.log(sprintf.s("Searching with query '%s'.", aSearchStr));

	if (lunrIndexMap[aTerm] && aSearchStr && aSearchStr.length) {
		var ret = lunrIndexMap[aTerm].search(aSearchStr);
		var cache = dataCache[aTerm];

		console.log(sprintf.s("Found %d entries match query '%s'.", ret.length, aSearchStr));

		// Convert from the reference UID to actual class object.
		return ret.map(function (aElem) {
			return cache[aElem.ref];
		});
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