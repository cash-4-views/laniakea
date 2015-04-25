var React  				  = require("react"),
		AccountViewer   = require("./AccountViewer"),
		AccountCreator  = require("./AccountCreator"),
		AccountAPIUtils = require("../../utils/AccountAPIUtils"),
		CommonAPIUtils  = require("../../utils/CommonAPIUtils");

var AccountApp = React.createClass({

	getInitialState: function() {
		"use strict";

		return {accounts: null, customidList: null};
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

	updateAccount: function(RowKey, updateObj) {
		"use strict";

		AccountAPIUtils.updateAccount(RowKey, updateObj, function(alert) {
			console.log(alert);
		});
	},

	deleteAccount: function(RowKey) {
		"use strict";

		AccountAPIUtils.deleteAccount(RowKey, function(alert) {
			console.log(alert);
		});
	},

	render: function() {
		"use strict";

		return (
			<div>
				<h3 className="sub-header">Add an account</h3>
				<div className="row placeholders">
					<AccountCreator customids={this.state.customidList} />
				</div>
				<h3 className="sub-header">Manage accounts</h3>
				<AccountViewer accounts={this.state.accounts} updateAccount={this.updateAccount}
						deleteAccount={this.deleteAccount}/>
			</div>
		);
	}

});

module.exports = AccountApp;
