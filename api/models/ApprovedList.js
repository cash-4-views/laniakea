var azure  					= require("azure-storage"),
		objectAzurifier = require("../utils/objectAzurifier");

function ApprovedList(storageClient, tableName) {
	"use strict";

	this.storageClient = storageClient;
	this.tableName = tableName;
	this.partitionKey = "approvedlist";
	this.storageClient.createTableIfNotExists(tableName, function tableCreated(err) {
		if(err) throw err;
	});
}

ApprovedList.prototype = {

	getApproved: function(customid, YYYY_MM, callback) {
		"use strict";
		var self = this;

		var query = new azure.TableQuery()
													.where("RowKey == ?", customid);

		if(YYYY_MM) query = query.and("_" + YYYY_MM + " == ?", YYYY_MM);

		self.storageClient.queryEntities(self.tableName, query, null, function entitiesQueried(err, results) {
			if(err) return callback(err);
			else return callback(null, results.entries);
		});
	},

	updateApproved: function(customid, YYYY_MM, callback) {
		"use strict";
		var self = this;

		self.storageClient.retrieveEntity(self.tableName, self.partitionKey, customid, function entityQueried(err, entity) {
			if(err) return callback(err);
			else if(!entity) {
				var newObj = {};
				newObj["_" + YYYY_MM] = YYYY_MM;

				objectAzurifier(self.partitionKey, customid, newObj, function(error, processedObj) {
					self.storageClient.insertEntity(self.tableName, processedAccount, function entityInserted(err) {
						if(err) return callback(err);
						else return callback(null);
					});
				});
			} else {
				if(!entity["_" + YYYY_MM]) entity[YYYY_MM] = {};
				entity["_" + YYYY_MM]._ = YYYY_MM;

				self.storageClient.updateEntity(self.tableName, entity, function entityUpdated(err) {
					if(err) return callback(err);
					else return callback(null);
				});
			}

		});
	}
};

module.exports = ApprovedList;
