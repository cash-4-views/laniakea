var entityGen = require("azure-storage").TableUtilities.entityGenerator;

function azureObjCreator(inputObj, callback) {
	"use strict";

	var prop;

	for(prop in inputObj) {
		inputObj[prop] = entityGen.String(inputObj[prop]);
	}

	return callback(inputObj);
}

module.exports = azureObjCreator;
