var azure  					= require("azure-storage"),
		objectAzurifier = require("../utils/objectAzurifier");

function ApprovedList(storageClient, tableName, partitionKey) {
	"use strict";

	this.storageClient = storageClient;
	this.tableName 		 = tableName;
	this.partitionKey  = partitionKey || "approvedlist";
	this.storageClient.createTableIfNotExists(tableName, function tableCreated(err) {
		if(err) throw err;
	});
}

ApprovedList.prototype = {

	// returns an array
	getApproved: function(customid, YYYY_MM, callback) {
		"use strict";
		var self = this;

		var query = new azure.TableQuery()
													.where("PartitionKey eq ?", self.partitionKey)
													.and("RowKey eq ?", customid);

		if(YYYY_MM) query = query.and("_" + YYYY_MM + " eq ?", YYYY_MM);

		self.storageClient.queryEntities(self.tableName, query, null, function entitiesQueried(err, result) {
			if(err) return callback(err);
			else 		return callback(null, result.entries);
		});
	},

	updateApproved: function(customid, YYYY_MM, callback) {
		"use strict";
		var self = this;

		self.storageClient.retrieveEntity(self.tableName, self.partitionKey, customid, function entityQueried(errFind, entity) {
			if(errFind && errFind.statusCode !== 404) return callback(errFind);
			else {
				var newObj = entity || {};
				if(!entity) newObj.RowKeyPlaceholder = customid;

				newObj[YYYY_MM] = YYYY_MM;

				objectAzurifier(self.partitionKey, "RowKeyPlaceholder", null, newObj, function(errAzure, processedObj) {
					delete processedObj.RowKeyPlaceholder;
					self.storageClient.insertOrMergeEntity(self.tableName, processedObj, function entityInserted(errInsert) {
						if(errInsert) return callback(errInsert);
						else 					return callback(null);
					});
				});
			}

		});
	}
};

module.exports = ApprovedList;
