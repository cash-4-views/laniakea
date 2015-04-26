var azure  					= require("azure-storage"),
		Baby 					  = require("babyparse"),
		fs 							= require("fs"),
		objectAzurifier = require("../utils/objectAzurifier"),
		csvTrimmer 			= require("../utils/csvTrimmer");


function Report(storageClient, tableName) {
	"use strict";

	this.storageClient = storageClient;
	this.tableName 		 = tableName;
	this.storageClient.createTableIfNotExists(tableName, function tableCreated(err) {
		if(err) throw err;
	});
}

Report.prototype = {

	getReport: function(YYYY_MM, customid, approved, getAll, callback) {
		"use strict";
		var self = this;

		var query = reportQueryMaker(YYYY_MM, customid, approved);

		self.storageClient.queryEntities(self.tableName, query, null, function entitiesQueried(err, results) {
			if(err) return callback(err);
			else if (results.continuationToken) {

				var batchOfRows = results.entries;

        if(getAll) 	return self.getNextBatch(query, results.continuationToken, batchOfRows, true, callback);
        else 				return callback(null, batchOfRows, results.continuationToken);
      } else {
				return callback(null, results.entries);
			}
		});
	},

	getNextBatch: function(queryOrOptions, continuationToken, batchOfRows, getAll, callback) {
		"use strict";
		var self = this;

		var q 		= queryOrOptions,
				query = q instanceof azure.TableQuery ? q : reportQueryMaker(q.YYYY_MM, q.customid, q.approved);

		if (!continuationToken) return callback(null, batchOfRows);
		else self.storageClient.queryEntities(self.tableName, query, continuationToken, function entitiesQueried(err, newRows) {
			if(err) return callback(err);

			var totalResults = batchOfRows ? batchOfRows.concat(newRows.entries) : newRows.entries,
					nextContinuationToken = newRows.continuationToken;

			if(getAll) 	return self.getNextBatch(query, nextContinuationToken, totalResults, true, callback);
			else 				return callback(null, totalResults, nextContinuationToken);

		});
	},

	createReport: function(YYYY_MM, csvReport, callback) {
		"use strict";
		var self = this;

		var azurifiedReportHolder = [],
				customidObject 				= {},
				timestampPrep					= Date.now(),
				bloodyTwice 					= false;

		csvTrimmer(csvReport, null, null, function(err, trimmedCSV) {
			if(err) return callback(err);
			console.log("Parsing started");

			Baby.parse(trimmedCSV, {
				header: true,

				step: function(row) {
					objectAzurifier(YYYY_MM, "Video ID", "Policy", row.data[0], function(err, azurifiedObj) {
						azurifiedObj.approved = {_: false, $: "Edm.Boolean"};
						azurifiedReportHolder.push(azurifiedObj);
						customidObject[azurifiedObj["Custom_ID"]._] = azurifiedObj["Custom_ID"]._;
						return;
					});
				},

				complete: function(results) {
					// This complete callback runs twice for some reason
					if(bloodyTwice) {
						return;
					}
					bloodyTwice = true;

					console.log("Parsing complete! Errors: ", results.errors);
					console.log("Trimming, parsing and batching took ", Date.now()-timestampPrep, "/ms");

					var errorCounter  = 0,
							holderLength  = azurifiedReportHolder.length,
							base  	 		  = Math.ceil(holderLength/100)*100,
							errorArray 	  = [],
							tBeforeUpload = Date.now(),
							tForUpload1,
							bigBatch      = holderLength > 1000,
							n;

					azurifiedReportHolder.forEach(function(rep, ind) {
						self.storageClient.insertOrReplaceEntity(self.tableName, rep, function(err) {
							if ((ind*100)%base === 0) {
								var percentCompleted = ((ind)/base)*100;

								console.log(percentCompleted + "% completed");
								if(bigBatch) {
									if(percentCompleted === 1) tForUpload1 = Date.now();
									if(percentCompleted === 2) {
										var msTimeForOnePercent = Date.now() - tForUpload1;
										return callback(null, msTimeForOnePercent*100);
									}
								}
							}
							if (err) {
								errorCounter += 1;
								errorArray.push({
									ind: ind,
									err: err,
									rep: rep
								});
							}
							if(ind === holderLength-1) {
								customidObject.RowKey = "y" + YYYY_MM;
								objectAzurifier("customidlist", "RowKey", null, customidObject, function(errAzure, azurifiedList) {
									self.storageClient.insertOrMergeEntity(self.tableName, azurifiedList, function(errInsert) {
										if (errInsert || errAzure) {
											errorCounter += 1;
											errorArray.push({
												ind: "customidlist",
												err: errInsert || errAzure,
												rep: azurifiedList
											});
										}
										self.updateReportList(YYYY_MM, function(errUpdate) {
											if (errUpdate) {
												errorCounter += 1;
												errorArray.push({
													ind: "reportList",
													err: errUpdate,
													rep: azurifiedList
												});
											}
											console.log("Done, that took ", Date.now() - timestampPrep, "/ms to upload " + holderLength + " rows and there were " + errorCounter, " errors");
											if(errorCounter) {
												console.log("Check errorlog.json for details");
												fs.appendFile("errorlog.json", JSON.stringify(errorArray));
											}
											if(!bigBatch) return callback(null, true);
										});
									});
								});
							}
						});

					});

				}
			});
		});
	},

	createReportRow: function(YYYY_MM, report, callback) {
		"use strict";
		var self = this;

		objectAzurifier(YYYY_MM, "Video ID", "Policy", report, function(error, azurifiedObj) {
			self.storageClient.insertEntity(self.tableName, azurifiedObj, function entityInserted(err) {
				if(err) return callback(err);
				else return callback(null);
			});
		});
	},


	updateReportRow: function(YYYY_MM, rKey, updateObj, callback) {
		"use strict";
		var self = this;

		self.storageClient.retrieveEntity(self.tableName, YYYY_MM, rKey, function entityQueried(err, entity) {
			if(err) return callback(err);
			var field;

			for(field in updateObj) {
				if(updateObj.hasOwnProperty(field)){
					entity[field] = updateObj[field];
				}
			}

			objectAzurifier(null, null, null, entity, function(err, azurifiedObj) {
				self.storageClient.updateEntity(self.tableName, azurifiedObj, function entityUpdated(err) {
					if(err) return callback(err);
					else 		return callback(null);
				});
			});
		});
	},

	getReportList: function(callback) {
		"use strict";
		var self = this;

		self.storageClient.retrieveEntity(self.tableName, "reportlist", "reports", function entityQueried(err, entity) {
			if(err) return callback(err);
			else 		return callback(null, entity);
		});
	},

	updateReportList: function(YYYY_MM, callback) {
		"use strict";
		var self = this;

		var query = new azure.TableQuery()
													 .where("PartitionKey eq ?", "reportlist")
													 .and("RowKey eq ?", "reports");

		self.storageClient.queryEntities(self.tableName, query, null, function entitiesQueried(err, result) {
			if(err) return callback(err);
			var entity = result.entries[0];

			if (result.entries.length === 0) {
				entity = {};
				entity.PartitionKey = "reportlist";
				entity.RowKey = "reports";
			}
			entity[YYYY_MM] = YYYY_MM;

			objectAzurifier("PartitionKey", "RowKey", null, entity, function(errAzure, azurifiedObj) {
				if(errAzure) return callback(errAzure);

				else self.storageClient.insertOrMergeEntity(self.tableName, azurifiedObj, function entityUpdated(errUpdate) {
					if(err) return callback(errUpdate);
					else 		return callback(null);
				});
			});
		});
	},

	getCustomIDList: function(YYYY_MM, callback) {
		"use strict";
		var self = this;

		var query = new azure.TableQuery()
													.where("PartitionKey == ?", "customidlist");

		if(YYYY_MM) query = query.and("RowKey == ?", "y" + YYYY_MM);

		self.storageClient.queryEntities(self.tableName, query, null, function entitiesQueried(err, result) {
			if(err) return callback(err);
			else 		return callback(null, result.entries);
		});
	},

	updateCustomIDList: function(YYYY_MM, customid, callback) {
		"use strict";
		var self = this;

		var query = new azure.TableQuery()
													.where("PartitionKey == ?", "customidlist")
													.and("RowKey == ?", "y" + YYYY_MM);

		self.storageClient.queryEntities(self.tableName, query, null, function entitiesQueried(err, result) {
			if(err) return callback(err);
			else 	{
				var entity = result.entries[0];

				entity[customid] = customid;

				objectAzurifier(null, null, null, entity, function(errAzure, azurifiedObj) {
					console.log(azurifiedObj);

					if(errAzure) return callback(errAzure);
					else self.storageClient.insertOrMergeEntity(self.tableName, azurifiedObj, function entityUpdated(errUpdate) {
						if(errUpdate) return callback(errUpdate);
						else 					return callback(null);
					});
				});
			}
		});
	},

	approveAllOfCustomID: function(YYYY_MM, customid, callback) {
		"use strict";
		var self = this;


		self.getReport(YYYY_MM, customid, null, true, function entitiesQueried(error, arrayOfResults) {
			if(error) return callback(error);

			var len = arrayOfResults.length,
					errorArray = [];

			arrayOfResults.forEach(function(rep, ind) {
				rep.approved = {_: true, $: "Edm.Boolean"};
				self.storageClient.updateEntity(self.tableName, rep, function entityUpdated(err) {
					if(err) {
						errorArray.push({
							ind: ind,
							err: err,
							rep: rep
						});
					}
					if (ind === len-1) {
						console.log("done " + (len - errorArray.length) + " rows approved, " + errorArray.length + " errors");
						if(errorArray.length === 0) errorArray = null;
						return callback(errorArray);
					}
				});
			});

		});

	}

};

