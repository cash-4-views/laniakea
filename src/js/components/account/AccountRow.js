var React = require("react"),
		Button = require("../common/Button");


var AccountRow = React.createClass({

	onUpdate: function() {
		"use strict";

		var updateObject = {
			email 	: React.findDOMNode(this.refs.email).value,
			customid: React.findDOMNode(this.refs.customid).value,
			password: React.findDOMNode(this.refs.password).value
		};

		this.props.updateAccount(this.props.RowKey, updateObject);
	},

	onDelete: function() {
		"use strict";

		this.props.deleteAccount(this.props.RowKey);
	},

	render: function() {
		"use strict";

		return (
			<tr>
				<td>{this.props.email}</td>
				<td><input className="form-control input-md" ref="email" type="text" /></td>
				<td>{this.props.customid}</td>
				<td><input className="form-control input-md" ref="customid" type="text" /></td>
				<td className="col-md-1"><input className="form-control input-md" ref="password" type="text" /></td>
				<td>
					<div className="btn-group" role="group" aria-label="...">
						<Button type="info glyphicon glyphicon-edit" value={this.props.RowKey} disabled={false} onClickCallback={this.onUpdate} isLoading={false}/>
						<Button type="danger glyphicon glyphicon-remove" value={this.props.RowKey} disabled={false} onClickCallback={this.onDelete} isLoading={false}/>
					</div>
				</td>
			</tr>
			);
	}

});

module.exports = AccountRow;
