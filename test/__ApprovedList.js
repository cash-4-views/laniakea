var azure 		 		= require("azure-storage"),
		config 		 		= require("./testconfig").database,
		ApprovedList 	= require("../api/models/ApprovedList"),
		test 			 		= require("tape");

var tableSvc 		 = azure.createTableService(config.dbacc, config.dbkey);
		approvedList = new ApprovedList(tableSvc, config.atable);

test("The ApprovedList function ", function(t) {
	"use strict";

	t.equal(approvedList.storageClient, tableSvc, "should return an object with the storage client we specified");
	t.equal(approvedlist.tableName, config.atable, "should return an object with the table name specified");
	t.equal(approvedlist.PartitionKey, "approvedlist", "should return an object with the partitionkey as our default value");
	t.end();
});

test("The getApproved function, null second argument, ", function(t) {
	"use strict";

	var approvedTing = {
		PartitionKey: {_: "approvedlist"},
		RowKey 	 		: {_: "The_Chain_Gang"},
		customid 		: {_: "The Chain Gang"},
		_YYYY_MM 		: {_: "2015_01"}
	};

	tableSvc.insertEntity(config.atable, approvedTing, {echoContent: true}, function(error, result, response) {
		t.notOk(error, "shouldn't throw an error in the preparation");
		var objectWeWant = result;

		approvedList.getApproved("The_Chain_Gang", null, function(err, resultArray) {
			t.notOk(err, "shouldn't throw an error");
			t.equal(resultArray.length, 1, "should return exactly one result");
			t.deepEqual(resultArray[0], objectWeWant, "should return the object we put in");
			t.end();
		});
	});

});

test("The getApproved function, with a second argument", function(t) {
	"use strict";

		var approvedTing = {
			PartitionKey: {_: "approvedlist"},
			RowKey 	 		: {_: "The_Main_Gang"},
			username 		: {_: "Terry Tibbs"},
			_YYYY_MM 		: {_: "2015_01"}
		};

		tableSvc.insertEntity(config.atable, approvedTing,{echoContent: true}, function(error, result, response) {
			t.notOk(error, "shouldn't throw an error in the preparation");
			var objectWeWant = result;

			approvedList.getApproved("The_Main_Gang", "2015_01", function(err, resultArray) {
				t.notOk(err, "shouldn't throw an error");
				t.equal(resultArray.length, 1, "should return exactly one result");
				t.deepEqual(resultArray[0], objectWeWant, "should return the object we put in");
				t.end();
			});
		});
});

test("The updateApproved function, with an existing entity, ", function(t) {
	"use strict";

	var objectWePutIn = {
		PartitionKey: {_: "approvedlist"},
		RowKey 			: {_: "another_new_object"},
		customid 		: {_: "another_new_object"},
		_2010_01 		: {_: "2010_02"}
	};

	tableSvc.insertEntity(config.atable, approvedTing, {echoContent: true}, function(error, result, response) {

		approvedlist.updateApproved("another_new_object", "2017_03", function(err) {
			t.notOk(err, "should not return an error");

			tableSvc.retrieveEntity(config.atable, "approvedlist", "newspaper", function(error, item) {
				t.equal(item["_2016_01"], objectWePutIn["2017_03"], "should have successfully updated the object");
				t.equal(item["_2010_02"], objectWePutIn["2010_02"], "should not have modified other properties of the item");
				t.end();
			});
		});
	});
});

test("The updateApproved function, with an existing entity and field, ", function(t) {
	"use strict";

	var objectWePutIn = {
		PartitionKey: {_: "approvedlist"},
		RowKey 			: {_: "Francois_Hollande"},
		customid		: {_: "Francois Hollande"},
		_2016_01		: {_: "2016_01"},
		_2010_02		: {_: "2010_02"}
	};

	approvedlist.updateApproved("Francois_Hollande", "2016_01", function(err) {
		t.notOk(err, "should not return an error");

		tableSvc.retrieveEntity(config.atable, "approvedlist", "newspaper", function(error, item) {
			t.notOk(error, "should not return an error");
			t.equal(item["_2016_01"], objectWePutIn["2016_01"], "should have successfully updated the object to the same as before");
			t.equal(item["_2010_02"], objectWePutIn["2010_02"], "should not have modified other properties of the item");
			t.end();
		});
	});
});

test("The updateApproved function, with a new entity, ", function(t) {
	"use strict";

	approvedlist.updateApproved("timmy and the crew", "2016_01", function(err) {
		t.notOk(err, "should not return an error");

		tableSvc.retrieveEntity(config.atable, "approvedlist", "newEntity", function(error, item) {
			t.notOk(error, "should not return an error");
			t.ok(item, "should have successfully created the entity");
			t.equal(item["timmy_and_the_crew"], objectWePutIn["timmy and the crew"], "should have successfully created the object with a valid name");
			t.equal(item["_2016_01"], objectWePutIn["2016_01"], "should have successfully created the object with the correct field");
			t.end();
		});
		t.end();
	});
});
