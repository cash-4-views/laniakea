var azure 		 = require("azure-storage"),
		config 		 = require("./testconfig").database;
		test 			 = require("tape");

var tableSvc 		 = azure.createTableService(config.dbacc, config.dbkey);
		report 			 = new Report(tableSvc, config.rtable);

test("The getReport function", function(t) {
	"use strict";

	t.end();
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
