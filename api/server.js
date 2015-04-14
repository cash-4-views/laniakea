var Hapi = require("hapi");
var fs  = require("fs");
var csvParser = require("./utils/csvParser");
var Path = require("path");

var server = new Hapi.Server();

server.connection({
    host: "localhost",
    port: process.env.PORT || 8000
});

server.route({
    method: "GET",
    path: "/",
    handler: function(request, reply) {
        var file = Path.resolve(__dirname, "./sampledata/report.csv");
        fs.readFile(file, function(err, contents) {
            if (err) {
                return console.log(err);
            } else {
                reply(csvParser(contents));
            }
        });
    }
});

module.exports = server;
