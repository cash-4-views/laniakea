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
		st.plan(2);
		opts.credentials.admin_status = false;

		server.inject(opts, function(res) {
			st.equals(res.statusCode, 302, "returns a 302 redirect status code");
			st.equals(res.headers.location, "/account", "redirects the user to their account page");
		});
	});

	t.test("as an admin user", function(st) {
		st.plan(2);
		opts.credentials.admin_status = true;

		server.inject(opts, function(res) {
			st.equals(res.statusCode, 302, "returns a 302 redirect status code");
			st.equals(res.headers.location, "/admin", "redirects the admin to their dashboard");
		});
	});

});

Test("/login posting, unauthenticated", function(t) {
	"use strict";
	t.plan(3);

	var opts = {
		url	   : "/login",
		method : "POST",
		payload: {
			username: "",
			password: "",
		}
	};

	t.test("with incorrect details", function(st) {
		server.inject(opts, function(res) {
			st.equals(res.statusCode, 403, "returns a 403 bad status code");
			st.notOk(res.headers["Set-Cookie"], "doesn't set the user's cookie");
			st.notOk(res.headers.location, "doesn't redirect the user");
		});
	});

	t.test("as a non-admin user, with correct details", function(st) {
		st.plan(3);
		opts.payload.username = "TimmyTesterUser";
		opts.payload.password = "userpassword";

		server.inject(opts, function(res) {
			st.equals(res.statusCode, 302, "returns a 302 redirect status code");
			st.ok(res.headers["Set-Cookie"], "sets the user's cookie");
			st.equals(res.headers.location, "/account", "redirects the user to their account page");
		});
	});

	t.test("as an admin user, with correct details", function(st) {
		st.plan(3);
		opts.payload.username = "TimmyTesterAdmin";
		opts.payload.password = "adminpassword";

		server.inject(opts, function(res) {
			st.equals(res.statusCode, 302, "returns a 302 redirect status code");
			st.ok(res.headers["Set-Cookie"], "sets the user's cookie");
			st.equals(res.headers.location, "/admin", "redirects the admin to their dashboard");
		});
	});

});

Test("/logout", function(t) {
	"use strict";
	t.plan(2);

	var opts = {
		url	   : "/logout",
		method : "GET"
	};

	t.test("without authentication", function(st) {
		st.plan(2);

		server.inject(opts, function(res) {
			st.equals(res.statusCode, 302, "returns a 302 redirect status code");
			st.equals(res.headers.location, "/", "redirects the user to the homepage");
		});
	});

	t.test("with authentication", function(res) {
		st.plan(2);
		opts.credentials = {
			username: "TimmyTesterUser",
			password: "userpassword"
		};

		server.inject(opts, function(res) {
			st.equals(res.statusCode, 302, "returns a 302 redirect status code");
			st.ok(res.headers["Set-Cookie"], "clears the user's cookie");
			st.equals(res.headers.location, "/", "redirects the user to the homepage");
		});
	});

});