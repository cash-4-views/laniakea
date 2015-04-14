var Hapi = require('hapi');
var fs = require("fs");
var csvParser = require('./utils/csvParser');
var Path = require('path');


// Create a server instance
var server = new Hapi.Server();

// Create a connection which will listen on port 8000
server.connection({
    host: 'localhost',
    port: 8000
});

// Add a GET endpoint /hello
server.route({
    method: 'GET',
    path: '/',
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
 });

 module.exports = server;
