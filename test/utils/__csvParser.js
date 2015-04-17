var Test 	  	= require("tape"),
		csvParser = require("../../api/utils/csvParser");

Test("The csvParser function", function(t) {
	"use strict";

	var fs   = require("fs"),
			path = require("path"),
			file = path.resolve(__dirname, "./testdata/csvParser.csv");

	var chippedCSV = [
		{first_name: "Rory", last_name: "Sedgwick", email: "bigboy1101@gmail.com", phone_number: "01111999111", admin_rights: "false"},
		{first_name: "Dave", last_name: "BeachSwimSuit", email: "yahoo@excel.word", phone_number: "01234567890", admin_rights: "true"}
	];

	fs.readFile(file, function(err, contents) {
		t.plan(2);
		t.error(err, "shouldnt be no error in here boy");
		t.deepEqual(csvParser(contents), chippedCSV, "should return an array of objects deeply equal to the input");
	});

});
