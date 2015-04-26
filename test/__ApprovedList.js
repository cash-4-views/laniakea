var azure 		 		= require("azure-storage"),
		config 		 		= require("./config/testconfig").database,
		ApprovedList 	= require("../api/models/ApprovedList"),
		test 			 		= require("tape");

var tableSvc 		 = azure.createTableService(config.dbacc, config.dbkey),
		tableName 	 = config.ltable + Date.now(),
		approvedList;

test("Preparation", function(t) {
	"use strict";

	tableSvc.doesTableExist(tableName, function(errPing, res) {
		if(res) {
			t.comment("Table already exists. Deleting table...");
			tableSvc.deleteTableIfExists(tableName, function(errDel, result) {
				if(result) setTimeout(function() {return;}, 5000);
			});
		}

		approvedList = new ApprovedList(tableSvc, tableName);
		setTimeout(t.end, 500);
	});

});


test("The ApprovedList constructer ", function(t) {
	"use strict";

	t.equal(approvedList.storageClient, tableSvc, "should return an object with the storage client we specified");
	t.equal(approvedList.tableName, tableName, "should return an object with the table name specified");
	t.equal(approvedList.partitionKey, "approvedlist", "should return an object with the partitionkey as our default value");

	tableSvc.doesTableExist(tableName, function(errPing, res) {
		t.ok(res, "should create a table");
		t.end();
	});
});

test("The getApproved function ", function(t) {
	"use strict";

	var approvedTing = {
		PartitionKey: {_: "approvedlist"},
		RowKey 	 		: {_: "The_Main_Gang"},
		_2015_01 		: {_: "2015_01"}
	};

	t.plan(7);

	tableSvc.insertEntity(tableName, approvedTing, {echoContent: true}, function(error, result, response) {
		t.notOk(error, "shouldn't throw an error in the preparation");
		delete result[".metadata"];

		var objectWeWant = result;

		setTimeout(function() {

			approvedList.getApproved("The_Main_Gang", null, function(err, entities) {
				t.comment("| No date parameter");

				if(entities && entities[0]) delete entities[0][".metadata"];

				t.notOk(err, "shouldn't throw an error");
				t.equal(entities.length, 1, "should return exactly one result");
				t.deepEqual(entities[0], objectWeWant, "should return the object we put in");
			});

			approvedList.getApproved("The_Main_Gang", "2015_01", function(err, entities) {
				t.comment("| With a date parameter");

				if(entities && entities[0]) delete entities[0][".metadata"];

				t.notOk(err, "shouldn't throw an error");
				t.equal(entities.length, 1, "should return exactly one result");
				t.deepEqual(entities[0], objectWeWant, "should return the object we put in");
			});

		}, 0);
	});
});

test("The updateApproved function, with an existing entity, ", function(t) {
	"use strict";

	var objectWePutIn = {
		PartitionKey: {_: "approvedlist"},
		RowKey 			: {_: "another_new_object"},
		_2017_03    : {_: "2017_03"},
		_2010_01 		: {_: "2010_01"}
	};

	tableSvc.insertEntity(tableName, objectWePutIn, {echoContent: true}, function(errInsert, result, response) {
		t.notOk(errInsert, "should not return an error in the preparation");

		approvedList.updateApproved("another_new_object", "2017_03", function(err) {
			t.notOk(err, "should not return an error");

			tableSvc.retrieveEntity(tableName, "approvedlist", "another_new_object", function(error, entity) {
				t.equal(entity["_2017_03"]._, objectWePutIn["_2017_03"]._, "should have successfully updated the object");
				t.equal(entity["_2010_01"]._, objectWePutIn["_2010_01"]._, "should not have modified other properties of the entity");
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
		_2016_01		: {_: "2016_01"},
		_2010_02		: {_: "2010_02"}
	};
	tableSvc.insertEntity(tableName, objectWePutIn, {echoContent: true}, function(errInsert, result, response) {
		t.notOk(errInsert, "should not return an error in insertion");
		var objectWeWant = result;

		approvedList.updateApproved("Francois_Hollande", "2016_01", function(err) {
			t.notOk(err, "should not return an error");

			tableSvc.retrieveEntity(tableName, "approvedlist", "Francois_Hollande", function(error, entity) {
				t.notOk(error, "should not return an error");
				t.equal(entity["_2016_01"]._, objectWePutIn["_2016_01"]._, "should have successfully updated the object to the same as before");
				t.equal(entity["_2010_02"]._, objectWePutIn["_2010_02"]._, "should not have modified other properties of the entity");
				t.end();
			});
		});
	});
});

test("The updateApproved function, with a new entity, ", function(t) {
	"use strict";

	approvedList.updateApproved("timmy and the crew", "2016_01", function(err) {
		t.notOk(err, "should not return an error");

		setTimeout(function() {
			tableSvc.retrieveEntity(tableName, "approvedlist", "timmy and the crew", function(error, entity) {
				t.notOk(error, "should not return an error");
				t.ok(entity, "should have successfully created the entity");
				t.equal(entity["RowKey"]._, "timmy and the crew", "should have successfully created the object with a valid name");
				t.equal(entity["_2016_01"]._, "2016_01", "should have successfully created the object with the correct field");
				t.end();
			});
		}, 200);

	});
});

test("Cleaning up after ourselves - deleting the table, ", function(t) {
	"use strict";

	tableSvc.deleteTableIfExists(tableName, function(err) {
		t.notOk(err, "should successfully delete the table");
		t.end();
	});
});
