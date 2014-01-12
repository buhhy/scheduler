var express = require("express");
var classData = require("./classData");
var app = express();

var port = 4888;

app.get("/api/class", function (req, res) {
	res.send("Hi there!");
});

app.listen(port);

console.log("Starting server on port " +  "4888");

classData.reloadClassData(function (aData) {
	console.log("Fetched " + aData.length + " entries.");
});