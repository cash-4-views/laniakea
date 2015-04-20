var Hapi 				 = require('hapi'),
		fs 					 = require("fs"),
		Path 				 = require('path'),
		Baby 				 = require("babyparse"),
		bcrypt 			 = require("bcrypt-nodejs"),
		azure 			 = require("azure-storage"),
		Account 		 = require("./models/Account"),
		Report 			 = require("./models/Report"),
		ApprovedList = require("./models/ApprovedList"),
		deAzurifier  = require("./utils/deAzurifier"),
		config 			 = require("./config");

var tableSvc = azure.createTableService(config.database.dbacc, config.database.dbkey),
		account  = new Account(tableSvc, config.database.atable),
		approved = new ApprovedList(tableSvc, config.database.atable),
		report   = new Report(tableSvc, config.database.rtable),
		server   = new Hapi.Server();

server.connection({
	port: process.env.PORT || 8000
});

server.register(require("hapi-auth-cookie"), function(err) {
	"use strict";

	server.auth.strategy("session", "cookie", {
		password: config.cookie.password,
		cookie: "cookie_off_the_old_block",
		redirectTo: "/",
		isSecure: false
	});

	server.auth.default("session");
});

server.views({

	engines: {
		jade: require("jade")
	},
	compileOptions: {
		pretty: true
	},
	relativeTo: __dirname,
	path: 		  "./views",
	isCached: false

});

var homeHandler = function(req, reply) {
	"use strict";

	if(req.auth.isAuthenticated && req.auth.credentials.admin) return reply.redirect("/admin");
	else if(req.auth.isAuthenticated) return reply.redirect("/account");
	else return reply.view("login");
};

var loginHandler = function(req, reply) {
	"use strict";

	var deets = req.payload;
	if(!deets.password || !deets.email) return reply("Missing email or password");

	var opts = {
		url: "/api/v1/accounts/" + deets.email,
		method: "GET",
		credentials: {
			email: deets.email
		}
	};

	server.inject(opts, function(res) {
		if(res.statusCode === 404) {
			return reply("Error with logging in pal: that account doesn't exist.");
		} else {
			var returnedAccount = res.result;
			bcrypt.compare(deets.password, returnedAccount.password, function(err, res) {
				if(err) {
					console.log(err);
					return reply("Whoops error");
				} else if (!res) return reply("Dodgy password pal");
				else {

					var profile = {
						email: returnedAccount.email,
						customid: returnedAccount.customid
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
				}
			});
		}
	});
};

var logoutHandler = function(req, reply) {
	"use strict";

	req.auth.session.clear();
	return reply.redirect('/');
};

var accountHandler = function(req, reply) {
	"use strict";

	if(req.auth.credentials.admin) return reply.redirect("/admin");

	var customid = req.auth.credentials.customid;

	var opts = {
		url: "/api/v1/approvedlist/" + customid,
		method: "GET",
		credentials: {
			admin: true
		}
	};

	server.inject(opts, function(res) {
		return reply.view("account", {user: req.auth.credentials, approvedlist: res.result});
	});
};

var accountReportHandler = function(req, reply) {
	"use strict";

	var partitionKey = req.params.YYYY_MM,
			customid = req.auth.credentials.customid;

	var opts = {
		url: "/api/v1/reports/" + partitionKey + "/" + customid + "?approved=true&csv=" + req.query.csv,
		method: "GET",
		credentials: {
			customid: customid
		}
	};

	server.inject(opts, function(res) {
		reply(res.result);
	});

};

var adminHandler = function(req, reply) {
	"use strict";

	if(!req.auth.credentials.admin) return reply.redirect("/account");
	else {
		var opts = {
			url: "/api/v1/accounts",
			method: "GET",
			credentials: {
				admin: true
			}
		};
		server.inject(opts, function(res) {
			reply.view("admin2", {accounts: res.result});
		});
	}

};

var adminReportHandler = function(req, reply) {
	"use strict";

	if(!req.auth.credentials.admin) return reply.redirect("/account");
	else {
		var opts = {
			url: "/api/v1/reports/2015_01",
			method: "GET",
			credentials: {
				admin: true
			}
		};

		if(req.query.approved) opts.url += "?approved=true";

		server.inject(opts, function(res) {
			reports.getCustomIDList("y2015_01", function(err, badObj) {
				if(err) return reply(err);
				deAzurifier(badObj, function(err, niceObj) {
					reply.view("adminReport", {report: res.result, customidlist: niceObj});
				});
			});
		});
	}

};

// API - Accounts
var getAccounts = function(req, reply) {
	"use strict";

	if(!req.auth.credentials.admin) return reply("You're not authorised to do that");

	account.getAccounts(function(err, accounts) {
		if(err) return reply(err);
		else return reply(accounts);
	});
};

var createSingleAccount = function(req, reply) {
	"use strict";

	if(!req.auth.credentials.admin) return reply("You're not authorised to do that");

	// Use JOI for validation
	bcrypt.hash(req.payload.password, null, null, function(err, hash) {
		if(err) return reply("error hashing password, ", hash);

		var newAccount = {
			customid : req.payload.customid,
			password : hash,
			email 	 : req.payload.email,
			phone 	 : req.payload.phone,
			admin 	 : false
		};

		account.createSingleAccount(newAccount, function(err) {
			if(err) return reply(err.statusCode + ": " + err.code);
			else return reply("Account successfully created");
		});
	});
};

var getSingleAccount = function(req, reply) {
	"use strict";

	var email = req.params.email;
	if(!req.auth.credentials.admin && req.params.email !== req.auth.credentials.email) {
		return reply("You're not authorised to do that");
	}

	account.getSingleAccount(email, function(err, account) {
		if(err) {
			return reply().code(404);
		}
		return reply(account);
	});
};


// API - Reports
var createSingleReport = function(req, reply) {
	"use strict";

	console.log("report request received");
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
    report.createBatchedReport(YYYY_MM, data, function(err, alert) {
    	return console.log(alert);
    });
	});
};

