var test 	  		= require("tape"),
		fs 					= require("fs"),
		csvTrimmer  = require("../../api/utils/csvTrimmer");

test("The csvTrimmer function, without trim arguments", function(t) {
	"use strict";

	var stringWeWant =
	"Video ID,first_name,last_name,email,phone_number,admin_rights\n" +
	"123a4,Rory,Sedgwick,bigboy1101@gmail.com,01111999111,false\n" +
	"4213zz,Dave,BeachSwimSuit,yahoo@excel.word,01234567890,true",

			stringWeWant2 =
	"Video_ID,first_name,last_name,email,phone_number,admin_rights\n" +
	"123a4,Rory,Sedgwick,bigboy1101@gmail.com,01111999111,false\n" +
	"4213zz,Dave,BeachSwimSuit,yahoo@excel.word,01234567890,true";

	t.plan(4);

	fs.readFile(__dirname + "/../testdata/trimcsv1.csv", function(err, result) {
		t.comment("| Video ID in csv");
		t.notOk(err, "Shouldn't get an error m80s");

		csvTrimmer(result, null, null, function(errTrim, trimmedCSV) {
			t.equal(trimmedCSV, stringWeWant, "should return a successfully trimmed csv");
		});
	});


	fs.readFile(__dirname + "/../testdata/trimcsv3.csv", function(err, result) {
		t.comment("| Video_ID in csv");
		t.notOk(err, "Shouldn't get an error m80s");

		csvTrimmer(result, null, null, function(errTrim, trimmedCSV) {
			t.equal(trimmedCSV, stringWeWant2, "should return a successfully trimmed csv");
		});
	});
});

test("The csvTrimmer function, without trim arguments, no matches", function(t) {
	"use strict";

	var stringWeWant =
	"Video id,first_name,last_name,email,phone_number,admin_rights\n" +
	"123a4,Rory,Sedgwick,bigboy1101@gmail.com,01111999111,false\n" +
	"4213zz,Dave,BeachSwimSuit,yahoo@excel.word,01234567890,true";

	fs.readFile(__dirname + "/../testdata/trimcsv2.csv", function(err, result) {
		t.notOk(err, "Shouldn't get an error m80s");

		csvTrimmer(result, null, null, function(errTrim, trimmedCSV) {
			t.equal(trimmedCSV, stringWeWant, "should return the same string as we inputted");
			t.end();
		});
	});
});

test("The csvTrimmer function, with a start trim argument", function(t) {
	"use strict";

	var stringWeWant =
	"france,moo\n\n" +
	"Video ID,first_name,last_name,email,phone_number,admin_rights\n" +
	"123a4,Rory,Sedgwick,bigboy1101@gmail.com,01111999111,false\n" +
	"4213zz,Dave,BeachSwimSuit,yahoo@excel.word,01234567890,true";

	t.plan(3);

	fs.readFile(__dirname + "/../testdata/trimcsv1.csv", function(err, result) {
		t.notOk(err, "Shouldn't get an error m80s");

		csvTrimmer(result, "france", null, function(errTrim, trimmedCSV) {
			t.equal(trimmedCSV, stringWeWant, "should return a successfully trimmed csv");
		});

		csvTrimmer(result, "France", null, function(errTrim, trimmedCSV) {
			t.equal(trimmedCSV, result.toString(), "should be case sensitive, so gives back the whole input");
		});
	});
});

test("The csvTrimmer function, with an end trim argument", function(t) {
	"use strict";

	var stringWeWant =
	"Video ID,first_name,last_name,email,phone_number,admin_rights\n" +
	"123a4,Rory,Sedgwick,bigboy1101@gmail.com,01111999111,false\n" +
	"4213zz,Dave,BeachSwimSuit,yahoo@excel.word,01234567890,true\n\n" +
	"Legend\nhello pal\nhw r u";

	t.plan(3);

	fs.readFile(__dirname + "/../testdata/trimcsv1.csv", function(err, result) {
		t.notOk(err, "Shouldn't get an error m80s");

		csvTrimmer(result, null, "hi bud", function(errTrim, trimmedCSV) {
			t.equal(trimmedCSV, stringWeWant, "should return a successfully trimmed csv");
		});

		csvTrimmer(result, null, "HI BUD", function(errTrim, trimmedCSV) {
			t.equal(trimmedCSV, stringWeWant + "\n\nhi bud", "should be case sensitive");
		});
	});
});

test("The csvTrimmer function, with both trim arguments", function(t) {
	"use strict";

	var stringWeWant =
	"france,moo\n\n" +
	"Video ID,first_name,last_name,email,phone_number,admin_rights\n" +
	"123a4,Rory,Sedgwick,bigboy1101@gmail.com,01111999111,false\n" +
	"4213zz,Dave,BeachSwimSuit,yahoo@excel.word,01234567890,true\n\n" +
	"Legend\nhello pal\nhw r u";

	fs.readFile(__dirname + "/../testdata/trimcsv1.csv", function(err, result) {
		t.notOk(err, "Shouldn't get an error m80s");

		csvTrimmer(result, "france", "hi bud", function(errTrim, trimmedCSV) {
			t.equal(trimmedCSV, stringWeWant, "should return a successfully trimmed csv");
			t.end();
		});

	});
});


