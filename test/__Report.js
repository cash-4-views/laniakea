var azure 		 = require("azure-storage"),
		config 		 = require("./config/testconfig").database,
		Report  	 = require("../api/models/Report"),
		fs 				 = require("fs"),
		test 			 = require("tape");

var tableSvc 		 = azure.createTableService(config.dbacc, config.dbkey),
		tableName 	 = config.rtable + Date.now(),
		report;

test("Preparation", function(t) {
	"use strict";

	tableSvc.doesTableExist(tableName, function(errPing, res) {
		if(res) {
			t.comment("Table already exists. Deleting table...");
			tableSvc.deleteTableIfExists(tableName, function(errDel, result) {
				if(result) setTimeout(function() {return;}, 5000);
			});
		}

		report = new Report(tableSvc, tableName);
		setTimeout(t.end, 500);
	});

});

// test("The getReport function", function(t) {
// 	"use strict";

// 	// report.getReport("2016_01", "Terry_Teriyaki", false, false, function(err, results, continuationToken) {
// 	// 	t.notOk(err, "should not return an error");
// 		t.end();
// 	// });
// });

// test("The getNextBatch function", function(t) {
// 	"use strict";

// 	t.end();
// });

test("The createReport function ", function(t) {
	"use strict";

	fs.readFile(__dirname + "/testdata/uploadcsv1.csv", {encoding: 'utf8'}, function(err, contents) {
		t.notOk(err, "- preparation: should not return an error in reading the file");

		report.createReport("2010_01", contents, function(err, response) {
			t.notOk(err, " should not return an error");
			t.equal(response, true, "should return true on a successful upload");

			var query = new azure.TableQuery()
														.where("PartitionKey eq ?", "2010_01");

			tableSvc.queryEntities(tableName, query, null, function entitiesQueried(err, result){
				t.notOk(err, " should not return an error retrieving the report");
				t.equal(result.entries.length, 218, "should return the same number of items as we uploaded");
				t.end();
			});
		});
	});
});

// test("The createReportRow function", function(t) {
// 	"use strict";

// 	t.end();
// });


// test("The updateReportRow function", function(t) {
// 	"use strict";

// 	t.end();
// });

// test("The getCustomIDList function", function(t) {
// 	"use strict";

// 	t.end();
// });


// test("The approveAllOfCustomID function", function(t) {
// 	"use strict";

// 	t.end();
// });

test("Cleaning up after ourselves - deleting the table, ", function(t) {
	"use strict";

	tableSvc.deleteTable(tableName, function(err) {
		t.notOk(err, "should successfully delete the table");
		t.end();
	});
});
