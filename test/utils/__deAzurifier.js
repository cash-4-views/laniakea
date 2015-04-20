var Test 	  		= require("tape"),
		deAzurifier = require("../../api/utils/deAzurifier");

Test("The deAzurifier function - a well-formatted azure object", function(t) {
	"use strict";

	var objectToDeAzurify = {
		PartitionKey: { "$": "Edm.String", _: "users" },
		RowKey: { "$": "Edm.String", _: "admin" },
		Timestamp:
		 { "$": "Edm.DateTime",
			 _: "Thu Apr 16 2015 21:21:35 GMT+0100 (BST)" },
		username: { _: "timmy" },
		phone: { _: "01999191999" },
		admin: { _: true },
		".metadata":
		 { metadata: "https://laniakeatest.table.core.windows.net/$metadata#accounts/@Element",
			 etag: "W/'datetime\'2015-04-16T20%3A21%3A35.7151837Z\"'" }
	};

	var objectWeWant = {
		username: "timmy",
		phone: "01999191999",
		admin: true
	};

	deAzurifier(objectToDeAzurify, function(err, objectWeGotBack) {
		t.notOk(err, "shouldn't give us an error");
		t.deepEqual(objectWeGotBack, objectWeWant, "should return a successfully de-azurinated object");
		t.end();
	});
});

Test("The deAzurifier function - a well-formatted azure object with falsy values", function(t) {
	"use strict";

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

	deAzurifier(objectToDeAzurify,function(err, objectWeGotBack) {
		t.notOk(err, "shouldn't give us an error");
		t.deepEqual(objectWeGotBack, objectWeWant, "should return a successfully de-azurinated object without falsy fields");
		t.end();
	});
});

Test("The deAzurifier function - a well-formatted azure object with inheritance", function(t) {
	"use strict";

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

	deAzurifier(objectToDeAzurify, function(err, objectWeGotBack) {
		t.notOk(err, "shouldn't give us an error");
		t.deepEqual(objectWeGotBack, objectWeWant, "should return a successfully de-azurinated object without inherited properties");
		t.end();
	});
});

Test("The deAzurifier function - a badly-formatted azure object", function(t) {
	"use strict";

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

	deAzurifier(objectToDeAzurify, function(err, objectWeGotBack) {
		t.notOk(err, "shouldn't give us an error");
		t.deepEqual(objectWeGotBack, objectWeWant, "should return a successfully de-azurinated object without falsy fields");
		t.end();
	});
});
