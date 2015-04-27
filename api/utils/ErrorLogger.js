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

		return;
	},

	conclude: function(appendOrWrite, filename) {
		if(!this.errorCounter) return;

		var errArrStr = JSON.stringify(this.errorLog);

		console.log(this.errorCounter + " errors, see " + filename + " for details");
		fs[appendOrWrite + "File"](filename, errArrStr);
	}

};

module.exports = ErrorLogger;
