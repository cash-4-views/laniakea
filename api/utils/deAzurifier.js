/**
* DeAzurifies an object
*
* Merely trims off the azure value-wrapping
* So turns {key: {_: val, $: Edm.datatype}} into {key: val}
* Does not transform characters back into their illegal variants
*
* @param {object/array} 	thingToDeAzurify 			The object or set of objects to decontaminate
* @param {boolean}				keepKeys							Whether we should keep the PKey & RKey
*	@param {errorOrResult}	callback 							Optional callback - contains error details
* 																							or a decontaminated thing of the same type
* 																							as was put in (array->array, obj->obj)
*
* @return {object/array/callback}								As per input type, callback-contingent
**/

function deAzurifier(thingToDeAzurify, keepKeys, callback) {
	"use strict";

	if(typeof(thingToDeAzurify) !== 'object') {
		var err = new Error("Invalid input type:" + thingToDeAzurify + "is not an object or array");
		if(callback) return callback(err);
		else return err;
	}

	var inputTypeIsArray = Array.isArray(thingToDeAzurify),
			arrayOfContaminatedObjects = !inputTypeIsArray ? [thingToDeAzurify] : thingToDeAzurify;

	// May be significantly faster to use standard cached for loop - adjust if performance is an issue
	// Also, sullied properties remain legal-characterified as per objectAzurifier
	// (underscores rather than spaces, hyphens and question marks, no brackets)
	var deAzurifiedArrayOfDecontaminatedObjects = arrayOfContaminatedObjects.map(function(candidate) {

		var deAzurifiedObj = {},
				sulliedProp;

		if (!keepKeys) {
			candidate.PartitionKey 	= null;
			candidate.RowKey 				= null;
		}
		candidate.Timestamp 		= null;
		candidate[".metadata"] 	= null;

		if(candidate.approved) candidate.approved = null;

		for(sulliedProp in candidate) {
			if(candidate.hasOwnProperty(sulliedProp) &&
					candidate[sulliedProp] !== null &&
					candidate[sulliedProp]._) {
				deAzurifiedObj[sulliedProp] = candidate[sulliedProp]._;
			}
		}

		return deAzurifiedObj;
	});

	// You reap what you sow pal
	if (!callback) {
		if(!inputTypeIsArray) return deAzurifiedArrayOfDecontaminatedObjects[0];
		else 									return deAzurifiedArrayOfDecontaminatedObjects;
	} else {
		if(!inputTypeIsArray) return callback(null, deAzurifiedArrayOfDecontaminatedObjects[0]);
		else 									return callback(null, deAzurifiedArrayOfDecontaminatedObjects);
	}
}

module.exports = deAzurifier;
