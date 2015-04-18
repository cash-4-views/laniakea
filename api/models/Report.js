var azure  					= require("azure-storage"),
		Baby 					  = require("babyparse"),
		objectAzurifier = require("../utils/objectAzurifier"),
		csvTrimmer 			= require("../utils/csvTrimmer"),
		fs 							= require("fs");

function Report(storageClient, tableName) {
	"use strict";

	this.storageClient = storageClient;
	this.tableName = tableName;
	this.storageClient.createTableIfNotExists(tableName, function tableCreated(err) {
		if(err) throw err;
	});
}

Report.prototype = {

	getSingleReport: function(YYYY_MM, customid, callback) {
		"use strict";
		var self = this;

		var nextContinuationToken = null;
		var query = new azure.TableQuery()
		  										.where("PartitionKey == ?", YYYY_MM);

		 if(customid) query = query.and("Custom ID == ?", customid);

		self.storageClient.queryEntities(self.tableName, query, null, function entitiesQueried(err, results) {
			if(err) return callback(err);
			else if (results.continuationToken) {
				console.log(results.continuationToken);
        nextContinuationToken = results.continuationToken;
        return self.getNextBatch(query, nextContinuationToken, results, callback);
      }
			else return callback(null, result.entries);
		});
	},

	getNextBatch: function(query, continuationToken, results, callback) {
		"use strict";
		var self = this;
		var nextContinuationToken = null;
		var totalResults;

		if (!continuationToken) return callback(result);
		else self.storageClient.queryEntities(self.tableName, query, null, function entitiesQueried(err, newResults) {
			if(err) return callback(err);
			totalResults = results.concat(newResults);

			if (newResults.continuationToken) {
				nextContinuationToken = newResults.continuationToken;
				return self.getNextBatch(query, nextContinuationToken, totalResults, callback);
			}
			else return callback(null, totalResults);
		});
	},

	createSingleReportRow: function(YYYY_MM, report, callback) {
		"use strict";
		var self = this;

		objectAzurifier(YYYY_MM, "Video ID", "Policy", report, function(error, azurifiedObj) {
			self.storageClient.insertEntity(self.tableName, azurifiedObj, function entityInserted(err) {
				if(err) return callback(err);
				else return callback(null);
			});
		});
	},

	createBatchedReport: function(YYYY_MM, csvReport, callback) {
		"use strict";
		var self = this;

		var azurifiedReportHolder = [],
				timestampPrep = Date.now(),
				bloodyTwice = false;

		csvTrimmer(csvReport, null, null, function(err, trimmedCSV) {
			if(err) return callback(err);
			console.log("Parsing started");

			Baby.parse(trimmedCSV, {
				header: true,

				step: function(row) {
					rowNumber += 1;
					objectAzurifier(YYYY_MM, "Video ID", "Policy", row.data[0], function(err, azurifiedObj) {
						azurifiedReportHolder.push(azurifiedObj);
						return;
					});
				},

				complete: function(results) {
					if(bloodyTwice) {
						return;
					}
					bloodyTwice = true;

					console.log("Parsing complete! Errors: ", results.errors);
					console.log("Trimming, parsing and batching took ", Date.now()-timestampPrep, "/ms");

					var errorCounter = 0,
							holderLength = azurifiedReportHolder.length;

					azurifiedReportHolder.forEach(function(rep, ind) {
						self.storageClient.insertEntity(self.tableName, rep, function(err) {
							if (err) {
								errorCounter += 1;
								var errorObj = {
									ind: ind,
									err: err,
									rep: rep
								};
								return fs.appendFile("errorbatcher.json", JSON.stringify(errorObj), function(err) {
									return;
								});
							} else if(!err && ind === holderLength-1) {
								console.log("Done, that took ", Date.now() - timestampPrep, "/ms in azurifiedReportHolder, and there were " + errorCounter, " errors");
								return callback(null, "success!");
							}
						});
					});

				}

			});
		});
	},

	updateSingleReportRow: function(YYYY_MM, rKey, updateObj, callback) {
		"use strict";
		var self = this;

		self.storageClient.retrieveEntity(self.tableName, YYYY_MM, rKey, function entityQueried(err, entity) {
			if(err) return callback(err);
			var field;

			objectAzurifier(YYYY_MM, "Video ID", "Policy", updateObj, function(err, azurifiedObj) {
				for (field in azurifiedObj) {
					if(azurifiedObj.hasOwnProperty(field)) {
						if(!entity[field]) entity[field] = {};
						entity[field]._ = updateObj[field]._;
					}
				}
			});

			self.storageClient.updateEntity(self.tableName, entity, function entityUpdated(err) {
				if(err) return callback(err);
				else return callback(null);
			});
		});
	}

};

module.exports = Report;
