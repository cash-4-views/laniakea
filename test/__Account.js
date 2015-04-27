"use strict";

var azure 		 = require("azure-storage"),
		bcrypt 		 = require("bcrypt-nodejs"),
		config 		 = require("./config/testconfig").database,
		Account 	 = require("../api/models/Account"),
		test 			 = require("tape");

// Instantiate the ting
var tableSvc 		 = azure.createTableService(config.dbacc, config.dbkey),
		tableName 	 = config.atable + Date.now(),
		account;

test("Preparation", function(t) {

	tableSvc.doesTableExist(tableName, function(errPing, res) {
		if(res) {
			t.comment("Table already exists. Deleting table...");
			tableSvc.deleteTableIfExists(tableName, function(errDel, result) {
				if(result) setTimeout(function() {return;}, 5000);
			});
		}

		account = new Account(tableSvc, tableName);
		setTimeout(t.end, 500);
	});

});

test("The Account constructor ", function(t) {

	t.equal(account.storageClient, tableSvc, "should return an object with the storage client we specified");
	t.equal(account.tableName, tableName, "should return an object with the table name specified");
	t.equal(account.partitionKey, "users", "should return an object with the partitionkey as our default value");

	tableSvc.doesTableExist(tableName, function(errPing, res) {
		t.ok(res, "should create a table");
		t.end();
	});
});

test("The getAccounts function", function(t) {

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

	tableSvc.insertEntity(tableName, newAccount1, {echoContent: true}, function(err1, result1, response1) {
		t.notOk(err1, "shouldn't throw an error writing account 1");
		delete result1[".metadata"];
		arrayOfAccountsWeWant.push(result1);

		tableSvc.insertEntity(tableName, newAccount2, {echoContent: true}, function(err2, result2, response2) {
			t.notOk(err2, "shouldn't throw an error writing account 2");
			delete result2[".metadata"];
			arrayOfAccountsWeWant.push(result2);

			account.getAccounts(function(err, accountsReturned) {
				t.notOk(err, "shouldn't throw an error getting accounts");

				if(accountsReturned) accountsReturned.forEach(function(acc) {delete acc[".metadata"];});
				t.deepEqual(accountsReturned, arrayOfAccountsWeWant, "should return an array of the same objects we put in");
				t.end();
			});

		});
	});
});

test("The getSingleAccount function", function(t) {

	var newAccount1 = {
		PartitionKey: {_: "users"},
		RowKey 			: {_: "TERRIBLE_TESTER@TIMMY.COM"},
		customid 		: {_: "TERRIBLE_TESTER"},
		password    : {_: "secure"},
		email 			: {_: "TERRIBLE_TESTER@TIMMY.COM"},
		phone 			: {_: "0111111119"},
		admin 			: {_: "false"}
	};

	tableSvc.insertEntity(tableName, newAccount1, {echoContent: true}, function(err1, result1, response1) {
		t.plan(5);
		t.notOk(err1, "shouldn't throw an error writing account 1");

		delete result1[".metadata"];
		var accountWeWant = result1;

		setTimeout(function() {
			account.getSingleAccount("TERRIBLE_TESTER@TIMMY.COM", function(err, accountReturned) {
				t.notOk(err, "shouldn't throw an error getting account an existing account");
				if(accountReturned) delete accountReturned[".metadata"];
				t.deepEqual(accountReturned, accountWeWant, "should return the account we asked for");
			});

			account.getSingleAccount("whoIsThis@nobody.com", function(err, accountReturned) {
				t.ok(err, "should return us an error getting a non-existant account");
				t.notOk(accountReturned, "shouldn't return us any accounts");
			});
		}, 200);

	});
});

test("The createSingleAccount function", function(t) {

	var accountWeWant = {
		customid 		: "SINNER",
		password    : "insecure",
		email 			: "FOUNDERSANDCULTISTS@home.com",
		phone 			: "06666666666",
		admin 			: "false"
	};

	account.createSingleAccount(accountWeWant, function(err) {
		t.notOk(err, "shouldn't return an error creating the account");

		setTimeout(function() {
			tableSvc.retrieveEntity(tableName, "users", "FOUNDERSANDCULTISTS@home.com", function(err, entity){
				t.equal(entity.customid._,  accountWeWant.customid,  "should create the account with the provided customid");
				t.equal(entity.password._,  accountWeWant.password,  "should create the account with the provided password");
				t.equal(entity.email._,		  accountWeWant.email,		 "should create the account with the provided email");
				t.equal(entity.phone._,		  accountWeWant.phone,		 "should create the account with the provided phone");
				t.equal(entity.admin._,		  accountWeWant.admin,		 "should create the account with the provided admin");
				t.end();
			});
		}, 200);

	});
});

test("The updateSingleAccount function ", function(t) {

	var newAccount1 = {
		PartitionKey: {_: "users"},
		RowKey 			: {_: "TOOTHLESS_TONY@T.COM"},
		customid 		: {_: "TOOTHLESS_TONY"},
		password    : {_: "ensecure"},
		email 			: {_: "TOOTHLESS_TONY@T.COM"},
		phone 			: {_: "0111011110"},
		admin 			: {_: "false"}
	};

	tableSvc.insertEntity(tableName, newAccount1, function(err1, result1, response1) {
		t.plan(5);
		t.notOk(err1, "shouldn't throw an error writing account 1 ");

		var updateObj = {
			customid: "NIGEL_FARAGE",
			email: "DANGEROUS_DEREK@DOG.COM"
		};

		account.updateSingleAccount("TOOTHLESS_TONY@T.COM", updateObj, function(err) {
			t.notOk(err, "shouldn't return an error");

			tableSvc.retrieveEntity(tableName, "users", "TOOTHLESS_TONY@T.COM", function(err, entity) {
				t.equal(entity.customid._,  updateObj.customid, 	"should successfully update the account customid");
				t.equal(entity.email._, 		updateObj.email, 			"should successfully update the account email");
				t.equal(entity.RowKey._, 		newAccount1.RowKey._, "shouldn't touch the rowkey email");
				t.end();
			});
		});
	});
});

test("The comparePassword function", function(t) {

		var password  = "password",
				hashed 	  = "$2a$10$OZ9cHnpw.rAPwKExp5kiOuaDY/evHxGK1NdAV7f8vW2/AjDRXieNe",
				hashBad   = "asfsafasfasfasfasfasfasfasfasfasf",
				hashWrong = "$2a$10$baHD7BvzsLS5kDaC7A3lBelzpKqkEG92pj.FoN6OVrJ0TzdYIJMR6";

		t.plan(3);

		account.comparePassword(password, hashed, function(err) {
			t.notOk(err, "should not return an error when comparing the same password");
		});

		account.comparePassword(password, hashBad, function(err) {
			t.ok(err, "should return an error when given an invalid hash");
		});

		account.comparePassword(password, hashWrong, function(err) {
			t.ok(err, "should return an error when given an incorrect password");
		});
});

test("The hashPassword function", function(t) {

	var password   = "password",
			hashWeWant = "$2a$10$OZ9cHnpw.rAPwKExp5kiOuaDY/evHxGK1NdAV7f8vW2/AjDRXieNe";

	account.hashPassword(password, function(err, hash) {
		t.notOk(err, "should not return an error when given a good password");

		bcrypt.compare(password, hash, function(err, res) {
			t.notOk(err, "should not return an error when comparing the new hash to the password");
			t.end();
		});
	});
});

test("Cleaning up after ourselves - deleting the table, ", function(t) {

	tableSvc.deleteTable(tableName, function(err) {
		t.notOk(err, "should successfully delete the table");
		t.end();
	});
});

