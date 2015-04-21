function csvTrimmer(csvToTrim, startInclusive, endExclusive, callback) {
	"use strict";

	var startBefore = startInclusive ? new RegExp("\n\n(?=" + startInclusive + ")") : /\n(?=Video ID)/g;
	var endBefore   = endExclusive   ? new RegExp("\n\n(?=" + endExclusive + ")") : /\n\n(?=Legend)/g;

	var startTrim  = csvToTrim.toString().split(startBefore);
	var trimmedCSV = startTrim[1] ? startTrim[1].split(endBefore)[0] : null;

	return callback(null, trimmedCSV);
}

module.exports = csvTrimmer;
