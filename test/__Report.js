"use strict";

var azure 		 = require("azure-storage"),
		config 		 = require("./config/testconfig").database,
		Report  	 = require("../api/models/Report"),
		fs 				 = require("fs"),
		test 			 = require("tape");

var tableSvc 		 = azure.createTableService(config.dbacc, config.dbkey),
		tableName 	 = config.rtable + Date.now(),
		report;

test("Preparation", function(t) {

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

// 	// report.getReport("2016_01", "Terry_Teriyaki", false, false, function(err, results, continuationToken) {
// 	// 	t.notOk(err, "should not return an error");
// 		t.end();
// 	// });
// });

// test("The getNextBatch function", function(t) {

// 	t.end();
// });

test("The createReport function, a simple upload ", function(t) {

	t.plan(9);

	fs.readFile(__dirname + "/testdata/uploadcsv1.csv", {encoding: 'utf8'}, function(err, contents) {

		report.createReport("2010_01", contents, function(err, response) {
			t.notOk(err, " should not return an error");
			t.equal(response, true, "should return true on a successful upload");

			var queryReport = new azure.TableQuery()
																	.where("PartitionKey eq ?", "2010_01");

			var queryList   = new azure.TableQuery()
																	.where("PartitionKey eq ?", "reportlist")
																	.and("RowKey eq ?", "reports")
																	.and("_2010_01 eq ?", "2010_01");

			var queryCID 	  = new azure.TableQuery()
																	.where("PartitionKey eq ?", "customidlist")
																	.and("RowKey eq ?", "y2010_01");

			tableSvc.queryEntities(tableName, queryReport, null, function entitiesQueried(err, result){
				t.notOk(err, " should not return an error retrieving the report");
				t.equal(result.entries.length, 218, "should create the same number of rows as we inputted");
			});

			tableSvc.queryEntities(tableName, queryList, null, function entitiesQueried(err, result){
				t.notOk(err, " should not return an error retrieving the report list");
				t.equal(result.entries.length, 1, "should update exactly one item storing the date of our reports");
			});

			tableSvc.queryEntities(tableName, queryCID, null, function entitiesQueried(err, result){
				t.notOk(err, " should not return an error retrieving the customid list");
				t.equal(result.entries.length, 1, "should create exactly one customidlist item");
				t.equal(Object.keys(result.entries[0]).length-4, 19, "should create exactly one customidlist item with the correct number of custom ids (-4 azure properties)");
			});
		});
	});
});

test("The createReport function, two same-date uploads with different custom ids ", function(t) {

	fs.readFile(__dirname + "/testdata/uploadcsv2.csv", {encoding: 'utf8'}, function(errRead, contents) {
		fs.readFile(__dirname + "/testdata/uploadcsv3.csv", {encoding: 'utf8'}, function(errRead2, contents2) {

			report.createReport("2016_01", contents, function(errCreate1, response) {
				t.notOk(errCreate1, " should not return an error 1");
				t.equal(response, true, "should return true on a successful upload 1");

				var query = new azure.TableQuery()
															.where("PartitionKey eq ?", "2016_01");

				tableSvc.queryEntities(tableName, query, null, function entitiesQueried(errQuery1, result1){
					var entityWeWant;
					if(result1 && result1.entries) {
						entityWeWant = result1.entries.filter(function(ele) {
							return ele.Custom_ID._ === "old_id";
						})[0];
					}

					t.notOk(errQuery1, "should upload the first report without error");
					t.equal(result1.entries.length, 5, "should create the correct number of rows");
					t.ok(entityWeWant, "should create our test-tube entity");

					report.createReport("2016_01", contents2, function(errCreate2, response2) {
						t.notOk(errCreate1, " should not return an error 2");
						t.equal(response, true, "should return true on a successful upload 2");

						tableSvc.queryEntities(tableName, query, null, function entitiesQueried(errQuery2, result2){
							var updatedEntityWeWant;
							console.log(result2.entries);
							if(result2 && result2.entries) {
								updatedEntityWeWant = result2.entries.filter(function(ele) {
									return ele.Custom_ID._ === "updated_id";
								})[0];
							}

							t.ok(updatedEntityWeWant, "should create find our updated test-tube entity");
							t.notOk(errQuery2, "should upload the second report without error");
							t.equal(result2.entries.length, 5, "should upload the second report without replacing the first entirely");
							t.deepEqual(updatedEntityWeWant.RowKey, entityWeWant.RowKey, "should update the old test-tube entity with the new customid");
							t.end();
						});

					});
				});
			});
		});
	});
});

// test("The createReportRow function", function(t) {

// 	t.end();
// });


// test("The updateReportRow function", function(t) {

// 	t.end();
// });

// test("The getCustomIDList function", function(t) {

// 	t.end();
// });


// test("The approveAllOfCustomID function", function(t) {

// 	t.end();
// });

test("Cleaning up after ourselves - deleting the table, ", function(t) {

	tableSvc.deleteTable(tableName, function(err) {
		t.notOk(err, "should successfully delete the table");
		t.end();
	});
});
