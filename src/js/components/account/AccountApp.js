var React  				  = require("react"),
		AccountViewer   = require("./AccountViewer"),
		AccountCreator  = require("./AccountCreator"),
		Alert 					= require("../common/Alert"),
		AccountAPIUtils = require("../../utils/AccountAPIUtils"),
		CommonAPIUtils  = require("../../utils/CommonAPIUtils");

var AccountApp = React.createClass({

	getInitialState: function() {
		"use strict";

		return {accounts: null, customidList: null, alert: null};
	},

	componentDidMount: function() {
		"use strict";

		AccountAPIUtils.getAccountList(function(accountsFromServer) {
			if (this.isMounted()) {
				this.setState({accounts: accountsFromServer});
			}
		}.bind(this));

		CommonAPIUtils.getCustomIDList(null, function(idsFromServer) {
			if(this.isMounted()) {
				this.setState({customidList: idsFromServer });
			}
		}.bind(this));
	},

	createAccount: function(accountObj) {
		"use strict";

		AccountAPIUtils.createAccount(accountObj, function(err) {
			if(err) console.log(err);
			else this.setState({alert: {type: "Success!", content: "Account created"}});
		}.bind(this));
	},

	updateAccount: function(RowKey, updateObj) {
		"use strict";
		var self = this;

		AccountAPIUtils.updateAccount(RowKey, updateObj, function(err) {
			if(err) return console.log(err);
			else {
				var newAccounts = self.state.accounts.map(function(account) {
					if(account.RowKey === RowKey) {
						for(var field in updateObj) {
							if(updateObj.hasOwnProperty(field) && updateObj[field])
							account[field] = updateObj[field];
						}
					}
					return account;
				});
				self.setState({accounts: newAccounts, alert: {type: "Success!", content: "Account updated"}});
			}
		});
	},

	deleteAccount: function(RowKey) {
		"use strict";

		AccountAPIUtils.deleteAccount(RowKey, function(err) {
			if(err) return console.log(err);
			else {
				var newAccounts = this.state.accounts.filter(function(account) {
					return account.RowKey !== RowKey;
				});
				this.setState({accounts: newAccounts, alert: {type: "Success!", content: "Account deleted"}});
			}
		}.bind(this));
	},

	closeAlert: function() {
		"use strict";

		this.setState({alert: null});
	},

	render: function() {
		"use strict";

		return (
			<div>
				{this.state.alert ? <Alert key="Alert" alert={this.state.alert} closeAlert={this.closeAlert} /> : <span/>}
				<h3 className="sub-header">Add an account</h3>
				<div className="row placeholders">
					<AccountCreator customids={this.state.customidList} createAccount={this.createAccount}/>
				</div>
				<h3 className="sub-header">Manage accounts</h3>
				<AccountViewer accounts={this.state.accounts} updateAccount={this.updateAccount}
						deleteAccount={this.deleteAccount}/>
			</div>
		);
	}

});

module.exports = AccountApp;
