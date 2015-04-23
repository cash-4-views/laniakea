var request = require("superagent");

module.exports = {

	getReportList: function(onReceivingDataFn) {
		"use strict";

		request.get("/api/v1/reports")
						.end(function(err, res){
							if(err) console.log("Error:" + err);
							return onReceivingDataFn(res.body);
						});
	},

	selectReportFromList: function(queryDate, onReceivingDataFn) {
		"use strict";

		request.get("/api/v1/reports/customidList")
						.query({date: queryDate})
						.end(function(err, res) {
							if(err) console.log("Error: " + err);
							return onReceivingDataFn(res.body);
		});
	},

	downloadReportForID: function(YYYY_MM, customid) {
		"use strict";

		// Why is this not downloading? Response comes correctly but doesn't download
		request.get("/api/v1/reports/" + YYYY_MM)
						.query({customid: customid, csv: true})
						.end();
	},

	approveReportForID: function(YYYY_MM, customid, onSuccess) {
		"use strict";

		request.put("/api/v1/approvedlist/" + customid)
						.send({YYYY_MM: YYYY_MM})
						.end(function(err, res) {
							if(err) console.log("Error: " + err);
							else return onSuccess(res.text);
						});
	},

	getReportRows: function(YYYY_MM, queryObject, getTheRest, onReceivingDataFn) {
		"use strict";

		if(getTheRest) queryObject.getAll = true;
		console.log(queryObject);
		request.get("/api/v1/reports/" + YYYY_MM)
						.query(queryObject)
						.end(function(err, res) {
							if(err) console.log("Error: " + err);
							onReceivingDataFn(res.body.results, res.body.token, queryObject);
						});
	},

	submitCustomID: function(YYYY_MM, customid, rowkey) {
		"use strict";

		console.log(YYYY_MM, customid, rowkey);

		request.put("/api/v1/reports/" + YYYY_MM + "/" + rowkey)
						.send({Custom_ID: customid})
						.end(function(err, res) {
							if(err) console.log("Error: " + err);
							console.log(res.body);
						});
	}

};

