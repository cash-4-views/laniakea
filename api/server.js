var Hapi 				 = require('hapi'),
		fs 					 = require("fs"),
		Path 				 = require('path'),
		bcrypt 			 = require("bcrypt-nodejs"),
		config 			 = require("./config"),
		csvParser 	 = require('./utils/csvParser'),
		csvConverter = require("./utils/jsonToCSV");

var server = new Hapi.Server();

server.connection({
	port: process.env.PORT || 8000
});

server.register(require("hapi-auth-cookie"), function(err) {

	server.auth.strategy("session", "cookie", {
		password: config.cookie.password,
		cookie: "cookie_off_the_old_block",
		redirectTo: "/",
		isSecure: false
	});

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


var accounts = {
	jim: {
		username: "jim",
		password: "whim",
		admin: true
	},
	tim: {
		username: "tim",
		password: "slim"
	}
};

var home = function(req, reply) {
	if(req.auth.isAuthenticated && req.auth.credentials.admin) return reply.redirect("/admin");
	else if(req.auth.isAuthenticated) return reply.redirect("/account");
	else return reply.view("login");
};

var login = function(req, reply) {
	var password = req.payload.password,
			username = req.payload.username,
			account  = accounts[username];


	if (!req.payload || !password || !username) return reply.redirect("/");
	else if (!account) return reply.redirect("/");
	else if (account.password === password) {
		var profile = {
			username: account.username,
		};
		req.auth.session.clear();

		if (account.admin) {
			profile.admin = true;
			req.auth.session.set(profile);
			return reply.redirect("/admin");
		} else {
			req.auth.session.set(profile);
			return reply.redirect("/account");
		}
	}
};

var logout = function(req, reply) {
	req.auth.session.clear();
	return reply.redirect('/');
};

var account = function(req, reply) {
	if(req.auth.credentials.admin) return reply.redirect("/admin");
	else return reply.view("account");
};

var admin = function(req, reply) {
	if(!req.auth.credentials.admin) return reply.redirect("/account");
	else return reply.view("admin");
};

server.route([

	{
		path: "/",
		method: "GET",
		config: {
			handler: home,
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
			handler: login
		}
	},

	{
		path: "/logout",
		method: "GET",
		config: {
			handler: logout,
			auth: {
				strategy: "session"
			}
		}
	},

	{
		path: "/account",
		method: "GET",
		config: {
			handler: account,
			auth: {
				strategy: "session"
			}
		}
	},

	{
		path: "/admin",
		method: "GET",
		config: {
			handler: admin,
			auth: {
				strategy: "session"
			}
		}
	}

]);

 module.exports = server;
