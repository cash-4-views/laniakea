var Hapi = require("hapi");

var server = new Hapi.Server();

server.connection({
	port: process.env.PORT || 8000
});

server.route({
	path: "/",
	method: "GET",
	handler: function(req, reply) {
		return reply("hi m8");
	}
});

module.exports = server;