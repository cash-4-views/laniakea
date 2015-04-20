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

// Admin testing
Test("/addAccount posting, unauthenticated", function(t) {
	"use strict";

	var opts = {
		url: "/addAccount",
		method: "POST",
		payload: {
			username : "jonathonwoss",
			customid : "a9dal2",
			password : "wibblewobble111",
			email 	 : "wibblewobbel@wobble.com",
			phone 	 : "01112223334"
		}
	};

	server.inject(opts, function(res) {
		t.equals(res.statusCode, 302, "returns a 302 redirect status code");
		t.equals(res.headers.location, "/", "redirects the user to the homepage");

		var login = {
			url: "/login",
			method: "POST",
			payload: {
				username: opts.payload.username,
				password: opts.payload.password
			}
		};

		server.inject(login, function(res2) {
			t.comment("trying to log in with the dodgy user, ");
			t.notOk(res2.headers["set-cookie"], "fails to set the user's cookie as they haven't registered");
			t.end();
		});
	});
});


Test("/addAccount posting, authenticated, non-admin", function(t) {
	"use strict";

	var opts = {
		url: "/addAccount",
		method: "POST",
		credentials: {
			username: "TimmyTesterUser"
		},
		payload: {
			username : "jonathonwoss",
			customid : "a9dal2",
			password : "wibblewobble111",
			email 	 : "wibblewobbel@wobble.com",
			phone 	 : "01112223334"
		}
	};

	server.inject(opts, function(res) {
		t.equals(res.statusCode, 302, "returns a 302 redirect status code");
		t.equals(res.headers.location, "/", "redirects the user to the homepage");

		var login = {
			url: "/login",
			method: "POST",
			payload: {
				username: opts.payload.username,
				password: opts.payload.password
			}
		};

		server.inject(login, function(res2) {
			t.comment("trying to log in with the dodgy user, ");
			t.notOk(res2.headers["set-cookie"], "fails to set the user's cookie as they haven't registered");
			t.end();
		});
	});

});


Test("/addAccount posting, authenticated, admin", function(t) {
	"use strict";

	var opts = {
		url: "/addAccount",
		method: "POST",
		credentials: {
			username : "TimmyTesterAdmin",
			admin 	 : true
		},
		payload: {
			username : "jonathonwoss",
			customid : "a9dal2",
			password : "wibblewobble111",
			email 	 : "wibblewobbel@wobble.com",
			phone 	 : "01112223334"
		}
	};

	server.inject(opts, function(res) {
		t.equals(res.statusCode, 200, "returns a 200 success status code");
		t.ok(res.payload.match("account successfully created"), "replies with a 'success' message");

		var login = {
			url: "/login",
			method: "POST",
			payload: {
				username: opts.payload.username,
				password: opts.payload.password
			}
		};

		server.inject(login, function(res2) {
			t.comment("trying to log in with the newly created user, ");
			t.equals(res2.statusCode, 302, "successfully returns a 302 redirect status code");
			t.ok(res2.headers["set-cookie"][0].length > 100, "successfully sets the user's cookie");
			t.equals(res2.headers.location, "/account", "successfully redirects the newly made user to their account page");
			t.end();
		});
	});
});
