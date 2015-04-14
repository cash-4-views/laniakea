var Test 	= require("tape"),
	server  = require("../api/server.js");

Test("/, unauthenticated", function(t) {
	"use strict";

	var opts = {
		url	   : "/",
		method : "GET"
	};

	server.inject(opts, function(res) {
		t.plan(1);
		t.assert(res.statusCode, 200, "returns a 200 status code");
		t.assert(res.headers["Content-Type"], "html", "returns an html page");
	});

});

Test("The update custom id endpoint", function(t) {
	"use strict";

	var opts = {
		url    : "/",
		method : "PUT"
	};

	server.inject(opts, function(res) {
		t.plan(1);
	});

});