var Test 	= require("tape");
var Shot 	= require("shot");
var server  = require("../api/server.js");

Test("/, unauthenticated", function(t) {

	var opts = {
		url	   : "/",
		method : "GET"
	};

	Shot.inject(server, opts, function(res) {
		console.log(res.statusCode);
		t.plan(1);
		t.assert(res.statusCode, 200, "returns a 200 status code");
	});
});