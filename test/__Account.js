var azure 		 = require("azure-storage"),
		config 		 = require("./testconfig").database,
		Account 	 = require("../api/models/Account"),
		test 			 = require("tape");

var tableSvc 		 = azure.createTableService(config.dbacc, config.dbkey);
		account 		 = new Account(tableSvc, config.atable);

test("The getAccounts function", function(t) {
	"use strict";

	t.end();
});

test("The getSingleAccount function", function(t) {
	"use strict";

	t.end();
});

test("The createSingleAccount function", function(t) {
	"use strict";

	t.end();
});

test("The updateSingleAccount function", function(t) {
	"use strict";

	t.end();
});

test("The comparePassword function", function(t) {
	"use strict";

	t.end();
});

test("The encryptPassword function", function(t) {
	"use strict";

	t.end();
});

