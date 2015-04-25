function router(ctrlr) {
	"use strict";

	var tryButDontRedirectMePleaseConfig = {
		auth: {
			mode: "try",
			strategy: "session"
		},
		plugins: {
			"hapi-auth-cookie": {
				redirectTo: false
			}
		}
	};

	var csvConfig = {
		payload: {
			maxBytes: 100000000,
			output:'stream',
			parse: true
		}
	};

	return [
		// Static file route
		{ path: '/{param*}', 																		method: 'GET', 						handler: ctrlr.statics,							   				config: tryButDontRedirectMePleaseConfig 	},

		// Typical routes
		{ path: "/", 																						method: "GET", 						handler: ctrlr.home.bind(ctrlr), 							config: tryButDontRedirectMePleaseConfig	},
		{ path: "/login", 																			method: ["GET", "POST"], 	handler: ctrlr.login.bind(ctrlr), 						config: tryButDontRedirectMePleaseConfig 	},
		{ path: "/logout", 																			method: "GET", 						handler: ctrlr.logout.bind(ctrlr) 																											},

		{ path: "/account", 																		method: "GET", 						handler: ctrlr.myAccount.bind(ctrlr) 																										},
		{ path: "/admin/{page?}", 															method: "GET", 						handler: ctrlr.admin.bind(ctrlr) 																												},

		// api
		// accounts
		{ path: "/api/v1/accounts", 														method: "GET", 						handler: ctrlr.getAccounts.bind(ctrlr) 																									},
		{ path: "/api/v1/accounts", 														method: "POST", 					handler: ctrlr.createSingleAccount.bind(ctrlr) 																					},
		{ path: "/api/v1/accounts/{email}", 										method: "GET", 						handler: ctrlr.getSingleAccount.bind(ctrlr) 																						},
		{ path: "/api/v1/accounts/{email}",											method: "PUT", 						handler: ctrlr.updateSingleAccount.bind(ctrlr) 																					},
		{ path: "/api/v1/accounts/{email}",											method: "DELETE", 				handler: ctrlr.deleteSingleAccount.bind(ctrlr) 																					},
		// reports
		{ path: "/api/v1/reports", 															method: "GET",  					handler: ctrlr.getReportList.bind(ctrlr) 																								},
		{ path: "/api/v1/reports", 															method: "POST", 					handler: ctrlr.createReport.bind(ctrlr),			config: csvConfig 							 					},
		{ path: "/api/v1/reports/{YYYY_MM}", 										method: "GET",  					handler: ctrlr.getReport.bind(ctrlr) 																										},
		{ path: "/api/v1/reports/{YYYY_MM}/{videoid_policy}", 	method: "PUT",  					handler: ctrlr.updateReportRow.bind(ctrlr)		 																					},
		{ path: "/api/v1/reports/customidlist", 								method: "GET",  					handler: ctrlr.getCustomIDList.bind(ctrlr) 																							},

		// approved
		{ path: "/api/v1/approvedlist/{customid}/{YYYY_MM?}",		method: "GET",  					handler: ctrlr.getApproved.bind(ctrlr) 																									},
		{ path: "/api/v1/approvedlist/{customid}",							method: "PUT",	 					handler: ctrlr.updateApproved.bind(ctrlr) 																							}

	];
}

module.exports = router;
