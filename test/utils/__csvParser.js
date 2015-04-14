var Test = require("tape"),
	csvParser = require("../../api/utils/csvParser.js");

Test("The csvToJSON function", function(t) {

	var fs = require("fs");
	var chippedCSV = [
		{FirstName: "Rory", LastName: "Sedgwick", Email: "bigboy1101@gmail.com", PhoneNumber: "01111999111", AdminRights: false},
		{FirstName: "Dave", LastName: "BeachSwimSuit", Email: "yahoo@excel.word", PhoneNumber: "01243567890", AdminRights: true}
	];

	fs.readFile("./testdata/csvParser.csv", function(err, contents) {
		t.error(err, "shouldnt be no error in here boy");

		var output = csvToJSON(contents);
		t.deepEqual(output, chippedCSV, "should return an array of objects deeply equal to the input");
		t.end();
	});

});