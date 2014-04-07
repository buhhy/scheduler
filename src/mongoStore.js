var sprintf = require("./lib/sprintf");
var mongo = require("mongodb");

var db = undefined;
var classData = undefined;

mongo.MongoClient.connect("mongodb://localhost:27017/pinecone", function (aError, aDb) {
	if (aError) {
		console.log(aError);
		return;
	}

	db = aDb;
	classData = db.collection("classData");
});

var storeClasses = function (aTerm, aClasses) {
	if (db) {
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
					if (aError)
						console.log(aError);
				});
				console.log(sprintf.s("Updated %s entries in database.", aClasses.length));
			} else {
				classData.insert(data, function (aError) {
					if (aError)
						console.log(aError);
				});
				console.log(sprintf.s("Inserted %s entries into database.", aClasses.length));
			}
		});
	}
};

var findClasses = function (aTerm, aCallback) {
	if (db) {
		classData.find({
			"term": aTerm
		}).toArray(function (aError, aItems) {
			if (aError) {
				console.log(aError);
				aCallback(null);
			} else {
				if (aItems.length) {
					console.log(
						sprintf.s(
							"Retrieved %s entries from database.", aItems[0].classes.length));
					aCallback(aItems[0].classes);
				} else {
					console.log(sprintf.s("No entries found for term %d.", aTerm));
					aCallback(null);
				}
			}
		});
	}
}

exports.storeClasses = storeClasses;

exports.findClasses = findClasses;