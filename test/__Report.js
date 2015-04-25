var azure 		 = require("azure-storage"),
		config 		 = require("./config/testconfig").database,
		Report  	 = require("../api/models/Report"),
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

test("The getReport function", function(t) {
	"use strict";

	// report.getReport("2016_01", "Terry_Teriyaki", false, false, function(err, results, continuationToken) {
	// 	t.notOk(err, "should not return an error");
		t.end();
	// });
});

test("The getNextBatch function", function(t) {
	"use strict";

	t.end();
});

test("The createReport function", function(t) {
	"use strict";

	t.end();
});

test("The createReportRow function", function(t) {
	"use strict";

	t.end();
});


test("The updateReportRow function", function(t) {
	"use strict";

	t.end();
});

test("The getCustomIDList function", function(t) {
	"use strict";

	t.end();
});


test("The approveAllOfCustomID function", function(t) {
	"use strict";

	t.end();
});

test("Cleaning up after ourselves - deleting the table, ", function(t) {
	"use strict";

	tableSvc.deleteTable(tableName, function(err) {
		t.notOk(err, "should successfully delete the table");
		t.end();
	});
});
