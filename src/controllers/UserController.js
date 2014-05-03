var MongoStore = require("../MongoStore");
var RouteUtils = require("../utils/RouteUtils");

exports.insertUserSchedule = function (aReq, aRes) {
	MongoStore.upsertUserSchedule(aReq.body, RouteUtils.sendMongoResult(aRes));
};

exports.updateUserSchedule = function (aReq, aRes) {
	var schedule = aReq.body;
	schedule.hash = aReq.params.hash;
	MongoStore.upsertUserSchedule(schedule, RouteUtils.sendMongoResult(aRes));
};

exports.getUserSchedule = function (aReq, aRes) {
	MongoStore.findUserSchedule(aReq.params.hash, RouteUtils.sendMongoResult(aRes));
};