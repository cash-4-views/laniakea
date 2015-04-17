function deAzurifier(objectToDeAzurify, callback) {
	"use strict";

	var deAzurifiedObj = {};
	objectToDeAzurify.PartitionKey 	= null;
	objectToDeAzurify.RowKey 				= null;
	objectToDeAzurify.Timestamp 		= null;
	objectToDeAzurify[".metadata"] 	= null;

	for(var prop in objectToDeAzurify) {
		if(objectToDeAzurify.hasOwnProperty(prop) &&
				objectToDeAzurify[prop] !== null &&
				objectToDeAzurify[prop]._) {
			deAzurifiedObj[prop] = objectToDeAzurify[prop]._;
		}
	}

	return callback(null, deAzurifiedObj);
}

module.exports = deAzurifier;
