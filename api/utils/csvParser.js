function csvParser(YYYY_MM, trimmedCSV, callback) {
	"use strict";

	var Baby 						= require("babyparse"),
			objectAzurifier = require("./objectAzurifier");

	var reportHolder = [],
			customidObj  = {},
			bloodyTwice  = false;

	Baby.parse(trimmedCSV, {
		header: true,

		step: function(row) {
			objectAzurifier(YYYY_MM, "Video ID", "Policy", row.data[0], function(err, azurifiedObj) {
				azurifiedObj.approved = {_: false, $: "Edm.Boolean"};
				reportHolder.push(azurifiedObj);
				customidObj[azurifiedObj["Custom_ID"]._] = azurifiedObj["Custom_ID"]._;
				return;
			});
		},

		complete: function(results) {
			// This complete callback runs twice for some reason
			if(bloodyTwice) {
				return;
			}
			bloodyTwice = true;

			return callback(results, reportHolder, customidObj);
		}
	});
}

module.exports = csvParser;
