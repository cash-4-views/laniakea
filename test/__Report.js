var azure 		 = require("azure-storage"),
		config 		 = require("./config/testconfig").database;
		test 			 = require("tape");

var tableSvc 		 = azure.createTableService(config.dbacc, config.dbkey);
		report 			 = new Report(tableSvc, config.rtable);

// insert a report into the table here

test("The getReport function", function(t) {
	"use strict";

	report.getReport("2016_01", "Terry_Teriyaki", false, false, function(err, results, continuationToken) {
		t.notOk(err, "should not return an error");
		t.end();
	});
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
