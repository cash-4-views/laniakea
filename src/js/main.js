var React = require("react");
var superagent = require("superagent");
var ReportData = require("./components/ReportData");

request
	.get("/api/v1/reports/{2015_01}")
	.end(function(err, res) {
		"use strict";
		if (err) console.log("AJAX error: " + err);
		console.log(res.body);
	});


React.render(
	<ReportData />, document.getElementById("content")
	);
