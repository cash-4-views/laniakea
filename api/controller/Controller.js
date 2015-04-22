var fs 					 = require("fs"),
		Path 				 = require('path'),
		Baby 				 = require("babyparse"),
		deAzurifier  = require("../utils/deAzurifier");

function Controller(models, toolbox) {
	"use strict";

	this.account 			= models.account;
	this.approvedList = models.approvedList;
	this.report 			= models.report;
	this.messages 		= toolbox.messages;
}

Controller.prototype = {

	statics: {
		directory: {
			path: Path.resolve(__dirname + '/../../public'),
			index: true
		}
	},

	home: function(req, reply) {
		"use strict";

		return reply.redirect("/login");
	},

	login: function(req, reply) {
		"use strict";
		var self = this;

		if(req.method.toUpperCase() === "GET") {
			if(req.auth.isAuthenticated && req.auth.credentials.admin) return reply.redirect("/admin");
			else if(req.auth.isAuthenticated) return reply.redirect("/account");
			else return reply.view("login");
		}

		var deets = req.payload;
		if(!deets.password || !deets.email) return reply("Missing email or password");

		self.account.getSingleAccount(deets.email, function(err, returnedAccount) {
			if(err) return reply(err);
			var acc = deAzurifier(returnedAccount);

			self.account.comparePassword(deets.password, acc.password, function(err) {
				if(err) return reply(err);

				var profile = {
					email: acc.email,
					customid: acc.customid
				};

				req.auth.session.clear();

				if(returnedAccount.admin) {
					profile.admin = true;
					req.auth.session.set(profile);

					return reply.redirect("/admin");
				} else {
					req.auth.session.set(profile);

					return reply.redirect("/account");
				}

			});
		});

	},

	logout: function(req, reply) {
		"use strict";

		req.auth.session.clear();
		return reply.redirect('/');
	},

	myAccount: function(req, reply) {
		"use strict";
		var self = this;

		if(req.auth.credentials.admin) return reply.redirect("/admin");

		var customid = req.auth.credentials.customid;

		self.approvedList.getApproved(customid, function(err, approvedList) {
			if(err) return reply(err);
			else 		return reply.view("account", {user: req.auth.credentials, approvedList: deAzurifier(approvedList)});
		});
	},

	admin: function(req, reply) {
		"use strict";
		var self = this;

		var page = req.params.page;

		if(!req.auth.credentials.admin) return reply.redirect("/account");
		if(page === "reports") {
				return reply.view("adminReport");
		} else {
			self.account.getAccounts(function(err, accounts) {
				if(err) return reply(err);
				else 		return reply.view("admin", {accounts: accounts});
			});
		}
	},

// API
// Accounts
	getAccounts: function(req, reply) {
		"use strict";
		var self = this;

		if(!req.auth.credentials.admin) return reply("You're not authorised to do that").code(403);
		var csv = req.query.csv;

		self.account.getAccounts(function(err, accounts) {
			if(err) 			return reply(err);
			else if(csv) 	return reply(Baby.unparse(accounts)).type("text/csv");
			else 					return reply(accounts);
		});
	},

	createSingleAccount: function(req, reply) {
		"use strict";
		var self = this;

		if(!req.auth.credentials.admin) return reply("You're not authorised to do that");

		// Use JOI for validation
		self.account.hashPassword(req.payload.password, function(err, hash) {
			if(err) return reply("error hashing password");

			var newAccount = {
				customid : req.payload.customid,
				password : hash,
				email 	 : req.payload.email,
				phone 	 : req.payload.phone,
				admin 	 : false
			};

			var mailAccount = {
				subscribed: true,
				address 	: req.payload.email,
				name 			: req.payload.customid,
				vars 			: {}
			};

			self.account.createSingleAccount(newAccount, function(err) {
				if(err) return reply(err.statusCode + ": " + err.code);
				else {
					self.messages.addToMailingList(mailAccount, function(error) {
						if(err) console.log("list error: ", error);
					});
					self.messages.sendEmail("approve", newAccount, function(error) {
						if(err) console.log("list error: ", error);
						return reply("Account successfully created, a confirmation email has been sent to you");
					});
				}
			});
		});
	},

	getSingleAccount: function(req, reply) {
		"use strict";
		var self = this;

		var email = req.params.email,
				csv   = req.query.csv;

		if(!req.auth.credentials.admin && req.params.email !== req.auth.credentials.email) {
			return reply("You're not authorised to do that");
		}

		self.account.getSingleAccount(email, function(err, account) {
			if(err) 			return reply(err).code(404);
			else if(csv) 	return reply(Baby.unparse(deAzurifier(account, false))).type("text/csv");
			else 					return reply(deAzurifier(account, false));
		});
	},

// Reports
	// This one needs some tidying up am i right yes i am
	getReport: function(req, reply) {
		"use strict";
		var self = this;

		var creds 			= req.auth.credentials,
				YYYY_MM 		= req.params.YYYY_MM,
				customid 		= (req.query.customid === "true") ? true : (req.query.customid === "false") ? false : req.query.customid,
				csv 			 	= req.query.csv,
				approveBool = (req.query.approved === "true") ? true : (req.query.approved === "false") ? false : null,
				getAll 			= req.query.getAll;

		if(customid && customid !== true) {
			if(!creds.admin && customid !== creds.customid) {
				return reply().code(403);
			} else {
				self.approvedList.getApproved(customid, function(err, approvedEntity) {

					if(!creds.admin && !approvedEntity["_" + YYYY_MM]) {

						return reply("That report is not available to you yet");
					} else {

						self.report.getReport(YYYY_MM, customid, approveBool, true, function(err, reportResults) {
							if(err) return reply(err);
							return deAzurifier(reportResults, false, function(err, formattedArray) {
								if(csv) return reply(Baby.unparse(formattedArray))
																	.type("text/csv")
																	.header("Content-Disposition", "attachment; filename="+ YYYY_MM + "_" + customid + ".csv");
								else 		return reply(formattedArray);
							});

						});
					}
				});
			}
		} else {

			if(!creds.admin) return reply().code(403);
			else if(!req.query.nextRowKey) {
				self.report.getReport(YYYY_MM, customid, approveBool, getAll, function(errGet, totalResults, contToken) {
					if(errGet) return reply(errGet);

					return deAzurifier(totalResults, true, function(errAzure, formattedArray) {
						if(errAzure) 			return reply(errAzure);
						else if(csv) 	return reply(Baby.unparse(formattedArray))
																		.type("text/csv")
																		.header("Content-Disposition", "attachment; filename='"+  PKey + "'.csv");
						else 					return reply({results: formattedArray, token: contToken});
					});
				});
			} else {
				var queryOpts = {
					YYYY_MM : YYYY_MM,
					customid: customid,
					approved: approveBool
				};

				var token = {
					nextPartitionKey: req.query.nextPartitionKey,
					nextRowKey 			: req.query.nextRowKey,
					targetLocation 	: req.query.targetLocation
				};

				self.report.getNextBatch(queryOpts, token, null, getAll, function(errGet, results, contToken) {
					if(errGet) 		return reply(errGet);

					return deAzurifier(results, true, function(errAzure, formattedArray) {
						if(errAzure)	return console.log(errAzure);
						else 					return reply({results: formattedArray, token: contToken});
					});
				});


			}
		}
	},

	createReport: function(req, reply) {
		"use strict";
		var self = this;

		var uploadInfo = req.payload['upload-report'].hapi;

		if(!req.auth.credentials.admin) return reply("You're not authorised to do that");
		if(uploadInfo.headers["content-type"] !== "text/csv") return reply("Not a csv");
	  reply("Your report is being processed");

		var date = uploadInfo.filename.match(/_([\d]{8})_/i)[1];

		var YYYY_MM = date.slice(0, 4) + "_" + date.slice(4, 6);
		var uploadStream = req.payload["upload-report"];

		var body = '';

	  uploadStream.on('data', function (chunk) {
	    body += chunk;
	  });

	  uploadStream.on('end', function () {
	    var data = body;
	    self.report.createReport(YYYY_MM, data, function(err, alert) {
	    	return console.log(alert);
	    });
		});
	},


	updateReportRow: function(req, reply) {
		"use strict";
		var self = this;

		if(!req.auth.credentials.admin) return reply("You're not authorised to do that");

		var PKey 		  = req.params.YYYY_MM,
				RKey		 	= req.params.videoid_policy;

		self.report.updateReportRow(PKey, RKey, req.payload, function(err) {
			if(err) return reply(err);
			else 		return reply(null);
		});
	},

	getReportList: function(req, reply) {
		"use strict";
		var self = this;

		if(!req.auth.credentials.admin) return reply("You're not authorised to do that");

		self.report.getReportList(function(err, list) {
			if(err) return reply(err);
			else  	return reply(deAzurifier(list));
		});
	},

	getCustomIDList: function(req, reply) {
		"use strict";
		var self = this;

		if(!req.auth.credentials.admin) return reply("You're not authorised to do that");

		var date = req.query.date;

		self.report.getCustomIDList(date, function(err, idListObj) {
			if(err) return reply(err);
			else  	deAzurifier(idListObj, false, function(err, formattedObj) {
				if(err) console.log(err);
				return 	reply(formattedObj);
			});
		});
	},

// Approved
	getApproved: function(req, reply) {
		"use strict";
		var self = this;

		var customid = req.params.customid,
				YYYY_MM  = req.params[YYYY_MM];

		if(!req.auth.credentials.admin && customid !== req.auth.credentials.customid) {
			return reply("You're not authorised to do that");
		} else {
			self.approved.getApproved(customid, YYYY_MM, function(err, approvedList) {
				if(err) return reply(err);
				else 		return reply(approvedList);
			});
		}
	},

	// Use payload rather than params
	updateApproved: function(req, reply) {
		"use strict";
		var self = this;

		var customid = req.params.customid,
				YYYY_MM  = req.payload.YYYY_MM;

		if(!req.auth.credentials.admin) {
			return reply("You're not authorised to do that");
		} else {
			self.report.approveAllOfCustomID(YYYY_MM, customid, function(err) {
				if(err) {
					return reply("There was an error approving" + err);
			 	} else {
			 		self.approvedList.updateApproved(customid, YYYY_MM, function(err) {
						if(err) return reply().code(500);
						else 		return reply("Successfully approved the " + YYYY_MM + " report for " + customid);
					});
				}
			});
		}
	}

};

module.exports = Controller;
