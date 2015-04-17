var azure  					= require("azure-storage"),
		objectAzurifier = require("../utils/objectAzurifier");

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

	getAccounts: function(callback) {
		"use strict";
		var self = this;

		var query = new azure.TableQuery()
											.select(["username", "customid", "email", "phone"])
											.where("PartitionKey == ?", self.partitionKey);

		self.storageClient.queryEntities(self.tableName, query, null, function(err, result, response) {
			if(err) return callback(err);
			else return callback(null, result.entries);
		});
	},

	getSingleAccount: function(username, callback) {
		"use strict";
		var self = this;

		self.storageClient.retrieveEntity(self.tableName, self.partitionKey, username, function entityQueried(err, entity) {
			if(err) return callback(err);
			else {
				return callback(null, entity);
			}
		});
	},

	createSingleAccount: function(item, callback) {
		"use strict";
		var self = this;

		objectAzurifier(self.partitionKey, "username", item, function(processedAccount) {
			self.storageClient.insertEntity(self.tableName, processedAccount, function entityInserted(err) {
				if(err) return callback(err);
				else return callback(null);
			});
		});
	},

	updateSingleAccount: function(rKey, updateObj, callback) {
		"use strict";
		var self = this;

		self.storageClient.retrieveEntity(self.tableName, self.partitionKey, rKey, function entityQueried(err, entity) {
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

module.exports = Account;
