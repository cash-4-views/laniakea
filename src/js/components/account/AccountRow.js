var React = require("react"),
		Button = require("../common/Button"),
		Typeahead = require('react-typeahead').Typeahead;


var AccountRow = React.createClass({

	onUpdate: function() {
		"use strict";

		var updateObj = {
			email 	: React.findDOMNode(this.refs.email).value,
			password: React.findDOMNode(this.refs.password).value
		};

		if(React.findDOMNode(this.refs.customid)) {
			updateObj.customid = React.findDOMNode(this.refs.customid).value;
		} else if(React.findDOMNode(this.refs.typeAhead.refs.entry)) {
			updateObj.customid = React.findDOMNode(this.refs.typeAhead.refs.entry).value;
		}

		this.props.updateAccount(this.props.RowKey, updateObj);
	},

	onDelete: function() {
		"use strict";

		this.props.deleteAccount(this.props.RowKey);
	},

	render: function() {
		"use strict";

		var customClasses = {
			input: "form-control input-md",
			results: "col-md-3"
		};

		return (
			<tr>
				<td>{this.props.email._}</td>
				<td><input className="form-control input-md" ref="email" type="text" /></td>
				<td>{this.props.customid._}</td>
				<td>
        	{this.props.customid._ === "admin" ? <input className="form-control input-md" ref="customid" type="text" disabled={true}/> :
        			(this.props.customidList && this.props.customidList.length) ?
        			<Typeahead ref="typeAhead" options={this.props.customidList} customClasses={customClasses} /> :
		          <input id="customid" ref="customid" type="text" placeholder="" className="form-control input-md"/>
        	}

				</td>
				<td className="col-md-1"><input className="form-control input-md" ref="password" type="text" /></td>
				<td>
					<div className="btn-group" role="group" aria-label="...">
						<Button type="primary glyphicon glyphicon-edit" value={this.props.RowKey} disabled={false} onClickCallback={this.onUpdate} isLoading={false}/>
						<Button type="danger glyphicon glyphicon-remove" value={this.props.RowKey} disabled={false} onClickCallback={this.onDelete} isLoading={false}/>
					</div>
				</td>
			</tr>
			);
	}

});

module.exports = AccountRow;
