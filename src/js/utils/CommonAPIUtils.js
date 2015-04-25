var request = require("superagent");

module.exports = {

	getCustomIDList: function(queryDate, onReceivingDataFn) {
		"use strict";

		var queryObject = {};

		if(queryDate) queryObject.date = queryDate;

		request.get("/api/v1/reports/customidlist")
						.query(queryObject)
						.end(function(err, res) {
							if(err) console.log("Error: " + err);
							return onReceivingDataFn(res.body);
		});
	}

};
