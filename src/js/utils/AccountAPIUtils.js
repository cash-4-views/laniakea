var request = require("superagent");

module.exports = {

	getAccountList: function(onReceivingDataFn) {
		"use strict";

		request.get("/api/v1/accounts")
						.end(function(err, res){
							if(err) return onReceivingDataFn({type: "Error!", content: "There was an error getting the list of accounts"});
							return onReceivingDataFn(res.body);
						});

	},

	createAccount: function(accountData, onSuccessfulCreationFn) {
		"use strict";

		request.post("/api/v1/accounts")
						.send(accountData)
						.end(function(err, res) {
							if(err) return onSuccessfulCreationFn({type: "Error!", content: "There was an error creating that account"});
							return onSuccessfulCreationFn({type: "Success!", content: "Account created"});
						});
	},

	updateAccount: function(RowKey, updateObj, onReceivingDataFn) {
		"use strict";

		var accountObj = {};

		for(var field in updateObj) {
			if(updateObj.hasOwnProperty(field) && updateObj[field]) {
				accountObj[field] = updateObj[field];
			}
		}

		request.put("/api/v1/accounts/" + RowKey)
						.send(accountObj)
						.end(function(err, res) {
							if(err) return onReceivingDataFn({type: "Error!", content: "There was an error updating that account"});
							return onReceivingDataFn({type: "Success!", content: "Account updated"});
						});
	},

	deleteAccount: function(RowKey, onReceivingDataFn) {
		"use strict";

		request.del("/api/v1/accounts/" + RowKey)
						.end(function(err, res) {
							if(err) return onReceivingDataFn({type: "Error!", content: "There was an error deleting that account"});
							return onReceivingDataFn({type: "Success!", content: "Account deleted"});
						});
	}

};
