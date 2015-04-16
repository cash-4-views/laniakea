
var Hapi 				 = require('hapi'),
		fs 					 = require("fs"),
		Path 				 = require('path'),
		bcrypt 			 = require("bcrypt-nodejs"),
		config 			 = require("./config"),
		csvParser 	 = require('./utils/csvParser'),
		csvConverter = require("./utils/csvConverter"),
		api_key   	 = config.mailgun.apiKey,
		domain    	 = config.mailgun.domain,
		Mailgun   	 = require("mailgun-js"),
		messages		 = require("./messages/messages"),
		path 				 = require("path");

var server = new Hapi.Server();

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


var accounts = {
	jim: {
		username: "jim",
		password: "$2a$10$EE6BpR8M4xMqf9h/OPD3l.uI3SR9QKri36pTa7TAfSiYzZjLqtu9u",
		admin: true
	},
	tim: {
		username: "tim",
		password: "$2a$10$AQChk8U3WuCOEuks0ew/N.MNF2kxyQp8OSbjrAA4G42WEYaH/u51u"
	}
};


var home = function(req, reply) {
	"use strict";

	if(req.auth.isAuthenticated && req.auth.credentials.admin) return reply.redirect("/admin");
	else if(req.auth.isAuthenticated) return reply.redirect("/account");
	else return reply.view("login");
};


var login = function(req, reply) {
	"use strict";
	var password = req.payload.password,
			username = req.payload.username,
			account  = accounts[username];

	if (!req.payload || !password || !username) return reply.redirect("/");
	else if (!account) return reply.redirect("/");
	else {
		bcrypt.compare(password, account.password, function(err, success) {

			if (err || !success) return reply("password error, please try again");
			else if (success) {

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
		});
	}
};

var addAccount = function(req, reply) {
	"use strict";

	var	username = req.payload.username,
			customid = req.payload.customid,
			password = req.payload.password,
			email 	 = req.payload.email,
			phone 	 = req.payload.phone,
			admin 	 = false;

	if (!req.auth.credentials.admin) return reply.redirect("/");
	else if (!req.payload || !customid || !password || !username || !email || !phone) return reply("missing field");
	else if (accounts[username]) return reply("account already exists");
	else {
		bcrypt.hash(password, null, null, function(err, hash) {
			if(err) return reply("error hashing password, ", hash);

			var newAccount = {
				username : username,
				customid : customid,
				password : hash,
				email 	 : email,
				phone 	 : phone
			};

			accounts[username] = newAccount;

			var newMember = {
				subscribed: true,
				address: email,
				name: username,
				vars: {}
			};

			messages.addToMailingList(newMember, function(err) {
				if (err) console.log("list error: " + err);
			});

			messages.sendEmail("approve", newAccount, function(err) {
				if (err) console.log("error: " + err);
			});

			return reply("account successfully created!");
		});
	}

};

var logout = function(req, reply) {
	"use strict";

	req.auth.session.clear();
	return reply.redirect('/');
};

var account = function(req, reply) {
	"use strict";

	if(req.auth.credentials.admin) return reply.redirect("/admin");
	else return reply.view("account");
};

var admin = function(req, reply) {
	"use strict";

	if(!req.auth.credentials.admin) return reply.redirect("/account");
	else return reply.view("admin");
};

var notify = function(req, reply) {
	"use strict";

	var dummy = {
		username : "thisguy",
		to       : "dave@beechware.com",
		email    : "rory.sedgwick@gmail.com",
		subject  : "",
		text     : "",
	};

	messages.sendEmail("notify", dummy, function(err) {
		console.log("notification sent");
		if (err) console.log("notify error :" + err);
	});

	console.log("ajax request received");
};

server.route([

	{
    path: "/{param}",
    method: "GET",
    handler: {
        directory: {
            path: Path.join(__dirname) + "../../public"
        }
	    }
	 },

	 {
	 	path : "/notify",
	 	method : "GET",
	 	handler : notify
	 },

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
			handler: login,
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
			handler: logout
		}
	},

	{
		path: "/addAccount",
		method: "POST",
		config: {
			handler: addAccount
		}
	},

	{
		path: "/account",
		method: "GET",
		config: {
			handler: account
		}
	},

	{
		path: "/admin",
		method: "GET",
		config: {
			handler: admin
		}
	}

]);

 module.exports = server;
