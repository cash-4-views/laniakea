"use strict";

var test 	  		 = require("tape"),
		fs 					 = require("fs"),
		dummyHolder  = require("../testdata/reportHolder"),
		csvParser    = require("../../api/utils/csvParser");

test("The csvParser function, ", function(t) {
	var customids = { '': '', Royal_Festival_Hall: 'Royal_Festival_Hall' };

	fs.readFile(__dirname + "/../testdata/parsecsv.csv", function(err, contents) {
		csvParser("2015_01", contents.toString(), function(results, reportHolder, customidObj) {

			t.equal(results.errors.length, 0, "should return zero errors");
			t.equal(reportHolder.length, 2, "should return an array of 2 report items");
			t.deepEqual(reportHolder, dummyHolder, "should return an array of 2 correctly azurified report items");
			t.deepEqual(customidObj, customids, "should return an object holding all of the custom ids in the report");
			t.end();
		});
	});
});
