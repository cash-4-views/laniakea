var ctrlr = require("../controllers/controller");

var authTry = {
	mode: "try",
	strategy: "session"
};

var noRedirect = {
	"hapi-auth-cookie": {
		redirectTo: false
	}
};

var csvPayload = {
	maxBytes: 100000000,
	output:'stream',
	parse: true
};

module.exports = [
	// Static file route
	{ path: '/{param*}', 																		method: 'GET', 						handler: ctrlr.statics,   				config: { auth: authTry, plugins: noRedirect } 	},

	{ path: "/", 																						method: "GET", 						handler: ctrlr.home, 							config: { auth: authTry, plugins: noRedirect } 	},
	{ path: "/login", 																			method: ["GET", "POST"], 	handler: ctrlr.login, 						config: { auth: authTry, plugins: noRedirect } 	},
	{ path: "/logout", 																			method: "GET", 						handler: ctrlr.logout 																														},

	{ path: "/account", 																		method: "GET", 						handler: ctrlr.account 																														},
	{ path: "/admin", 																			method: "GET", 						handler: ctrlr.admin 																															},

	// api
	// accounts
	{ path: "/api/v1/accounts", 														method: "GET", 						handler: ctrlr.getAccounts 																												},
	{ path: "/api/v1/accounts", 														method: "POST", 					handler: ctrlr.createSingleAccount 																								},
	{ path: "/api/v1/accounts/{email}", 										method: "GET", 						handler: ctrlr.getSingleAccount 																									},
	// reports
	{ path: "/api/v1/reports", 															method: "POST", 					handler: ctrlr.createReport,			config: { payload: csvPayload } 								},
	{ path: "/api/v1/reports/{YYYY_MM}/{customid?}", 				method: "GET",  					handler: ctrlr.getReport 																													},
	{ path: "/api/v1/reports/{YYYY_MM}/{videoid_policy}", 	method: "PUT",  					handler: ctrlr.updateReportRow		 																								},
	// approved
	{ path: "/api/v1/approvedlist/{customid}/{YYYY_MM?}",		method: "GET",  					handler: ctrlr.getApproved 																												},
	{ path: "/api/v1/approvedlist/{customid}/{YYYY_MM}",		method: "POST", 					handler: ctrlr.updateApproved 																										}

];
