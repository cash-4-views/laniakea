var Test 		= require("tape"),
		server  = require("../api/server.js");

Test("/, unauthenticated", function(t) {
	"use strict";

	var opts = {
		url	   : "/",
		method : "GET"
	};

	server.inject(opts, function(res) {
		t.plan(3);

		t.equals(res.statusCode, 200, "returns a 200 status code");
		t.equals(res.headers["content-type"], "text/html", "returns an html page");

		t.test("the html response", function(st) {
			st.plan(2);

			var form  = /action="\/login"/i;
			var input = /input/ig;

			st.ok(res.payload.search(form), "contains a form element that submits to /login");
			st.equals(res.payload.match(input).length, 3, "contains 3 input elements for submission");
		});
	});

});

// Authenticated route tests
Test("/, authenticated", function(t) {
	"use strict";
	t.plan(2);

	var opts = {
		url	   : "/",
		method : "GET",
		credentials: {
			username: "TimmyTester"
		}
	};

	t.test("as a non-admin user", function(st) {

		server.inject(opts, function(res) {
			st.equals(res.statusCode, 302, "returns a 302 redirect status code");
			st.equals(res.headers.location, "/account", "redirects the user to their account page");
			st.end();
		});
	});

	t.test("as an admin user", function(st) {
		opts.credentials.admin = true;

		server.inject(opts, function(res) {
			st.equals(res.statusCode, 302, "returns a 302 redirect status code");
			st.equals(res.headers.location, "/admin", "redirects the admin to their dashboard");
			st.end();
		});
	});
});

Test("/login posting, unauthenticated, incorrect details", function(t) {
	"use strict";

	var opts = {
		url	   : "/login",
		method : "POST",
		payload: {
			username: "",
			password: "",
		}
	};

	server.inject(opts, function(res) {
		console.log(res.statusCode);
		t.equals(res.statusCode, 302, "returns a 302 redirect status code");
		t.notOk(res.headers["set-cookie"], "doesn't set the user's cookie");
		t.equals(res.headers.location, "/", "redirects the user to the login page");
		t.end();
	});
});

Test("/login posting, unauthenticated, correct details, non-admin", function(t) {
	"use strict";

	var opts = {
		url	   : "/login",
		method : "POST",
		payload: {
			username: "tim",
			password: "slim",
		}
	};

	server.inject(opts, function(res) {
		t.equals(res.statusCode, 302, "returns a 302 redirect status code");
		t.ok(res.headers["set-cookie"][0].length > 100, "sets the user's cookie");
		t.equals(res.headers.location, "/account", "redirects the user to their account page");
		t.end();
	});
});

Test("/login posting, unauthenticated, correct details, admin", function(t) {
	"use strict";

	var opts = {
		url	   : "/login",
		method : "POST",
		payload: {
			username: "jim",
			password: "whim",
		}
	};

	server.inject(opts, function(res) {
		t.equals(res.statusCode, 302, "returns a 302 redirect status code");
		t.ok(res.headers["set-cookie"][0].length > 100, "sets the user's cookie");
		t.equals(res.headers.location, "/admin", "redirects the admin to their dashboard");
		t.end();
	});
});

Test("/logout, without auth", function(t) {
	"use strict";

	var opts = {
		url	   : "/logout",
		method : "GET"
	};


	server.inject(opts, function(res) {
		t.equals(res.statusCode, 302, "returns a 302 redirect status code");
		t.equals(res.headers.location, "/", "redirects the user to the homepage");
		t.end();
	});
});

Test("/logout, with auth", function(t) {
	"use strict";

	var opts = {
		url: "/logout",
		method: "GET",
		credentials: {
			username: "TimmyTesterUser",
		}
	};

	server.inject(opts, function(res) {
		t.equals(res.statusCode, 302, "returns a 302 redirect status code");
		t.ok(res.headers["set-cookie"][0].match("Expires=Thu, 01 Jan 1970"), "clears the user's cookie");
		t.equals(res.headers.location, "/", "redirects the user to the homepage");
		t.end();
	});
});

// Account page testing

// Admin page testing
