function csvTrimmer(csvToTrim, startInclusive, endExclusive, callback) {
	"use strict";

	var startBefore = startInclusive ? new RegExp("\n\n(?=" + startInclusive + ")") : /(.*(?=Video_ID|Video ID).*)/;
	var endBefore   = endExclusive   ? new RegExp("\n\n(?=" + endExclusive + ")") : /\n\n(?=Legend)/g;


	var startTrim  = csvToTrim.toString().split(startBefore),
			midTrimCSV = startTrim[1]  ? (startTrim[1] + startTrim[2]).split(endBefore)[0] : null,
			trimmedCSV = midTrimCSV ? midTrimCSV : startTrim[1] + startTrim[2];

	return callback(null, trimmedCSV);
}

module.exports = csvTrimmer;
