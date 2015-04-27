var React  				  = require("react"),
		AccountViewer   = require("./AccountViewer"),
		AccountCreator  = require("./AccountCreator"),
		Alert 					= require("../common/Alert"),
		AccountAPIUtils = require("../../utils/AccountAPIUtils"),
		CommonAPIUtils  = require("../../utils/CommonAPIUtils");

var AccountApp = React.createClass({

	getInitialState: function() {
		"use strict";

		return {accounts: null, customidList: null, alert: null, formCustomId: ""};
	},

	componentDidMount: function() {
		"use strict";

		AccountAPIUtils.getAccountList(function(accountsOrAlert) {
			if (this.isMounted()) {
				if(accountsOrAlert.type) return this.setState({alert: accountsOrAlert});
				this.setState({accounts: accountsOrAlert});
			}
		}.bind(this));

		CommonAPIUtils.getCustomIDList(null, function(idsOrAlert) {
			if(this.isMounted()) {
				if(idsOrAlert.type) return this.setState({alert: idsOrAlert});
				else if(idsOrAlert) {
					var customidList = [];
					for(var id in idsOrAlert) {
						if(idsOrAlert.hasOwnProperty(id)) {
							customidList.push(idsOrAlert[id]);
						}
					}
					this.setState({customidList: customidList });
				}
			}
		}.bind(this));
	},

	typeIntoTypeahead: function(e) {
		"use strict";

		this.setState({formCustomId: React.findDOMNode(e.target).value});
	},

	createAccount: function(accountObj) {
		"use strict";

		AccountAPIUtils.createAccount(accountObj, function(alert) {
			this.setState({alert: alert});
		}.bind(this));
	},

	updateAccount: function(RowKey, updateObj) {
		"use strict";
		var self = this;

		AccountAPIUtils.updateAccount(RowKey, updateObj, function(alert) {
			if(alert.type === "Error!") return this.setState({alert: alert});
			else {
				var newAccounts = self.state.accounts.map(function(account) {
					if(account.RowKey._ === RowKey) {
						for(var field in updateObj) {
							if(updateObj.hasOwnProperty(field) && updateObj[field])
							account[field]._ = updateObj[field];
						}
					}
					return account;
				});
				self.setState({accounts: newAccounts, alert: alert});
			}
		});
	},

	deleteAccount: function(RowKey) {
		"use strict";

		AccountAPIUtils.deleteAccount(RowKey, function(alert) {
			if(alert.type === "Error!") return this.setState({alert: alert});
			else {
				var newAccounts = this.state.accounts.filter(function(account) {
					return account.RowKey._ !== RowKey;
				});
				this.setState({accounts: newAccounts, alert: alert});
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
					<AccountCreator customidList={this.state.customidList} createAccount={this.createAccount}
							typeIntoTypeahead={this.typeIntoTypeahead} />
				</div>
				<h3 className="sub-header">Manage accounts</h3>
				<AccountViewer customidList={this.state.customidList} accounts={this.state.accounts}
						updateAccount={this.updateAccount} deleteAccount={this.deleteAccount}/>
			</div>
		);
	}

});

module.exports = AccountApp;
