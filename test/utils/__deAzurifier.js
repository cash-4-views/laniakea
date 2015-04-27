"use strict";

var test 	  		= require("tape"),
		deAzurifier = require("../../api/utils/deAzurifier");

test("The deAzurifier function - a well-formatted azure object, false key parameter ", function(t) {

	var objectToDeAzurify = {
		PartitionKey: { "$": "Edm.String", _: "users" },
		RowKey: 			{ "$": "Edm.String", _: "admin" },
		Timestamp:
		 							{ "$": "Edm.DateTime",
									 _: "Thu Apr 16 2015 21:21:35 GMT+0100 (BST)" },
		username: { _: "timmy" },
		phone: { _: "01999191999" },
		admin: { _: true },
		approved: {_: true},
		".metadata":
		 { metadata: "https://laniakeatest.table.core.windows.net/$metadata#accounts/@Element",
			 etag: "W/'datetime\'2015-04-16T20%3A21%3A35.7151837Z\"'" }
	};

	var objectWeWantKeyless = {
		username: "timmy",
		phone: "01999191999",
		admin: true
	};



	deAzurifier(objectToDeAzurify, false, function(err, objectWeGotBack) {
		t.notOk(err, "shouldn't give us an error");
		t.notOk(objectWeGotBack.approved, "should return an object without the approved field");
		t.deepEqual(objectWeGotBack, objectWeWantKeyless, "should return a successfully de-azurinated object");
		t.end();
	});
});

test("The deAzurifier function - a well-formatted azure object, true key parameter ", function(t) {

	var objectToDeAzurify = {
		PartitionKey: { "$": "Edm.String", _: "users" },
		RowKey: 			{ "$": "Edm.String", _: "admin" },
		Timestamp:
		 							{ "$": "Edm.DateTime",
									 _: "Thu Apr 16 2015 21:21:35 GMT+0100 (BST)" },
		username: { _: "timmy" },
		phone: { _: "01999191999" },
		admin: { _: true },
		approved: {_: true},
		".metadata":
		 { metadata: "https://laniakeatest.table.core.windows.net/$metadata#accounts/@Element",
			 etag: "W/'datetime\'2015-04-16T20%3A21%3A35.7151837Z\"'" }
	};

	var objectWeWantWithKeys = {
		PartitionKey: "users",
		RowKey: "admin",
		username: "timmy",
		phone: "01999191999",
		admin: true
	};

	deAzurifier(objectToDeAzurify, true, function(err, objectWeGotBack) {
		t.notOk(err, "shouldn't give us an error");
		t.notOk(objectWeGotBack.approved, "should return an object without the approved field");
		t.deepEqual(objectWeGotBack, objectWeWantWithKeys, "should return a successfully de-azurinated object");
		t.end();
	});
});


test("The deAzurifier function - a well-formatted azure object with falsy values", function(t) {

	var objectToDeAzurify = {
		PartitionKey: { "$": "Edm.String", _: "users" },
		RowKey: { "$": "Edm.String", _: "admin" },
		Timestamp:
		 { "$": "Edm.DateTime",
			 _: "Thu Apr 16 2015 21:21:35 GMT+0100 (BST)" },
		username: { _: null },
		phone: { _: 0 },
		admin: { _: false },
		".metadata":
		 { metadata: "https://laniakeatest.table.core.windows.net/$metadata#accounts/@Element",
			 etag: "W/'datetime\'2015-04-16T20%3A21%3A35.7151837Z\"'" }
	};

	var objectWeWant = {};

	deAzurifier(objectToDeAzurify, false, function(err, objectWeGotBack) {
		t.notOk(err, "shouldn't give us an error");
		t.deepEqual(objectWeGotBack, objectWeWant, "should return a successfully de-azurinated object without falsy fields");
		t.end();
	});
});

test("The deAzurifier function - a well-formatted azure object with inheritance", function(t) {

	function AzureSchmazure(username) {
		this.PartitionKey = { "$": "Edm.String", _: "users" };
		this.username = {_: username};
		return this;
	}

	AzureSchmazure.prototype = {
		phone: { _: 123455},
		admin: { _: true }
	};

	var objectToDeAzurify = new AzureSchmazure("timmy");

	var objectWeWant = {
		username: "timmy"
	};

	deAzurifier(objectToDeAzurify, false, function(err, objectWeGotBack) {
		t.notOk(err, "shouldn't give us an error");
		t.deepEqual(objectWeGotBack, objectWeWant, "should return a successfully de-azurinated object without inherited properties");
		t.end();
	});
});

