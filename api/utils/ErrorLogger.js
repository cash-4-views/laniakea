/**
* A simple error logger for simple people
*
**/

"use strict";

var fs = require("fs");

function ErrorLogger() {

	this.errorCounter = 0;
	this.errorLog 		= [];

	return this;
}

ErrorLogger.prototype = {

	addError: function(id, err, offendingItem) {
		this.errorCounter += 1;
		this.errorLog.push({
			id  : id,
			err : err,
			item: offendingItem
		});

		return this;
	},

	conclude: function(appendOrWrite, filename) {
		if(!this.errorCounter || arguments.length !== 2) return;

		var errArrStr = JSON.stringify(this.errorLog);

		console.log(this.errorCounter + " errors, see " + filename + " for details");
		fs[appendOrWrite + "File"](filename + ".json", errArrStr, function(err) {
			if(err) return;
			else 		return true;
		});
	}

};

module.exports = ErrorLogger;