test("The csvTrimmer function, no arguments, leading and trailing newline", function(t) {
	"use strict";

	var stringWeWant =
	"Video ID,Content Type,Policy,Video Title,Video Duration (sec),Username,Uploader,Channel Display Name,Channel ID,Claim Type," +
	"Claim Origin,Total Views,Watch Page Views,Embedded Player Views,Channel Page Video Views,Live Views,Recorded Views,Ad-Enabled Views," +
	"Total Earnings,Gross YouTube-sold Revenue,Gross Partner-sold Revenue,Gross AdSense-sold Revenue,Estimated RPM,Net YouTube-sold Revenue," +
	"Net AdSense-sold Revenue,Multiple Claims?,Category,Asset ID,Asset Labels,Asset Channel ID,Custom ID,ISRC,GRid,UPC,Artist,Asset Title,Album,Label\n" +
	"--DBLqSHUj4,UGC,monetize,Seven Mile in Colorado,231,pinkfloyd,darr25,Darren Roberts,VjjrybFNLU9u0vkTP6JwIw,Audio,Audio Match," +
	"5,5,0,0,0,5,5,0,0,0,0,,0,0,no,education,A200218710251237|A769719267282901,,,,GB01A1300592,A10302B0001941414Z,,Pink Floyd," +
	"Brain Damage (Darkside),\"Darkside, Tom Stoppard incorporating The Dark Side of The Moon b\",ADA UK\n" +
	"--G5PsYFoQw,UGC,monetize,HD - Time - Brit Floyd March 1 2012,409,pinkfloyd,catalystmaker,T-Mak World,VnJp5vR8AUMI0p10KnWtCg," +
	"Audio,Audio Match,0,0,0,0,0,0,0,0,0,0,0,,0,0,no,music,A217585348540128,Compositions,,,,,,,Time,,",

			stringWeWant2 =
	"Video_ID,Content Type,Policy,Video Title,Video Duration (sec),Username,Uploader,Channel Display Name,Channel ID,Claim Type," +
	"Claim Origin,Total Views,Watch Page Views,Embedded Player Views,Channel Page Video Views,Live Views,Recorded Views,Ad-Enabled Views," +
	"Total Earnings,Gross YouTube-sold Revenue,Gross Partner-sold Revenue,Gross AdSense-sold Revenue,Estimated RPM,Net YouTube-sold Revenue," +
	"Net AdSense-sold Revenue,Multiple Claims?,Category,Asset ID,Asset Labels,Asset Channel ID,Custom ID,ISRC,GRid,UPC,Artist,Asset Title,Album,Label\n" +
	"--DBLqSHUj4,UGC,monetize,Seven Mile in Colorado,231,pinkfloyd,darr25,Darren Roberts,VjjrybFNLU9u0vkTP6JwIw,Audio,Audio Match," +
	"5,5,0,0,0,5,5,0,0,0,0,,0,0,no,education,A200218710251237|A769719267282901,,,,GB01A1300592,A10302B0001941414Z,,Pink Floyd," +
	"Brain Damage (Darkside),\"Darkside, Tom Stoppard incorporating The Dark Side of The Moon b\",ADA UK\n" +
	"--G5PsYFoQw,UGC,monetize,HD - Time - Brit Floyd March 1 2012,409,pinkfloyd,catalystmaker,T-Mak World,VnJp5vR8AUMI0p10KnWtCg," +
	"Audio,Audio Match,0,0,0,0,0,0,0,0,0,0,0,,0,0,no,music,A217585348540128,Compositions,,,,,,,Time,,";

	t.plan(4);

	fs.readFile(__dirname + "/../testdata/trimcsv4.csv", function(err, result) {
		t.comment("| Video ID");
		t.notOk(err, "Shouldn't get an error m80s");

		csvTrimmer(result, null, null, function(errTrim, trimmedCSV) {
			t.equal(trimmedCSV, stringWeWant, "should return a successfully trimmed csv");
		});
	});

	fs.readFile(__dirname + "/../testdata/trimcsv5.csv", function(err, result) {
		t.comment("| Video_ID");
		t.notOk(err, "Shouldn't get an error m80s");

		csvTrimmer(result, null, null, function(errTrim, trimmedCSV) {
			t.equal(trimmedCSV, stringWeWant2, "should return a successfully trimmed csv");
		});
	});
});

test("The csvTrimmer function, no arguments, Video ID not at the start of the line", function(t) {
	"use strict";


	fs.readFile(__dirname + "/../testdata/trimcsv6.csv", function(err, result) {
		t.notOk(err, "Shouldn't get an error m80s");

		var stringWeWant =
		"Ad_Enabled_Views,Album,Artist,Asset_ID,Asset_Title,Category,Channel_Display_Name,Channel_ID,Channel_Page_Video_Views," +
		"Claim_Origin,Claim_Type,Content_Type,Custom_ID,Embedded_Player_Views,GRid,Gross_AdSense_sold_Revenue,Gross_Partner_sold_Revenue," +
		"Gross_YouTube_sold_Revenue,ISRC,Label,Live_Views,Multiple_Claims,Net_AdSense_sold_Revenue,Net_YouTube_sold_Revenue,Policy," +
		"Recorded_Views,Total_Earnings,Total_Views,Uploader,Username,Video_Duration_sec,Video_ID,Video_Title,Watch_Page_Views\n" +
		"5,\"Darkside, Tom Stoppard incorporating The Dark Side of The Moon b\",Pink Floyd,A200218710251237|A769719267282901," +
		"Brain Damage (Darkside),education,Darren Roberts,VjjrybFNLU9u0vkTP6JwIw,0,Audio Match,Audio,UGC,Royal_Albert_Hall,0," +
		"A10302B0001941414Z,0,0,0,GB01A1300592,ADA UK,0,no,0,0,monetize,5,0,5,darr25,pinkfloyd,231,--DBLqSHUj4,Seven Mile in Colorado,5";

		csvTrimmer(result, null, null, function(errTrim, trimmedCSV) {
			t.equal(trimmedCSV, stringWeWant, "should return a successfully trimmed csv");
			t.end();
		});
	});
});
