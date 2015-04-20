function deAzurifier(thingToDeAzurify, callback) {
	"use strict";

	var inputTypeIsArray = Array.isArray(thingToDeAzurify),
			arrayOfContaminatedObjects = !inputTypeIsArray ? [thingToDeAzurify] : thingToDeAzurify;

	// May be significantly faster to use standard cached for loop - adjust if performance is an issue
	// Also, sullied properties remain legal-characterified as per objectAzurifier
	// (underscores rather than spaces, hyphens and question marks, no brackets)
	var deAzurifiedArrayOfDecontaminatedObjects = arrayOfContaminatedObjects.map(function(candidate) {

		var deAzurifiedObj = {},
				sulliedProp;

		candidate.PartitionKey 	= null;
		candidate.RowKey 				= null;
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
		else return deAzurifiedArrayOfDecontaminatedObjects;
	} else {
		if(!inputTypeIsArray) return callback(null, deAzurifiedArrayOfDecontaminatedObjects[0]);
		else return callback(null, deAzurifiedArrayOfDecontaminatedObjects);
	}
}

module.exports = deAzurifier;
