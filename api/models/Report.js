var entityGen = require("azure-storage").TableUtilities.entityGenerator,
		azureObjCreator = require("../utils/azureObjCreator");

function Report(storageClient, tableName, partitionKey) {
	"use strict";

	this.storageClient = storageClient;
	this.tableName = tableName;
	this.partitionKey = partitionKey;
	this.storageClient.createTableIfNotExists(tableName, function tableCreated(err) {
		if(err) throw err;
	});
}

Report.prototype = {

	findReports: function(monthYear, customId, callback) {
		"use strict";

		var nextContinuationToken = null;
		var query = new azure.TableQuery()
		  .where('PartitionKey == ?', monthYear + "");

		 if(customId) query = query.and('Custom ID == ?', customId);

		this.storageClient.queryEntities(this.tableName, query, null, function entitiesQueried(err, results) {
			if(err) return callback(err);
			else if (results.continuationToken) {
				console.log(results.continuationToken);
        nextContinuationToken = results.continuationToken;
        return this.getNextBatch(query, nextContinuationToken, results, callback);
      }
			else return callback(null, result.entries);
		});
	},

	getNextBatch: function(query, continuationToken, results, callback) {
		"use strict";
		var nextContinuationToken = null;
		var totalResults;

		if (!continuationToken) return callback(result);
		else this.storageClient.queryEntities(this.tableName, query, null, function entitiesQueried(err, newResults) {
			if(err) return callback(err);
			totalResults = results.concat(newResults);

			if (newResults.continuationToken) {
				nextContinuationToken = newResults.continuationToken;
				return this.getNextBatch(query, nextContinuationToken, totalResults, callback);
			}
			else return callback(totalResults);
		});
	},

	addReport: function(report, callback) {
		"use strict";

		var azureAccountObject = {
			PartitionKey 								: entityGen.String(this.partitionKey),
			RowKey  										: entityGen.String(report["Video ID"])
		};

		azureObjCreator(azureAccountObject, function(processedObject) {
			this.storageClient.insertEntity(this.tableName, processedObject, function entityInserted(err) {
				if(err) return callback(err);
				else return callback(null);
			});
		});
	},

	updateReport: function(rKey, updateObj, callback) {
		"use strict";

		this.storageClient.retrieveEntity(this.tableName, this.partitionKey, rKey, function entityQueried(err, entity) {
			if(err) return callback(err);
			var field;

			for (field in updateObj) {
				entity[field] = updateObj[field];
			}

			this.storageClient.updateEntity(this.tableName, entity, function entityUpdated(err) {
				if(err) return callback(err);
				else return callback(null);
			});
		});
	}

};

module.exports = Report;
