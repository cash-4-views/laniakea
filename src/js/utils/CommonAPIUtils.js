var request = require("superagent");

module.exports = {

	getCustomIDList: function(queryDate, onReceivingDataFn) {
		"use strict";

		var queryObject = {};

		if(queryDate) queryObject.date = queryDate;

		request.get("/api/v1/reports/customidlist")
						.query(queryObject)
						.end(function(err, res) {
							if(err) return onReceivingDataFn({type: "Error!", content: "There was an error getting the list custom ids"});
							return onReceivingDataFn(res.body);
		});
	}

};
