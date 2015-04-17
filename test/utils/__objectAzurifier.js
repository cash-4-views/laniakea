var Test 	  				= require("tape"),
		objectAzurifier = require("../../api/utils/objectAzurifier");

		Test("The objectAzurifier function - a well-formatted azure object", function(t) {
			"use strict";

			var objectToAzurify = {
				username: "timmy",
				phone: "01999191999",
				admin: true
			};

			var objectWeWant = {
				PartitionKey: { "$": "Edm.String", _: "users" },
				RowKey: { "$": "Edm.String", _: "timmy" },
				username: { "$": "Edm.String",_: "timmy" },
				phone: { "$": "Edm.String",_: "01999191999" },
				admin: { "$": "Edm.String",_: true }
			};


			objectAzurifier("users","username", objectToAzurify, function(objectWeGotBack) {
				t.deepEqual(objectWeGotBack, objectWeWant, "should return a successfully de-azurinated object");
				t.end();
			});
		});