test("The deAzurifier function - a badly-formatted azure object", function(t) {

	var objectToDeAzurify = {
		PartitionKey: { "$": "Edm.String", _: "users" },
		RowKey: { "$": "Edm.String", _: "admin" },
		username: "timmy",
		phone: { _: 12312412 },
		admin: true,
		".metadata":
		 { metadata: "https://laniakeatest.table.core.windows.net/$metadata#accounts/@Element",
			 etag: "W/'datetime\'2015-04-16T20%3A21%3A35.7151837Z\"'" }
	};

	var objectWeWant = {
		phone: 12312412,
	};

	deAzurifier(objectToDeAzurify, false, function(err, objectWeGotBack) {
		t.notOk(err, "shouldn't give us an error");
		t.deepEqual(objectWeGotBack, objectWeWant, "should return a successfully de-azurinated object without falsy fields");
		t.end();
	});
});

test("The deAzurifier function - an array of well-formatted azure objects", function(t) {

	var arrayToDeAzurify = [
		{ PartitionKey: {_: "users"}, RowKey: {_: "timmy_tester"}, username: {_: "timmy tester"} },
		{ PartitionKey: {_: "users"}, RowKey: {_: "tommy_tester"}, username: {_: "tommy tester"} },
		{ PartitionKey: {_: "users"}, RowKey: {_: "tammy_tester"}, username: {_: "tammy tester"} },
	];

	var arrayWeWant =  [
		{ username: "timmy tester" },
		{ username: "tommy tester" },
		{ username: "tammy tester" },
	];
	deAzurifier(arrayToDeAzurify, false, function(err, arrayWeGotBack) {
		t.notOk(err, "shouldn't return an error");
		t.deepEqual(arrayWeGotBack, arrayWeWant, "should return a successfully de-azurinated array");
		t.end();
	});
});

test("The deAzurifier function - an object, no callback", function(t) {

	var objectToDeAzurify = {
		PartitionKey: {_: "users"},
		RowKey: {_: "timmy_tester"},
		username: {_: "timmy tester"}
	};

	var objectWeWant = {
		username: "timmy tester"
	};

	t.deepEqual(deAzurifier(objectToDeAzurify, false), objectWeWant, "should return the object we put in, deAzurified");
	t.end();
});

test("The deAzurifier function - an array, no callback", function(t) {

	var arrayToDeAzurify = [
		{ PartitionKey: {_: "users"}, RowKey: {_: "timmy_tester"}, username: {_: "timmy tester"} },
		{ PartitionKey: {_: "users"}, RowKey: {_: "tommy_tester"}, username: {_: "tommy tester"} },
		{ PartitionKey: {_: "users"}, RowKey: {_: "tammy_tester"}, username: {_: "tammy tester"} },
	];

	var arrayWeWant =  [
		{ username: "timmy tester" },
		{ username: "tommy tester" },
		{ username: "tammy tester" },
	];

	t.deepEqual(deAzurifier(arrayToDeAzurify, false), arrayWeWant, "should return the array we put in, deAzurified");
	t.end();
});

test("The deAzurifier function - a string", function(t) {

	deAzurifier("hi m80", false, function(err, iWonderWhatWeWillGet) {
		t.ok(err, "should return an error message");
		t.equal(typeof(err), "object", "should return an error object");
		t.notOk(iWonderWhatWeWillGet, "should not return any processed value");
		t.end();
	});
});

test("The deAzurifier function - an array of strings", function(t) {

	deAzurifier(["hi m80", "cats", "mahatma gandhi"], false, function(err, iWonderWhatWeWillGet) {
		t.notOk(err, "should not return an error message");
		t.ok(iWonderWhatWeWillGet, "should return something");
		t.deepEqual(iWonderWhatWeWillGet, [{}, {}, {}], "should return an array of empty objects");
		t.end();
	});
});

test("The deAzurifier function - an array of mixed tings, some good some bad ", function(t) {

	var arrayToDeAzurify = [
		{ PartitionKey: {_: "users"}, RowKey: {_: "timmy_tester"}, username: {_: "timmy tester"} },
		"hi m90",
		"lol",
		1234
	];

	var arrayWeWant = [
		{ username: "timmy tester" },
		{},
		{},
		{}
	];

	deAzurifier(arrayToDeAzurify, false, function(err, weWillGetANiceArray) {
		t.notOk(err, "should not return an error message");
		t.ok(weWillGetANiceArray, "should return something");
		t.deepEqual(weWillGetANiceArray, arrayWeWant, "should return an array of formatted or empty objects");
		t.end();
	});
});
