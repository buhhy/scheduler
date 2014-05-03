var path = require('path');

var sprintf = require("../lib/sprintf").s;

exports.getRootUrlFromRequest = function (aReq) {
	console.log(aReq.host);
	console.log(aReq.url);
	return sprintf("%s://%s", aReq.protocol, aReq.get('host'));
};

exports.getFullUrlFromRequest = function (aReq) {
	return sprintf("%s://%s/%s", aReq.protocol, aReq.host, aReq.url);
};


exports.sendMongoResult = function (aRes, aCallback) {
	var callback = aCallback || function (aResult) { aRes.json(aResult); };

	return function (aResult, aError) {
		if (aError)
			aRes.send(400, aError);
		else
			callback(aResult);
	};
}

exports.port = process.env.PORT || 4888;
exports.localUrl = sprintf("http://%s:%d", "localhost", exports.port);
exports.rootDir = path.dirname(require.main.filename);