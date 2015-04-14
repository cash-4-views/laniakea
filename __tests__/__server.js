var Test 	= require("tape");
var Shot 	= require("shot");
var Server  = require("../api/server.js");

Test("/, unauthenticated", function(t) {

	var opts = {
		url	   : "/",
		method : "GET"
	};

	Shot.inject(server, opts, function(err, res) {
		t.plan(1);
		t.assert(res.statusCode, 200, "returns a 200 status code");
	});
});