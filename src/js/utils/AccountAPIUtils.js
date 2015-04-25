var request = require("superagent");

module.exports = {

	getAccountList: function(onReceivingDataFn) {
		"use strict";

		request.get("/api/v1/accounts")
						.end(function(err, res){
							if(err) console.log("Error:" + err);
							return onReceivingDataFn(res.body);
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
							if(err) return onReceivingDataFn(err);
							return onReceivingDataFn(res.body);
						});
	},

	deleteAccount: function(RowKey, onReceivingDataFn) {
		"use strict";

		request.del("/api/v1/accounts/" + RowKey)
						.end(function(err, res) {
							if(err) return onReceivingDataFn(err);
							return onReceivingDataFn(res.body);
						});
	}

};
