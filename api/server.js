var Hapi 				 = require('hapi'),
		config 			 = require("./config"),
		router 			 = require("./router/router"),
		Controller 	 = require("./controller/controller"),
		Account 		 = require("./models/Account"),
		Report 			 = require("./models/Report"),
		ApprovedList = require("./models/ApprovedList");

var tableSvc 		 = require("azure-storage").createTableService(config.database.dbacc, config.database.dbkey);

var models = {
	account  		 : new Account(tableSvc, config.database.atable),
	approvedList : new ApprovedList(tableSvc, config.database.atable),
	report   		 : new Report(tableSvc, config.database.rtable)
};

var ctrlr  = new Controller(models),
		server = new Hapi.Server();


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

server.route(router(ctrlr));

module.exports = server;
