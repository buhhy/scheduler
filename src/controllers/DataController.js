var sprintf = require("../lib/sprintf").s;

var ClassData = require("../ClassData");
var RouteUtils = require("../utils/RouteUtils");
var SearchIndex = require("../SearchIndex");

exports.DEFAULT_SEARCH_COUNT = 15;

var classQueryResponse = function (aResponse, aTerm, aQuery) {
	aResponse.json(SearchIndex.search(aTerm, aQuery, exports.DEFAULT_SEARCH_COUNT));
}

exports.getTerms = function (aReq, aRes) {
	ClassData.currentTerms(RouteUtils.sendMongoResult(aRes));
};

exports.getClasses = function (aReq, aRes) {
	var query = aReq.param("search");

	ClassData.currentTerm(function (aCurrentTerm) {
		classQueryResponse(aRes, aCurrentTerm, query);
	});
};

exports.getClassesByTerm = function (aReq, aRes) {
	var term = parseInt(aReq.params.term);
	var query = aReq.param("search");

	if (isNaN(term) || term === null || term === undefined) {
		aRes.send(404, sprintf("Invalid term identifier: %s", aReq.params.term));
	} else {
		classQueryResponse(aRes, term, query);
	}
};