var getSingleReport = function(req, reply) {
	"use strict";

	var PKey 		 		= req.params.YYYY_MM,
			customid 		= req.params.customid,
			csv 			 	= req.query.csv,
			approveBool = (req.query.approved === "true") ? true : (req.query.approved === "false") ? false : null;

	// If customid is falsy
	if(!customid) {
		if(!req.auth.credentials.admin)return reply("You're not authorised to do that");
		else {
			// It may be that the user wants items regardless of custom id, or with no custom id
			customid = (customid === undefined) ? null : false;
				report.getSingleReport(PKey, customid, approveBool, function(err, totalResults) {
				if(err) return reply(err);
				return deAzurifier(totalResults, function(err, formattedArray) {
					if(csv) {
						reply(Baby.unparse(formattedArray)).type("text/csv");
					} else reply(formattedArray);
				});
			});
		}

	} else if(!req.auth.credentials.admin && customid !== req.auth.credentials.customid) {
		return reply("That is not your report to take");
	} else {
		approved.getApproved(customid, PKey, function(err, approvedArray) {
			if(approvedArray.length !== 1 && !req.auth.credentials.admin) {
				return reply("That report is not available yet");
			} else {
				report.getSingleReport(PKey, customid, true, function(err, totalResults) {
					if(err) return reply(err);
					return deAzurifier(totalResults, function(err, formattedArray) {
						if(csv) {
							reply(Baby.unparse(formattedArray)).type("text/csv");
						} else reply(formattedArray);
					});
				});
			}
		});

	}
};

var updateSingleReport = function(req, reply) {
	"use strict";

	if(!req.auth.credentials.admin) return reply("You're not authorised to do that");

	var PKey 		  = req.params.YYYY_MM,
			updateObj = {},
			fieldToUpdate;

	for(fieldToUpdate in req.payload) {
		updateObj[fieldToUpdate] = req.payload[fieldToUpdate];
	}

	report.updateSingleReportRow(PKey, req.params.videoid, updateObj, function(err) {
		if(err) return reply(err);
		else return reply(null);
	});
};

