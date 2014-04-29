var sprintf = require("./lib/sprintf");
var mongo = require("mongodb");

var HASH_CHARACTERS = charRange('a', 'z').concat(charRange('A', 'Z')).concat(charRange('0', '9'));

var db = undefined;

var classData = undefined;
var userSchedule = undefined;
var autoincrement = undefined;

var scheduleIdKey = "scheduleId";

mongo.MongoClient.connect("mongodb://localhost:27017/pinecone", function (aError, aDb) {
	if (aError) {
		console.log(aError);
		return;
	}

	db = aDb;
	classData = db.collection("classData");
	userSchedule = db.collection("userSchedule");
	autoincrement = db.collection("autoincrement");

	createAutoincrementId(scheduleIdKey);
});

function getNextId(aName, aCallback) {
	autoincrement.findAndModify(
		{ "_id": aName },
		[["_id", 1]],
		{"$inc": { "counter": 1 } },
		{ "new": true },
		function (aError, aResult) {
			if (aError) {
				console.log(aError);
				aCallback(null, aError);
			} else {
				aCallback(aResult.counter);
			}
		}
	);
};

function createAutoincrementId(aName) {
	autoincrement.findOne({
		"_id": aName
	}, function (aError, aItem) {
		if (aError) {
			console.log(aError);
		} else {
			if (!aItem) {
				console.log(sprintf.s("Created autoincrement column for `%s`.", aName));
				autoincrement.insert({
					"_id": aName,
					"counter": 0
				}, function (aError) {
					if (aError) console.log(aError);
				});
			} else {
				console.log(sprintf.s("Autoincrement column `%s` already exists.", aName));
			}
		}
	});
}

function hashId(aId) {
	var counter = Math.floor(aId);
	var hash = "";

	while (counter != 0) {
		var rem = counter % HASH_CHARACTERS.length;
		counter = Math.floor(counter / HASH_CHARACTERS.length);
		hash += HASH_CHARACTERS[rem];
	}

	return hash;
};

function charRange(aStart, aStop) {
	var result = [];
	for (var idx = aStart.charCodeAt(0),end = aStop.charCodeAt(0); idx <= end; ++idx)
		result.push(String.fromCharCode(idx));

	return result;
};

var storeClasses = function (aTerm, aClasses) {
	findClasses(aTerm, function (existingSet) {
		var data = {
			"term": aTerm,
			"classes": aClasses
		};

		// If existing, simply replace data.
		if (existingSet) {
			classData.update({
				"_id": existingSet._id
			}, data, function (aError) {
				if (aError) console.log(aError);
			});
			console.log(sprintf.s("Updated %s entries in database.", aClasses.length));
		} else {
			classData.insert(data, function (aError) {
				if (aError) console.log(aError);
			});
			console.log(sprintf.s("Inserted %s entries into database.", aClasses.length));
		}
	});
};

var findClasses = function (aTerm, aCallback) {
	classData.find({
		"term": aTerm
	}).toArray(function (aError, aItems) {
		if (aError) {
			console.log(aError);
			aCallback(null, aError);
		} else {
			if (aItems.length) {
				console.log(
					sprintf.s(
						"Retrieved %s entries from database.", aItems[0].classes.length));
				aCallback(aItems[0].classes);
			} else {
				var error = sprintf.s("No entries found for term `%d`.", aTerm);
				console.log(error);
				aCallback(null, error);
			}
		}
	});
};

var findUserSchedule = function (aHash, aCallback) {
	userSchedule.findOne({
		"hash": aHash
	}, function (aError, aItem) {
		if (aError) {
			console.log(aError);
			aCallback(null, aError);
		} else {
			if (aItem) {
				console.log(
					sprintf.s(
						"Found a schedule with hash `%s` from database.", aItem.hash));
				aCallback(aItem);
			} else {
				var error = sprintf.s("No schedules found with hash `%s`.", aHash);
				console.log(error);
				aCallback(null, error);
			}
		}
	});
};

var insertUserSchedule = function (aSchedule, aCallback) {
	getNextId(scheduleIdKey, function (aNewId, aError) {
		if (aError) {
			console.log(aError);
			aCallback(aError);
		} else {
			aSchedule._id = aNewId;
			aSchedule.hash = hashId(aSchedule._id);
			userSchedule.insert(aSchedule, function (aError, aResult) {
				if (aError) {
					console.log(aError);
					aCallback(null, aError);
				} else if (aCallback) {
					aCallback(aResult[0]);
				}
			});
			console.log(
				sprintf.s("Inserted new schedule with ID `%d` and hash `%s` into database.",
					aSchedule._id, aSchedule.hash));
		}
	});
};

var updateUserSchedule = function (aSchedule, aCallback) {
	if (aSchedule._id === undefined || aSchedule._id === null) {
		console.log("Cannot update schedule with non-existent ID.");
	} else {
		aSchedule.hash = hashId(aSchedule._id);
		userSchedule.update({
			"_id": aId
		}, aSchedule, function (aError) {
			if (aError) {
				console.log(aError);
				aCallback(null, aError);
			} else if (aCallback) {
				aCallback(aSchedule);
			}
		});
		console.log(sprintf.s("Updated schedule with ID `%d` in database.", aSchedule._id));
	}
};

var upsertUserSchedule = function (aSchedule, aCallback) {
	if (!aSchedule.hash) {
		// insert new schedule
		insertUserSchedule(aSchedule, aCallback);
	} else {
		findUserSchedule(aSchedule.hash, function (aItem) {
			if (!aItem) {
				// schedule with hash not found
				insertUserSchedule(aSchedule, aCallback);
			} else {
				// update existing schedule
				updateUserSchedule(aSchedule, aCallback);
			}
		});
	}
}

exports.storeClasses = storeClasses;

exports.upsertUserSchedule = upsertUserSchedule;

exports.findClasses = findClasses;

exports.findUserSchedule = findUserSchedule;