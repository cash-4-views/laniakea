var React 		 = require("react"),
		AccountRow = require("./AccountRow");

var AccountViewer = React.createClass({

	render: function() {
		"use strict";

		var accounts;
		if(this.props.accounts) {
			accounts = this.props.accounts.map(function(account) {
				return (
					<AccountRow key={account.RowKey._} RowKey={account.RowKey._} email={account.email}
							customid={account.customid} updateAccount={this.props.updateAccount} customidList={this.props.customidList}
							deleteAccount={this.props.deleteAccount} />
					);
			}, this);
		}

		return (
			<div className="table-responsive">
			  <table className="table table-striped">
			    <thead>
			      <tr>
			        <th>Email</th>
			        <th>Edit Email</th>
			        <th>Custom ID</th>
			        <th>Edit Custom ID</th>
			        <th>Password</th>
			      	<th>Save | Delete</th>
			      </tr>
			    </thead>
			    <tbody>
			    	{accounts}
			    </tbody>
			  </table>
			</div>
			);
	}

});

module.exports = AccountViewer;
