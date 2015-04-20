var azure 		 		= require("azure-storage"),
		config 		 		= require("./testconfig").database,
		ApprovedList 	= require("../api/models/ApprovedList"),
		test 			 		= require("tape");

var tableSvc 		 = azure.createTableService(config.dbacc, config.dbkey);
		approvedList = new ApprovedList(tableSvc, config.atable);

test("The getApproved function, ", function(t) {
	"use strict";

	var approvedTing = {
		PartitionKey: {_: "approvedlist"},
		RowKey: {_: "The_Chain_Gang"},
		username: {_: "Terry Tibbs"},
		_YYYY_MM: {_: "2015_01"}
	};

	tableSvc.insertEntity(config.atable, approvedTing, {echoContent: true}, function(error, result, response) {
		t.notOk(error, "shouldn't throw an error in the preparation");
		var objectWeWant = result;

		getApproved("The_Chain_Gang", null, function(err, resultArray) {
			t.notOk(err, "shouldn't throw an error");
			t.equal(resultArray.length, 1, "should return exactly one result");
			t.deepEqual(resultArray[0], objectWeWant, "should return the object we put in");
			t.end();
		});
	});

});

test("The getApproved function, with YYYY_MM argument", function(t) {
	"use strict";

		var approvedTing = {
			PartitionKey: {_: "approvedlist"},
			RowKey: {_: "The_Chain_Gang"},
			username: {_: "Terry Tibbs"},
			_YYYY_MM: {_: "2015_01"}
		};

		tableSvc.insertEntity(config.atable, approvedTing, {echoContent: true}, function(error, result, response) {
			t.notOk(error, "shouldn't throw an error in the preparation");
			var objectWeWant = result;

			getApproved("The_Chain_Gang", "2015_01", function(err, resultArray) {
				t.notOk(err, "shouldn't throw an error");
				t.equal(resultArray.length, 1, "should return exactly one result");
				t.deepEqual(resultArray[0], objectWeWant, "should return the object we put in");
				t.end();
			});
		});
});

test("The updateApproved function", function(t) {
	"use strict";

	t.end();
});