// API - Approved
var getApproved = function(req, reply) {
	"use strict";

	var customid = req.params.customid,
			YYYY_MM  = req.params[YYYY_MM];

	if(!req.auth.credentials.admin && customid !== req.auth.credentials.customid) {
		return reply("You're not authorised to do that");
	} else {
		approved.getApproved(customid, YYYY_MM, function(err, approvedList) {
			if(err) return reply(err);
			else return reply(approvedList);
		});
	}
};

var updateApproved = function(req, reply) {
	"use strict";

	var customid = req.params.customid,
			YYYY_MM  = req.params[YYYY_MM];

	if(!req.auth.credentials.admin) {
		return reply("You're not authorised to do that");
	} else {
		report.approveAllOfCustomID(YYYY_MM, customid, function(err) {
			if(err) return reply("There was an error approving" + err);
		 	else {
		 		approved.updateApproved(customid, YYYY_MM, function(err) {
				if(err) return reply(err);
				else return reply("successfully approved");
				});
			}
		});
	}
};

server.route([

	{
		path: '/{param*}',
		method: 'GET',
		handler: {
      directory: {
        path: Path.resolve(__dirname + '/../public'),
    		index: true
      }
		},
		config: {
			auth: {
				mode: "try",
				strategy: "session"
			},
			plugins: {
				"hapi-auth-cookie": {
					redirectTo: false
				}
			}
		}
	},

	{
		path: "/",
		method: "GET",
		config: {
			handler: homeHandler,
			auth: {
				mode: "try",
				strategy: "session"
			},
			plugins: {
				"hapi-auth-cookie": {
					redirectTo: false
				}
			}
		}
	},

	{
		path: "/login",
		method: "POST",
		config: {
			handler: loginHandler,
			auth: {
				mode: "try",
				strategy: "session"
			},
			plugins: {
				"hapi-auth-cookie": {
					redirectTo: false
				}
			}
		}
	},

	{
		path: "/logout",
		method: "GET",
		config: {
			handler: logoutHandler
		}
	},


	{
		path: "/account",
		method: "GET",
		config: {
			handler: accountHandler
		}
	},

	{
		path: "/admin",
		method: "GET",
		config: {
			handler: adminHandler
		}
	},

	{
		path: "/admin/reports",
		method: "GET",
		config: {
			handler: adminReportHandler
		}
	},

	{
		path: "/getCSV/{YYYY_MM}",
		method: "GET",
		config: {
			handler: accountReportHandler
		}
	},
	// barebones api for our eyes only ;)
	// accounts
	{
		path: "/api/v1/accounts",
		method: "GET",
		config: {
			handler: getAccounts,
		}
	},

	{
		path: "/api/v1/accounts",
		method: "POST",
		config: {
			handler: createSingleAccount
		}
	},

	{
		path: "/api/v1/accounts/{email}",
		method: "GET",
		config: {
			handler: getSingleAccount
		}
	},
	// reports
	{
		path: "/api/v1/reports",
		method: "POST",
		config: {
			handler: createSingleReport,
			payload:{
        maxBytes: 100000000,
        output:'stream',
        parse: true
      }
		}
	},

	{
		path: "/api/v1/reports/{YYYY_MM}/{customid?}",
		method: "GET",
		config: {
			handler: getSingleReport
		}
	},

	{
		path: "/api/v1/reports/{YYYY_MM}/{videoid}",
		method: "PUT",
		config: {
			handler: updateSingleReport
		}
	},
	// approved
	{
		path: "/api/v1/approvedlist/{customid}/{YYYY_MM?}",
		method: "GET",
		config: {
			handler: getApproved
		}
	},

	{
		path: "/api/v1/approvedlist/{customid}/{YYYY_MM}",
		method: "POST",
		config: {
			handler: updateApproved
		}
	}

]);

 module.exports = server;
