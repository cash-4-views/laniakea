var entityGen 			= require("azure-storage").TableUtilities.entityGenerator,
		azureObjCreator = require("../utils/azureObjCreator");

function Account(storageClient, tableName) {
	"use strict";

	this.storageClient = storageClient;
	this.tableName = tableName;
	this.partitionKey = "users";
	this.storageClient.createTableIfNotExists(tableName, function tableCreated(err) {
		if(err) throw err;
	});
}

Account.prototype = {

	findAccount: function(username, callback) {
		"use strict";

		this.storageClient.retrieveEntity(this.tableName, this.partitionKey, username, function entitiesQueried(err, result) {
			if(err) return callback(err);
			else return callback(null, result.entries);
		});
	},

	addAccount: function(item, callback) {
		"use strict";

		var azureAccountObject = {
			PartitionKey: entityGen.String("users"),
			RowKey  : entityGen.String(item.username),
			admin 	: entityGen.Boolean(item.admin)
		};

		azureObjCreator(azureAccountObject, function(processedObject) {
			this.storageClient.insertEntity(this.tableName, processedObject, function entityInserted(err) {
				if(err) return callback(err);
				else return callback(null);
			});
		});
	},

	updateAccount: function(rKey, updateObj, callback) {
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

module.exports = Account;
