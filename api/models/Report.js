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

		var query = queryMaker(YYYY_MM, customid, approved);

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
				query = q instanceof azure.TableQuery ? q : queryMaker(q.YYYY_MM, q.customid, q.approved);

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

					var errorCounter = 0,
							holderLength = azurifiedReportHolder.length,
							base  	 		 = Math.ceil(holderLength/1000),
							errorArray 	 = [],
							n;

					azurifiedReportHolder.forEach(function(rep, ind) {
						self.storageClient.insertOrReplaceEntity(self.tableName, rep, function(err) {
							if (ind%base === 0) {
								console.log(ind/base/10, "% completed");
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
								objectAzurifier("customidlist", "RowKey", null, customidObject, function(err, azurifiedList) {
									self.storageClient.insertOrReplaceEntity(self.tableName, azurifiedList, function(err) {
										if (err) {
											errorCounter += 1;
											errorArray.push({
												ind: "customidlist",
												err: err,
												rep: azurifiedList
											});
										}
										self.updateReportList(YYYY_MM, function(err) {
											if (err) {
												errorCounter += 1;
												errorArray.push({
													ind: "customidlist",
													err: err,
													rep: azurifiedList
												});
											}
											console.log("Done, that took ", Date.now() - timestampPrep, "/ms to upload " + holderLength + " rows and there were " + errorCounter, " errors");
											if(errorCounter) console.log("Check errorlog.json for details");
											fs.appendFile("errorlog.json", JSON.stringify(errorArray));
											return callback(null, "success!");
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
				console.log(azurifiedObj);
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

		self.storageClient.retrieveEntity(self.tableName, "reportlist", "reports", function entityQueried(err, entity) {
			if(err) return callback(err);
			entity[YYYY_MM] = YYYY_MM;

			objectAzurifier(null, null, null, entity, function(errAzure, azurifiedObj) {
				if(errAzure) return callback(errAzure);
				else self.storageClient.updateEntity(self.tableName, azurifiedObj, function entityUpdated(errUpdate) {
					if(err) return callback(errUpdate);
					else 		return callback(null);
				});
			});
		});
	},

	getCustomIDList: function(YYYY_MM, callback) {
		"use strict";
		var self = this;

		self.storageClient.retrieveEntity(self.tableName, "customidlist", "y" + YYYY_MM, function entityQueried(err, entity) {
			if(err) return callback(err);
			else 		return callback(null, entity);
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

function queryMaker(YYYY_MM, customid, approved) {
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

