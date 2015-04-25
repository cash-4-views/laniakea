var test 	  				= require("tape"),
		objectAzurifier = require("../../api/utils/objectAzurifier");

test("The objectAzurifier function - a legal-character input object", function(t) {
	"use strict";

	var objectToAzurify = {
		username: "timmy",
		phone: "01999191999",
		admin: true
	};

	var objectWeWant = {
		PartitionKey: { "$": "Edm.String", _: "users" },
		RowKey: { "$": "Edm.String", _: "timmy_01999191999" },
		username: { "$": "Edm.String",_: "timmy" },
		phone: { "$": "Edm.String",_: "01999191999" },
		admin: { "$": "Edm.String",_: true }
	};


	objectAzurifier("users", "username", "phone", objectToAzurify, function(err, objectWeGotBack) {
		t.notOk(err, "should not return an error");
		t.deepEqual(objectWeGotBack, objectWeWant, "should return a successfully azurinated object");
		t.end();
	});
});

test("The objectAzurifier function - an illegal-character input object", function(t) {
	"use strict";

	var objectToAzurify = {
		username: "timmy",
		phone: "01999191999",
		"123admin": true,
		"  --dog-ea1ter": "happy",
		"Tea?  ": "biscuits",
		"m()oe syzlack": "lol"
	};

	var objectWeWant = {
		PartitionKey: { "$": "Edm.String", _: "users" },
		RowKey: { "$": "Edm.String", _: "timmy_01999191999" },
		username: { "$": "Edm.String",_: "timmy" },
		phone: { "$": "Edm.String",_: "01999191999" },
		"_123admin": { "$": "Edm.String",_: true },
		"dog_ea1ter": { "$": "Edm.String",_: "happy" },
		"Tea": { "$": "Edm.String",_: "biscuits" },
		"moe_syzlack": { "$": "Edm.String",_: "lol" }
	};


	objectAzurifier("users","username", "phone", objectToAzurify, function(err, objectWeGotBack) {
		t.notOk(err, "should not return an error");
		t.deepEqual(objectWeGotBack, objectWeWant, "should return a successfully legal charactified, azurinated object");
		t.end();
	});
});

test("The objectAzurifier function - an input object with inheritance", function(t) {
	"use strict";

	function ObjectSchmobject(username) {
		this.username = username;
		this.isHipster = "yes";
		return this;
	}

	ObjectSchmobject.prototype = {
		phone: "123455",
		"--admin": true
	};

	var objectToAzurify = new ObjectSchmobject("timmy");

	var objectWeWant = {
		PartitionKey: { "$": "Edm.String", _: "users" },
		RowKey: { "$": "Edm.String", _: "timmy_yes" },
		username: { "$": "Edm.String",_: "timmy" },
		isHipster: { "$": "Edm.String",_: "yes" }
	};

	objectAzurifier("users", "username", "isHipster", objectToAzurify, function(err, objectWeGotBack) {
		t.notOk(err, "should not return an error");
		t.deepEqual(objectWeGotBack, objectWeWant, "should return a successfully azurinated object without inherited properties");
		t.end();
	});
});

test("The objectAzurifier function - an input object without partition or row keys", function(t) {
	"use strict";

	var objectToAzurify = {
		Custom_ID: "a901masi9",
	};

	var objectWeWant = {
		Custom_ID: { "$": "Edm.String",_: "a901masi9" },
	};


	objectAzurifier(null, null, null, objectToAzurify, function(err, objectWeGotBack) {
		t.notOk(err, "should not return an error");
		t.deepEqual(objectWeGotBack, objectWeWant, "should return a successfully azurinated object, without partition or row keys");
		t.end();
	});
});

test("The objectAzurifier function - a wonky input object with pre-existing partition or row keys", function(t) {
	"use strict";

	var objectToAzurify = {
		PartitionKey: { "$": "Edm.String", _: "users" },
		RowKey: { "$": "Edm.String", _: "timmy" },
		"Custom ID": "a901masi9",
	};

	var objectWeWant = {
		PartitionKey: { "$": "Edm.String", _: "users" },
		RowKey: { "$": "Edm.String", _: "timmy" },
		Custom_ID: { "$": "Edm.String",_: "a901masi9" }
	};


	objectAzurifier(null, null, null, objectToAzurify, function(err, objectWeGotBack) {
		t.notOk(err, "should not return an error");
		t.deepEqual(objectWeGotBack, objectWeWant, "should return a successfully azurinated object, without partition or row keys");
		t.end();
	});
});

test("The objectAzurifier function - an input object with only one row key", function(t) {
	"use strict";

	var objectToAzurify = {
		username: "timmy",
		phone: "01999191999",
		admin: true
	};

	var objectWeWant = {
		RowKey: { "$": "Edm.String", _: "timmy" },
		username: { "$": "Edm.String",_: "timmy" },
		phone: { "$": "Edm.String",_: "01999191999" },
		admin: { "$": "Edm.String",_: true }
	};

	t.comment("| As the first row argument");
	objectAzurifier(null, "username", null, objectToAzurify, function(err, objectWeGotBack) {
		t.notOk(err, "should not return an error");
		t.deepEqual(objectWeGotBack, objectWeWant, "should return a successfully azurinated object, without partition or row keys");
	});

	t.comment("| As the second row argument");
	objectAzurifier(null, null, "admin", objectToAzurify, function(err, objectWeGotBack) {
		t.ok(err, "should return an error");
		t.notOk(objectWeGotBack, "should not return an object");
		t.end();
	});
});
