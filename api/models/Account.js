var azure  					= require("azure-storage"),
		bcrypt 					= require("bcrypt-nodejs"),
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
													.where("PartitionKey == ?", self.partitionKey);

		self.storageClient.queryEntities(self.tableName, query, null, function(err, result, response) {
			if(err) return callback(err);
			else 		return callback(null, result.entries);
		});
	},

	getSingleAccount: function(email, callback) {
		"use strict";
		var self = this;

		self.storageClient.retrieveEntity(self.tableName, self.partitionKey, email, function entityQueried(err, entity) {
			if(err) return callback(err);
			else 		return callback(null, entity);
		});
	},

	createSingleAccount: function(item, callback) {
		"use strict";
		var self = this;

		objectAzurifier(self.partitionKey, "email", null, item, function(error, processedAccount) {
			self.storageClient.insertOrMergeEntity(self.tableName, processedAccount, function entityInserted(err) {
 				if(err) return callback(err);
				else 		return callback(null);
			});
		});
	},

	updateSingleAccount: function(email, updateObj, callback) {
		"use strict";
		var self = this;

		self.storageClient.retrieveEntity(self.tableName, self.partitionKey, email, function entityQueried(err, entity) {
			if(err) return callback(err);
			var field;

			for(field in updateObj) {
				if(updateObj.hasOwnProperty(field)){
					entity[field] = updateObj[field];
				}
			}

			objectAzurifier(null, null, null, entity, function(err, azurifiedObj) {
				self.storageClient.updateEntity(self.tableName, azurifiedObj, function entityUpdated(err) {
					if(err) return callback(err);
					else 		return callback(null);
				});
			});
		});
	},

	comparePassword: function(password1, password2, callback) {
		"use strict";

		bcrypt.compare(password1, password2, function(err, res) {
			if(err) 			return callback(err);
			else if(!res) return callback("dodgy password");
			else 					return callback(null);
		});
	},

	hashPassword: function(password, callback) {
		"use strict";

		bcrypt.hash(password, null, null, function(err, hash) {
			if(err) return callback(err);
			else 		return callback(null, hash);
		});
	}

};

module.exports = Account;
