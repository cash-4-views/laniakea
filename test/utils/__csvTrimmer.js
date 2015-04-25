var Test 	  		= require("tape"),
		fs 					= require("fs"),
		csvTrimmer  = require("../../api/utils/csvTrimmer");

Test("The csvTrimmer function, without trim arguments", function(t) {
	"use strict";

	var stringWeWant =
	"Video ID,first_name,last_name,email,phone_number,admin_rights\n" +
	"123a4,Rory,Sedgwick,bigboy1101@gmail.com,01111999111,false\n" +
	"4213zz,Dave,BeachSwimSuit,yahoo@excel.word,01234567890,true";

	fs.readFile(__dirname + "/../testdata/trimcsv1.csv", function(err, result) {
		t.notOk(err, "Shouldn't get an error m80s");
		csvTrimmer(result, null, null, function(err, trimmedCSV) {
			t.equal(trimmedCSV, stringWeWant, "should return a successfully trimmed csv");
			t.end();
		});
	});
});

Test("The csvTrimmer function, without trim arguments, no matches", function(t) {
	"use strict";

	var stringWeWant =
	"Video ID,first_name,last_name,email,phone_number,admin_rights\n" +
	"123a4,Rory,Sedgwick,bigboy1101@gmail.com,01111999111,false\n" +
	"4213zz,Dave,BeachSwimSuit,yahoo@excel.word,01234567890,true";

	fs.readFile(__dirname + "/../testdata/trimcsv2.csv", function(err, result) {
		t.notOk(err, "Shouldn't get an error m80s");
		csvTrimmer(result, null, null, function(err, trimmedCSV) {
			t.equal(trimmedCSV, stringWeWant, "should return a successfully trimmed csv");
			t.end();
		});
	});
});

Test("The csvTrimmer function, with a start trim argument", function(t) {
	"use strict";

	var stringWeWant =
	"france,moo\n\n" +
	"Video ID,first_name,last_name,email,phone_number,admin_rights\n" +
	"123a4,Rory,Sedgwick,bigboy1101@gmail.com,01111999111,false\n" +
	"4213zz,Dave,BeachSwimSuit,yahoo@excel.word,01234567890,true";

	fs.readFile(__dirname + "/../testdata/trimcsv1.csv", function(err, result) {
		t.notOk(err, "Shouldn't get an error m80s");

		csvTrimmer(result, "france", null, function(err, trimmedCSV) {
			t.equal(trimmedCSV, stringWeWant, "should return a successfully trimmed csv");
		});

		csvTrimmer(result, "France", null, function(err, trimmedCSV) {
			t.notOk(trimmedCSV, "should be case sensitive");
			t.end();
		});
	});
});

Test("The csvTrimmer function, with an end trim argument", function(t) {
	"use strict";

	var stringWeWant =
	"Video ID,first_name,last_name,email,phone_number,admin_rights\n" +
	"123a4,Rory,Sedgwick,bigboy1101@gmail.com,01111999111,false\n" +
	"4213zz,Dave,BeachSwimSuit,yahoo@excel.word,01234567890,true\n\n" +
	"Legend\nhello pal\nhw r u";

	fs.readFile(__dirname + "/../testdata/trimcsv1.csv", function(err, result) {
		t.notOk(err, "Shouldn't get an error m80s");

		csvTrimmer(result, null, "hi bud", function(err, trimmedCSV) {
			t.equal(trimmedCSV, stringWeWant, "should return a successfully trimmed csv");
		});

		csvTrimmer(result, null, "HI BUD", function(err, trimmedCSV) {
			t.equal(trimmedCSV, stringWeWant + "\n\nhi bud", "should be case sensitive");
			t.end();
		});
	});
});

Test("The csvTrimmer function, with both trim arguments", function(t) {
	"use strict";

	var stringWeWant =
	"france,moo\n\n" +
	"Video ID,first_name,last_name,email,phone_number,admin_rights\n" +
	"123a4,Rory,Sedgwick,bigboy1101@gmail.com,01111999111,false\n" +
	"4213zz,Dave,BeachSwimSuit,yahoo@excel.word,01234567890,true\n\n" +
	"Legend\nhello pal\nhw r u";

	fs.readFile(__dirname + "/../testdata/trimcsv1.csv", function(err, result) {
		t.notOk(err, "Shouldn't get an error m80s");

		csvTrimmer(result, "france", "hi bud", function(err, trimmedCSV) {
			t.equal(trimmedCSV, stringWeWant, "should return a successfully trimmed csv");
			t.end();
		});

	});
});
