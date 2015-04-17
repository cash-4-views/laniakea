var entityGen = require("azure-storage").TableUtilities.entityGenerator;

function objectAzurifier(partitionKey, rowKey, objectToAzurify, callback) {
	"use strict";

	var azurifiedObj = {
		PartitionKey 								: entityGen.String(partitionKey),
		RowKey  										: entityGen.String(objectToAzurify[rowKey])
	};

	for(var prop in objectToAzurify) {
		azurifiedObj[prop] = entityGen.String(objectToAzurify[prop]);
	}

	return callback(azurifiedObj);
}

module.exports = objectAzurifier;
