var azure 		 = require("azure-storage"),
		config 		 = require("./config/testconfig").database,
		Account 	 = require("../api/models/Account"),
		test 			 = require("tape");

// Instantiate the ting
var tableSvc 		 = azure.createTableService(config.dbacc, config.dbkey),
		tableName 	 = "ACCOUNTTESTING",
		account 		 = new Account(tableSvc, tableName);

test("The Account constructer ", function(t) {
	"use strict";

	t.equal(account.storageClient, tableSvc, "should return an object with the storage client we specified");
	t.equal(account.tableName, "ACCOUNTTESTING", "should return an object with the table name specified");
	t.equal(account.partitionKey, "users", "should return an object with the partitionkey as our default value");

	tableSvc.createTable(tableName, function(err) {
		t.ok(err, "should return an error as the table has already been created");
		t.end();
	});
});

test("The getAccounts function", function(t) {
	"use strict";

	var newAccount1 = {
		PartitionKey: {_: "users"},
		RowKey 			: {_: "TIMMY_TESTER@TIMMY.COM"},
		customid 		: {_: "TIMMY_TESTER"},
		password    : {_: "secure"},
		email 			: {_: "TIMMY_TESTER@TIMMY.COM"},
		phone 			: {_: "0111111111"},
		admin 			: {_: "false"}
	};

	var newAccount2 = {
		PartitionKey: {_: "users"},
		RowKey 			: {_: "TOMMY_TASTER@TOMMY.COM"},
		customid 		: {_: "TOMMY_TASTER"},
		password    : {_: "moresecure"},
		email 			: {_: "TOMMY_TASTER@TOMMY.COM"},
		phone 			: {_: "0111111112"},
		admin 			: {_: "false"}
	};

	var arrayOfAccountsWeWant = [];

	tableSvc.insertEntity(tableName, newAccount2, {echoContent: true}, function(err1, result1, response2) {
		t.notOk(err1, "shouldn't throw an error writing account 1");
		arrayOfAccountsWeWant.push(result1);

		tableSvc.insertEntity(tableName, newAccount2, {echoContent: true}, function(err2, result2, response2) {
			t.notOk(err2, "shouldn't throw an error writing account 2");
			arrayOfAccountsWeWant.push(result2);

			account.getAccounts(function(err, accountsReturned) {
				t.notOk(err, "shouldn't throw an error getting accounts");
				t.deepEqual(accountsReturned, arrayOfAccountsWeWant, "should return an array of the same objects we put in");
				t.end();
			});

		});
	});
});

test("The getSingleAccount function", function(t) {
	"use strict";

	var newAccount1 = {
		PartitionKey: {_: "users"},
		RowKey 			: {_: "TERRIBLE_TESTER@TIMMY.COM"},
		customid 		: {_: "TERRIBLE_TESTER"},
		password    : {_: "secure"},
		email 			: {_: "TERRIBLE_TESTER@TIMMY.COM"},
		phone 			: {_: "0111111119"},
		admin 			: {_: "false"}
	};

	tableSvc.insertEntity(tableName, newAccount1, {echoContent: true}, function(err1, result1, response2) {
		t.notOk(err1, "shouldn't throw an error writing account 1");
		var accountWeWant = result1;

		t.plan(4);

		account.getSingleAccount("TERRIBLE_TESTER@TIMMY.COM", function(err, accountReturned) {
			t.notOk(err, "shouldn't throw an error getting account an existing account");
			t.deepEqual(accountReturned, accountWeWant, "should return the account we asked for");
		});

		account.getSingleAccount("whoIsThis@nobody.com", function(err, accountReturned) {
			t.ok(err, "should return us an error getting a non-existant account");
			t.notOk(accountsReturned, "shouldn't return us any accounts");
		});

	});
});

test("The createSingleAccount function", function(t) {
	"use strict";

	var accountWeWant = {
		customid 		: "SINNER",
		password    : "insecure",
		email 			: "FOUNDERSANDCULTISTS@home.com",
		phone 			: "06666666666",
		admin 			: "false"
	};

	account.createSingleAccount(accountWeWant, function(err) {
		t.notOk(err, "shouldn't return an error creating the account");

		tableSvc.retrieveEntity(tableName, "users", "FOUNDERSANDCULTISTS@home.com", function(err, entity){
			t.equal(entity.customid_,  accountWeWant.customid, "should create the account with the provided customid");
			t.equal(entity.password_,  accountWeWant.password, "should create the account with the provided password");
			t.equal(entity.email_,		 accountWeWant.email,		 "should create the account with the provided email");
			t.equal(entity.phone_,		 accountWeWant.phone,		 "should create the account with the provided phone");
			t.equal(entity.admin_,		 accountWeWant.admin,		 "should create the account with the provided admin");
			t.end();
		});
	});
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

test("Cleaning up after ourselves - deleting the table, ", function(t) {
	"use strict";

	tableSvc.deleteTable(tableName, function(err) {
		t.notOk(err, "should successfully delete the table");
		t.end();
	});
});

