/**
* Trims a CSV
*
*	If given start/end arguments, trims the csv according to
* those arguments as long as they are preceded by an empty line.
* Otherwise, defaults to searching for 'Video_ID' or 'Video ID',
* and cuts away everything above the line on which it matches,
* and ends at an empty-line-preceded 'Legend'. If the csv was
* indeed a csv, but no matches were found, it gives back the string
* version of what was put in.
*
* 3 passes -
* 	1.	startTrim converts the input to a string if needs be, performing the initial cut
* 	2.	midTrim checks if the starting trim was successful, performing the next cut if it was
* 	3.	trimmedCSV is then either the fully pruned csv, or everything after the first cut if
* 			the second cut failed.
*
*
* @param {string/buffer} 	csvToTrim  				Required 		The csv to be trimmed
* @param {string} 				startInclusive 		Optional 		The term to start at
* @param {string} 				endExclusive 			Optional 		The term to end at
* @param {errorOrResult} 	callback 					Required 		Given the trimmedcsv as a 2nd arg
*
* @return {string}
**/

function csvTrimmer(csvToTrim, startInclusive, endExclusive, callback) {
	"use strict";

	var startBefore = startInclusive ? new RegExp("\n\n(?=" + startInclusive + ")") : /(.*(?=Video_ID|Video ID).*)/;
	var endBefore   = endExclusive   ? new RegExp("\n\n(?=" + endExclusive + ")") : /\n\n(?=Legend)/g;

	// lol
	var startTrim  = csvToTrim.toString().split(startBefore),
			midTrimCSV = startTrim[1]  ? (startTrim[1] + startTrim[2]).split(endBefore)[0] : null,
			trimmedCSV = midTrimCSV 	 ? midTrimCSV : startTrim[1] + startTrim[2],
			finalTrim  = trimmedCSV 	 ? trimmedCSV.trim() : startTrim[0];


	if(finalTrim) return callback(null, finalTrim);
	else  				return callback(new Error("Bad csv or arguments"));
}

module.exports = csvTrimmer;