module.exports = Report;

function reportQueryMaker(YYYY_MM, customid, approved) {
	"use strict";

	var query = new azure.TableQuery()
	  										.where("PartitionKey == ?", YYYY_MM);

	if(customid === true)  						query = query.and("Custom_ID != ?", '');
	else if(customid === false) 			query = query.and("Custom_ID == ?", '');
	else if(customid !== undefined) 	query = query.and("Custom_ID == ?", customid);

	if(approved === true) 						query = query.and("approved == ?", true);
	else if(approved === false) 			query = query.and("approved != ?", true);

	return query;

}

// just here as a note for tomorrow - searching rowkeys by startswith
function queryForExistingCustomIDs() {
	"use strict";

	var whatIWant = "--DBLqSHUj4_monetize";
	var my_string = "--DBLqSHUj4_";

	var edgeString = my_string.substring(0,my_string.length-1) +
	                    String.fromCharCode(my_string.charCodeAt(my_string.length-1)+1);

	myArray = [
	    "--DBLqSHUj4_monetize",
	    "-DBLqSHUj4_monetize",
	    "--DBLqSHUj4_nonetize",
	    "--DBLqSHUj5_monetize",
	    "--DBLqSHUj4_asset"
	    ];

	var newArr = [];

	myArray.forEach(function(ele) {
	    if(ele >= my_string && ele < edgeString) {
	        newArr.push(ele);
	    }
	});

	console.log(newArr);
}
