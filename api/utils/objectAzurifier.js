/**
* Azurifies an object
*
* Replaces some common illegal characters:
* Replaces - and ? with whitespace, trimming if needs be
* Replaces mid-string whitespace with _
* Eliminates brackets
* Prepends _ to keys if they begin with a number
*
* See tests for examples
*
* @param {string}				 	PartitionKey					Optional			The partition key to use for the operation
* @param {string}				 	RowKey1								Optional 			The key of the object to use as RowKey.
*																															Video ID is a special case for our purposes
*																															- if specified as RK1 but not found in the
*																															input object, Video_ID will be used instead.
* @param {string}				 	RowKey2								Optional 			To concatenate with the first as RowKey
* @param {object/array} 	objectToAzurify 			Required 			The object to contaminate
*	@param {errorOrResult}	callback 							Required 			callback - contains error details
* 																														or a decontaminated thing of the same type
* 																														as was put in (array->array, obj->obj)
*
**/


function objectAzurifier(PartitionKey, RowKey1, RowKey2, objectToAzurify, callback) {
	"use strict";

	if(typeof(objectToAzurify) !== 'object' || Array.isArray(objectToAzurify)) {
		var err = new Error("Input must be an object");
		return callback(err);
	}

	var entityStrGen = require("azure-storage").TableUtilities.entityGenerator.String;

	var illegalSpace		 			= /\s/g,
			illegalCharacters1 	  = /[-?]/g,
			illegalCharacters2		= /[()]/g;

	function queueBarger(propName) {
	    if(propName[0].search(/\d/) !== -1) {
	        return "_" + propName;
	    }
	    else return propName;
	}

	var azurifiedObj = {};

	// Needed for uploading already-processed reports...
	if(RowKey1 === "Video ID"){
		RowKey1 = objectToAzurify[RowKey1] ? RowKey1 : "Video_ID";
	}

	if(PartitionKey) azurifiedObj.PartitionKey = entityStrGen(PartitionKey);
	if(RowKey1 && RowKey2) azurifiedObj.RowKey = entityStrGen(objectToAzurify[RowKey1] + "_" + objectToAzurify[RowKey2]);
	else if (RowKey1) azurifiedObj.RowKey 		 = entityStrGen(objectToAzurify[RowKey1]);
	else if (RowKey2) return callback(new Error("Rowkey must be entered as either the 2nd input or as 2nd + 3rd"));

	for(var prop in objectToAzurify) {
		if(objectToAzurify.hasOwnProperty(prop) && prop !== '') {

			var slightlyMoreLegal = prop.replace(illegalCharacters1, " ")
																		.trim()
																		.replace(illegalSpace, "_")
																		.replace(illegalCharacters2, ""),
					myNewValue = objectToAzurify[prop].hasOwnProperty("_") ? objectToAzurify[prop]._ : objectToAzurify[prop];

			azurifiedObj[queueBarger(slightlyMoreLegal)] = entityStrGen(myNewValue);
		}
	}

	return callback(null, azurifiedObj);
}

module.exports = objectAzurifier;

