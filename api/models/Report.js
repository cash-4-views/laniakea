var azure  					= require("azure-storage"),
		objectAzurifier = require("../utils/objectAzurifier");

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

		objectAzurifier(YYYY_MM, "Video ID", report, function(processedReport) {
			self.storageClient.insertEntity(self.tableName, processedReport, function entityInserted(err) {
				if(err) return callback(err);
				else return callback(null);
			});
		});
	},

	createBatchedReports: function(YYYY_MM, reportsArray, callback) {
		"use strict";
		var self = this;

		// Each batch can only hold 100 operations, so we make a container for our batches
		var batchHolder = [];
		// Calculate the number of batches we need so we can perform multiple write operations at once;
		var numberOfReports = reportsArray.length;
		var reportsInOneBatch = 100;
		var numberOfBatches = Math.ceil(numberOfReports/reportsInOneBatch);
		// Split the reportsArray into batches
		var n, splitReportsArray = [];

		for (n = 0; n < numberOfBatches; n += 1) {
			splitReportsArray[n] = reportsArray.slice(n*reportsInOneBatch, n*reportsInOneBatch + reportsInOneBatch);
			batchHolder[n] = new azure.TableBatch();
		}

		splitReportsArray.forEach(function(ele, ind) {
			var m, len = ele.length;
			var timestamp = Date.now();

			function batchInserter(processedReport) {
				return batchHolder[ind].insertEntity(processedReport);
			}

			for (m = 0; m < len; n+=1) {
				objectAzurifier(YYYY_MM, "Video ID", ele[m], batchInserter);
			}
			// Change this to async operation
			self.storageClient.executeBatch(self.tableName, batchHolder[ind], function(err, result, response) {
				if(err) {
					console.log(err);
					return callback(err);
				} else {
					return console.log("batch ", ind, " completed in: ", Date.now()-timestamp);
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
