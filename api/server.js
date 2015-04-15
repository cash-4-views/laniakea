var Hapi  	  = require("hapi"),
		fs   	  	= require("fs"),
		Path 	  	= require("path"),
		csvParser = require("./utils/csvParser");

var server = new Hapi.Server();

server.connection({
	port: process.env.PORT || 8000
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

server.route([

	{
		path: "/",
		method: "GET",
		handler: function (req, reply) {
			reply.view("login");
		}
	},

	{
		path: "/login",
		method: "POST",
		handler: function(req, reply) {
			return;
		}
	},

	{
		path: "/signup",
		method: "POST",
		handler: function(req, reply) {

		}
	},

	{
		path: "/logout",
		method: "GET",
		handler: function(req, reply) {

		}
	}

]);

 module.exports = server;
