var entityStrGen = require("azure-storage").TableUtilities.entityGenerator.String;

function objectAzurifier(partitionKey, rowKey1, rowKey2, objectToAzurify, callback) {
	"use strict";

	var illegalSpace		 			= /\s/g,
			illegalCharacters1 	  = /[-?]/g,
			illegalCharacters2		= /[()]/g;

	var azurifiedObj = {};

	if(partitionKey) azurifiedObj.PartitionKey = entityStrGen(partitionKey);
	if(rowKey1 && rowKey2) azurifiedObj.RowKey = entityStrGen(objectToAzurify[rowKey1] + "_" + objectToAzurify[rowKey2]);
	else if (rowKey1) azurifiedObj.RowKey 		 = entityStrGen(objectToAzurify[rowKey1]);
	else if (rowKey2) return callback("Rowkey must be entered as either the 2nd input or as 2nd + 3rd");

	for(var prop in objectToAzurify) {
		if(objectToAzurify.hasOwnProperty(prop)) {
			azurifiedObj[prop.replace(illegalCharacters1, " ").trim().replace(illegalSpace, "_").replace(illegalCharacters2, "")] = entityStrGen(objectToAzurify[prop]);
		}
	}

	return callback(null, azurifiedObj);
}

module.exports = objectAzurifier;
