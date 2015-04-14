var Test 	= require("tape"),
	server  = require("../api/server.js");

Test("/", function(t) {
	"use strict";

	var opts = {
		url	   : "/",
		method : "get"
	};

	server.inject(opts, function(res) {
		t.plan(1);
		t.assert(res.statusCode, 200, "returns a 200 status code");
	});

});