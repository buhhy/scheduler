var moment = require("moment");
var sprintf = require("./lib/sprintf").s;

var ClassData = require("./ClassData");
var MongoStore = require("./MongoStore");
var SearchIndex = require("./SearchIndex");

var dataSyncTimeout = undefined;

var getNextSyncTime = function (aHourSpacing) {
	var hourSpacing = aHourSpacing || 2;
	var roundedTime = moment().add("minutes", 59);
	var roundedHour = roundedTime.hour();

	roundedTime.startOf("hour");
	roundedTime.minutes(5);
	roundedTime.add("hour", hourSpacing - (roundedHour % hourSpacing));

	return roundedTime;
};

var refreshDataCaches = function (aCallback) {
	ClassData.currentTerms(function (aTerms) {
		var keys = Object.keys(aTerms);
		var counter = keys.length;

		keys.forEach(function (aKey) {
			var termId = aTerms[aKey].id;
			console.log(sprintf("Verifying data for term %d.", termId));
			ClassData.reloadClassData(termId, function (aTermId, aData) {
				console.log("Fetched " + aData.length + " entries.");
				MongoStore.storeClasses(aTermId, aData, function (aInserted, aError) {
					counter --;
					if (counter === 0)
						aCallback();
				});
				SearchIndex.rebuildIndex(aTermId, aData);
			});
		});
	});
};

var dataSync = function () {
	var prevMoment = moment();
	console.log(sprintf("--- Starting data sync at %s ---", prevMoment.format()));
	refreshDataCaches(function () {
		var curMoment = moment();
		var nextSyncTime = getNextSyncTime(12);
		var waitMillis = nextSyncTime.diff(curMoment, "millisecond");
		console.log(sprintf(
			"--- Data sync complete at %s, took %s seconds ---",
			curMoment.format(),
			curMoment.diff(prevMoment, "seconds")));
		dataSyncTimeout = setTimeout(dataSync, waitMillis);
		console.log(sprintf(
			"Next data sync in %d minutes",
			nextSyncTime.diff(curMoment, "minute")));
	});
};

exports.startPeriodicDataSync = function () {
	dataSync();
};

exports.rebuildSearchIndex = function () {
	ClassData.currentTerms(function (aTerms) {
		var keys = Object.keys(aTerms);
		var counter = keys.length;

		keys.forEach(function (aKey) {
			var termId = aTerms[aKey].id;
			MongoStore.findClasses(termId, function (aClasses) {
				SearchIndex.rebuildIndex(termId, aClasses);
			});
		});
	});
};
