"use strict";

var fs 					 = require("fs"),
		Path 				 = require('path'),
		Baby 				 = require("babyparse"),
		deAzurifier  = require("../utils/deAzurifier");

function Controller(models, toolbox) {

	this.account 			= models.account;
	this.approvedList = models.approvedList;
	this.report 			= models.report;
	this.messages 		= toolbox.messages;
}

Controller.prototype = {

	statics: {
		directory: {
			path: Path.resolve(__dirname + '/../../public'),
		}
	},

	home: function(req, reply) {
		return reply.redirect("/login");
	},

	login: function(req, reply) {
		var self = this;

		if(req.method.toUpperCase() === "GET") {
			var isAuth 	= req.auth.isAuthenticated,
					isAdmin = req.auth.credentials && req.auth.credentials.admin;

			if(isAuth && isAdmin) return reply.redirect("/admin");
			else if(isAuth)  			return reply.redirect("/account");
			else 									return reply.view("login", {alert: req.query.badlogin});
		}

		var deets = req.payload;
		if(!deets.password || !deets.email) return reply.redirect("/login?badlogin=missing");

		self.account.getSingleAccount(deets.email, function(err, returnedAccount) {
			if(err === 404) return reply.redirect("/login?badlogin=email");
			else if(err) 		return reply(err);

			var acc = deAzurifier(returnedAccount);

			self.account.comparePassword(deets.password, acc.password, function(err) {
				if(err === 400) return reply.redirect("/login?badlogin=password");
				else if(err) 		return reply(err);

				var profile = {
					email 	: acc.email,
					customid: acc.customid
				};

				req.auth.session.clear();

				if(acc.admin === "true") {
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
		req.auth.session.clear();
		return reply.redirect('/');
	},

	myAccount: function(req, reply) {
		var self = this,
				isAdmin  = req.auth.credentials && req.auth.credentials.admin;

		if(isAdmin) return reply.redirect("/admin");

		var customid = req.auth.credentials.customid;

		self.approvedList.getApproved(customid, null, function(err, approvedList) {
			if(err) return reply(err);
			else 		return reply.view("account", {user: req.auth.credentials, approvedList: deAzurifier(approvedList)});
		});
	},

	admin: function(req, reply) {
		var isAdmin = req.auth.credentials && req.auth.credentials.admin;

		if(!isAdmin) return reply.redirect("/account");
		else 			 	 return reply.view("admin");
	},

// API
// Accounts
	getAccounts: function(req, reply) {
		var self = this,
				isAdmin = req.auth.credentials && req.auth.credentials.admin;

		if(!isAdmin) return reply("You're not authorised to do that").code(403);

		var csv = req.query.csv;

		self.account.getAccounts(function(err, accounts) {
			if(err) 			return reply(err);
			else if(csv) 	return reply(Baby.unparse(accounts)).type("text/csv");
			else 					return reply(accounts);
		});
	},

	createSingleAccount: function(req, reply) {
		var self = this,
				isAdmin = req.auth.credentials && req.auth.credentials.admin,

				submitted = req.payload;

		if(!isAdmin) return reply("You're not authorised to do that").code(403);

		self.account.hashPassword(submitted.password, function(err, hash) {
			if(err) return reply("error hashing password");

			var newAccount = {
				customid : submitted.customid,
				password : hash,
				email 	 : submitted.email,
				admin 	 : false
			};

			if(submitted.phone) newAccount.phone = submitted.phone;

			var mailAccount = {
				subscribed: true,
				address 	: submitted.email,
				name 			: submitted.customid,
			};

			self.account.createSingleAccount(newAccount, function(createAccountError) {
				if(createAccountError) return reply(createAccountError.statusCode + ": " + createAccountError.code);
				else {

					self.messages.addToMailingList(mailAccount, function(mailListError) {
						if(mailListError) console.log("list error: ", mailListError);
					});

					self.messages.sendEmail("approve", newAccount.email, newAccount.customid, function(sendEmailError) {
						if(sendEmailError) console.log("list error: ", sendEmailError);
						return reply().code(200);
					});
				}
			});
		});
	},

	getSingleAccount: function(req, reply) {
		var self = this,

				email = req.params.email,
				csv   = req.query.csv,

				isAdmin = req.auth.credentials && req.auth.credentials.admin,
				isOwn 	= email === req.auth.credentials.email;

		if(!isAdmin && !isOwn) return reply("You're not authorised to do that").code(403);

		self.account.getSingleAccount(email, function(err, account) {
			if(err) 			return reply(err).code(404);
			else if(csv) 	return reply(Baby.unparse(deAzurifier(account, false))).type("text/csv");
			else 					return reply(deAzurifier(account, false));
		});
	},

	updateSingleAccount: function(req, reply) {
		var self = this,

		 		email 		= req.params.email,
				updateObj = req.payload,

				isAdmin = req.auth.credentials && req.auth.credentials.admin,
				isOwn 	= email === req.auth.credentials.email;

		if(!isAdmin && !isOwn) return reply("You're not authorised to do that").code(403);

		if(!req.auth.credentials.admin && req.params.email !== req.auth.credentials.email) {
			return reply("You're not authorised to do that").code(403);
		}

		self.account.updateSingleAccount(email, updateObj, function(err, updatedAccount, oldAccountEmail) {
			if(err) 	return reply(err).code(404);
			else  {
				var updateMailObj = {};

				updateMailObj.subscribed = "true";
				if(updateObj.email) updateMailObj.address = req.payload.email;
				if(updateObj.customid) updateMailObj.name = req.payload.customid;

				self.messages.updateMailingListAccount(oldAccountEmail, updateMailObj, function(err, res) {
					if(err) return reply(err);
					else 		return reply().code(204);
				});
			}
		});
	},

	deleteSingleAccount: function(req, reply) {
		var self = this,

				RowKey = req.params.email,

				isAdmin = req.auth.credentials && req.auth.credentials.admin;

		if(!isAdmin) return reply("You're not authorised to do that").code(403);

		self.account.deleteSingleAccount(RowKey, function(err, deletedAccount, accountEmail) {
			if(err) 	return reply(err).code(404);
			else  {
				self.messages.deleteFromMailingList(accountEmail, function(err, res) {
					if(err) return reply(err);
					else 		return reply().code(204);
				});
			}
		});
	},

// Reports

	/*
	*	If a customid is included as part of the query, it can be:
	*		true 	 		: request for any report row with customid 								(admin)
	*		false  	  : request for any report row without a customid 					(admin)
	*		{other}   : request for any report row with the specified customid 	(admin, approved for user)
	*/

	// This one needs some tidying up am i right yes i am
	getReport: function(req, reply) {
		var self = this,

				YYYY_MM 		= req.params.YYYY_MM,
				customid 		= (req.query.customid === "true") ? true : (req.query.customid === "false") ? false : req.query.customid,
				csv 			 	= req.query.csv,
				approved 		= (req.query.approved === "true") ? true : (req.query.approved === "false") ? false : null,
				getAll 			= req.query.getAll,

				isAdmin = req.auth.credentials && req.auth.credentials.admin,
				isOwn 	= customid === req.auth.credentials.customid;

		if(!isAdmin && !isOwn) return reply("You're not authorised to do that").code(403);

		if(customid && customid !== true) {
			self.approvedList.getApproved(customid, YYYY_MM, function(err, approvedEntity) {
				if(!isAdmin && !approvedEntity.length) return reply("That report is not available to you yet");
				else {

					var filename = "YoutubeRevenueReport_" + YYYY_MM.slice(0, 4) + YYYY_MM.slice(5) + "01_" + customid;
					// if(!isAdmin) approved = true;
					self.report.getReport(YYYY_MM, customid, approved, true, function(err, reportResults) {
						if(err) return reply(err);

						return deAzurifier(reportResults, false, function(err, formattedArray) {
							if(csv) return reply(Baby.unparse(formattedArray))
																.type("text/csv")
																.header("Content-Disposition", "attachment; filename="+ filename + ".csv");
							else 		return reply(formattedArray);
						});

					});
				}
			});
		} else {

			if(!isAdmin) return reply().code(403);
			else if(!req.query.nextRowKey) {
				self.report.getReport(YYYY_MM, customid, approved, getAll, function(errGet, totalResults, contToken) {
					if(errGet) return reply(errGet);

					return deAzurifier(totalResults, true, function(errAzure, formattedArray) {
						if(errAzure) 	return reply(errAzure);
						else if(csv) 	return reply(Baby.unparse(formattedArray))
																		.type("text/csv")
																		.header("Content-Disposition", "attachment; filename="+
																							"YoutubeRevenueReport_" + YYYY_MM.slice(0, 4) +
																							YYYY_MM.slice(5) + "01_.csv");
						else 					return reply({results: formattedArray, token: contToken});
					});
				});
			} else {
				var queryOpts = {
					YYYY_MM : YYYY_MM,
					customid: customid,
					approved: approved
				};

				var token = {
					nextPartitionKey: req.query.nextPartitionKey,
					nextRowKey 			: req.query.nextRowKey,
					targetLocation 	: +req.query.targetLocation
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
		var self = this,

				isAdmin = req.auth.credentials && req.auth.credentials.admin;

		if(!isAdmin)  return reply("You're not authorised to do that").code(403);
		if(!req.payload["upload-report"]) return reply("No file sent").code(400);

		var uploadInfo = req.payload['upload-report'].hapi;

		if(uploadInfo.headers["content-type"] !== "text/csv") return reply("Not a csv");

		var date = uploadInfo.filename.match(/_([\d]{8})_/i)[1];

		var YYYY_MM = date.slice(0, 4) + "_" + date.slice(4, 6);
		var uploadStream = req.payload["upload-report"];

		var body = '';

	  uploadStream.on('data', function (chunk) {
	    body += chunk;
	  });

	  uploadStream.on('end', function () {
	    var data = body;
	    self.report.createReport(YYYY_MM, data, function(err, msETA) {
	    	if(err) 							return reply(err);
	    	else if(msETA===true) return reply("Your report has been uploaded");
	    	else									return reply("Your report is being processed. It should be fully uploaded in approximately " +
	    																				(Math.ceil(msETA/1000/60)) + " minutes.");
	    });
		});
	},


	updateReportRow: function(req, reply) {
		var self = this,

				isAdmin = req.auth.credentials && req.auth.credentials.admin;

		if(!isAdmin) return reply("You're not authorised to do that").code(403);

		var PKey 		  = req.params.YYYY_MM,
				RKey		 	= req.params.videoid_policy;

		self.report.updateReportRow(PKey, RKey, req.payload, function(err) {
			if(err) 												return reply(err);
			else if(!req.payload.Custom_ID)	return reply(null);
			else {
				self.report.updateCustomIDList(PKey, req.payload.Custom_ID, function(errID) {
					if(errID) return reply(errID);
					else 			return reply(null);
				});
			}
		});
	},

	getReportList: function(req, reply) {
		var self = this,

				isAdmin = req.auth.credentials && req.auth.credentials.admin;

		if(!isAdmin) return reply("You're not authorised to do that").code(403);

		self.report.getReportList(function(err, list) {
			if(err) return reply(err);
			else  	return reply(deAzurifier(list));
		});

	},

	getCustomIDList: function(req, reply) {
		var self = this,

				isAdmin = req.auth.credentials && req.auth.credentials.admin;

		if(!isAdmin) return reply("You're not authorised to do that").code(403);

		var date = req.query.date;

		self.report.getCustomIDList(date, function(err, idListArray) {
			if(err) return reply(err);
			else {
				var uniqueIDObj = {};

				idListArray.forEach(function(year) {
					var id;

					for(id in year) {
						if(year.hasOwnProperty(id)) {
	 						uniqueIDObj[id] = year[id];
						}
					}
				});

				deAzurifier(uniqueIDObj, false, function(err, formattedObj) {
					if(err) console.log(err);
					return 	reply(formattedObj);
				});
			}
		});

	},

// Approved
	getApproved: function(req, reply) {
		var self = this,

				customid = req.params.customid,
				YYYY_MM  = req.params.YYYY_MM,

				isAdmin = req.auth.credentials && req.auth.credentials.admin,
				isOwn 	= customid === req.auth.credentials.customid;

		if(!isAdmin && !isOwn) return reply("You're not authorised to do that").code(403);

		self.approvedList.getApproved(customid, YYYY_MM, function(err, approvedEntity) {
			if(err) return reply(err);
			else 		return reply(approvedEntity);
		});
	},

	updateApproved: function(req, reply) {
		var self = this,

				customid = req.params.customid,
				YYYY_MM  = req.payload.YYYY_MM,

				isAdmin = req.auth.credentials && req.auth.credentials.admin;

		if(!isAdmin) return reply("You're not authorised to do that").code(403);

		self.report.approveAllOfCustomID(YYYY_MM, customid, function(errApprove) {
			if(errApprove) {
				return reply("There was an error approving").code(500);
		 	} else {
		 		self.approvedList.updateApproved(customid, YYYY_MM, function(errUpdate) {
					if(errUpdate) return reply().code(500);
					else self.messages.sendEmail("notify", null, customid, function(errSend) {
						if(errSend) return reply("No emails sent").code(200);
						return reply().code(200);
					});
				});
			}
		});
	}

};


module.exports = Controller;
