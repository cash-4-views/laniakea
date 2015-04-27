"use strict";

var azure  					= require("azure-storage"),
		bcrypt 					= require("bcrypt-nodejs"),
		objectAzurifier = require("../utils/objectAzurifier");

function Account(storageClient, tableName) {

	this.storageClient = storageClient;
	this.tableName = tableName;
	this.partitionKey = "users";
	this.storageClient.createTableIfNotExists(tableName, function tableCreated(err) {
		if(err) throw err;
	});
}

Account.prototype = {

	getAccounts: function(callback) {
		var self = this;

		var query = new azure.TableQuery()
													.where("PartitionKey == ?", self.partitionKey);

		self.storageClient.queryEntities(self.tableName, query, null, function entitiesQueried(err, result) {
			if(err) return callback(err);
			else 		return callback(null, result.entries);
		});
	},

	getSingleAccount: function(email, callback) {
		var self = this;

		var query = new azure.TableQuery()
													.where("PartitionKey == ?", self.partitionKey)
													.and("email == ?", email);

		self.storageClient.queryEntities(self.tableName, query, null, function entitiesQueried(err, result) {
			if(err) 															return callback(err);
			else if(result.entries.length === 0)	return callback(404);
			else 																	return callback(null, result.entries[0]);
		});
	},

	createSingleAccount: function(item, callback) {
		var self = this;

		objectAzurifier(self.partitionKey, "email", null, item, function(error, processedAccount) {
			self.storageClient.insertEntity(self.tableName, processedAccount, function entityInserted(err) {
 				if(err) return callback(err);
				else 		return callback(null);
			});
		});
	},

	updateSingleAccount: function(RowKey, updateObj, callback) {
		var self = this;

		var query = new azure.TableQuery()
													.where("PartitionKey == ?", self.partitionKey)
													.and("RowKey == ?", RowKey);

		self.storageClient.queryEntities(self.tableName, query, null, function entitiesQueried(err, result) {
			if(err) return callback(err);

			var entity 	 = result.entries[0],
					oldEmail = result.entries[0].email._,
					field;

			function updateUserInDB() {
				for(field in updateObj) {
					if(updateObj.hasOwnProperty(field)){
						entity[field] = updateObj[field];
					}
				}

				objectAzurifier(null, null, null, entity, function(err, azurifiedObj) {
					self.storageClient.updateEntity(self.tableName, azurifiedObj, function entityUpdated(err) {
						if(err) return callback(err);
						else 		return callback(null, azurifiedObj, oldEmail);
					});
				});
			}

			if(updateObj.password) self.hashPassword(updateObj.password, function(err, hash) {
				updateObj.password = hash;
				return updateUserInDB();
			});
			else return updateUserInDB();
		});
	},

	deleteSingleAccount: function(RowKey, callback) {
		var self = this;

		var query = new azure.TableQuery()
													.where("PartitionKey == ?", self.partitionKey)
													.and("RowKey == ?", RowKey);

		self.storageClient.queryEntities(self.tableName, query, null, function entitiesQueried(err, result) {
			if(err) return callback(err);
			var entity = result.entries[0];

			self.storageClient.deleteEntity(self.tableName, entity, function entityDeleted(errDel, res) {
				if(err) return callback(err);
				else 		return callback(null, entity, entity.email._);
			});
		});
	},

	comparePassword: function(password1, password2, callback) {

		bcrypt.compare(password1, password2, function(err, res) {
			if(err) 			return callback(err);
			else if(!res) return callback(400);
			else 					return callback(null);
		});
	},

	hashPassword: function(password, callback) {

		bcrypt.hash(password, null, null, function(err, hash) {
			if(err) return callback(err);
			else 		return callback(null, hash);
		});
	}

};

module.exports = Account;
