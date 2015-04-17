var azure  					= require("azure-storage"),
		Baby 					  = require("babyparse"),
		objectAzurifier = require("../utils/objectAzurifier"),
		csvTrimmer 			= require("../utils/csvTrimmer");

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

		objectAzurifier(YYYY_MM, "Video ID", report, function(error, processedReport) {
			self.storageClient.insertEntity(self.tableName, processedReport, function entityInserted(err) {
				if(err) return callback(err);
				else return callback(null);
			});
		});
	},

	createBatchedReports: function(YYYY_MM, csvReport, callback) {
		"use strict";
		var self = this;

		var batchHolder = [];
		var reportsInOneBatch = 99;
		var timestampPrep = Date.now();
		var n = 0;

		csvTrimmer(csvReport, null, null, function(err, trimmedCSV) {
			if(err) return callback(err);

			Baby.parse(trimmedCSV, {
				header: true,
				step: function(row) {
					if(n === 0 && !batchHolder[n]) console.log(row);
					objectAzurifier(YYYY_MM, "Video ID", row.data[0], function(err, azurifiedObj) {
						if (!batchHolder[n]) {
							batchHolder[n] = new azure.TableBatch();
						}	else if (batchHolder[n].size() === reportsInOneBatch) {
							n += 1;
							batchHolder[n] = new azure.TableBatch();
						}
						return batchHolder[n].insertEntity(azurifiedObj);
					});
				},
				complete: function(results) {
					console.log("Parsing complete! Errors: ", results.errors);
					console.log("Trimming, parsing and batching took ", Date.now()-timestampPrep, "/ms");
					console.log("Starting batch upload: ");
					var totalBatchSize = 0;

					batchHolder.forEach(function(batch, index) {
						var timestampBatch = Date.now();
						totalBatchSize += batch.size();
						if(batchHolder.length === index+1) {
							console.log("The total number of row headers is: ", results.meta.fields.length);
							console.log("The total number of batches is: ", batchHolder.length);
							console.log("The total number of batch operations is: ", totalBatchSize);
						}
						// self.storageClient.executeBatch(self.tableName, batchHolder[index], function(err, result, response) {
						// 	if(err) {
						// 		console.log(err);
						// 		return callback(err);
						// 	} else {
						// 		return console.log("batch ", index, " completed in: ", Date.now()-timestampBatch);
						// 	}
						// });
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

			for (field in updateObj) {
				if(updateObj.hasOwnProperty(field)) {
					if(!entity[field]) entity[field] = {};
					entity[field]._ = updateObj[field];
				}
			}

			self.storageClient.updateEntity(self.tableName, entity, function entityUpdated(err) {
				if(err) return callback(err);
				else return callback(null);
			});
		});
	}

};

module.exports = Report;
