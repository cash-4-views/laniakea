var Hapi  	  = require('hapi'),
	fs   	  = require("fs"),
	Path 	  = require('path'),
	csvParser = require('./utils/csvParser');

var server = new Hapi.Server();

server.connection({
		host: 'localhost',
		port: 8000
});

server.route([
	{
		path: '/',
		method: 'GET',
		handler: function (request, reply) {
			var file = Path.resolve(__dirname, './sampledata/report.csv');

			fs.readFile(file, function(err, contents){
				if (err){
					return console.log(err);
				} else {
					reply(csvParser(contents));
				}
			});
		}
	},
	{
		path: "/",
		method: "PUT",
	}
]);

 module.exports = server;
