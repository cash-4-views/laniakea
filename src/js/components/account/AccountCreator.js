var React = require("react");

var AccountCreator = React.createClass({

	submitForm: function(e) {
		"use strict";

		e.preventDefault();

		var accountObj = {
			email: React.findDOMNode(this.refs.email).value,
			password: React.findDOMNode(this.refs.password).value,
			customid: React.findDOMNode(this.refs.customid).value,
		};

		if(React.findDOMNode(this.refs.phone).value) {
			accountObj.phone = React.findDOMNode(this.refs.phone).value;
		}

		this.props.createAccount(accountObj);
	},

	render: function() {
		"use strict";

		return(
				  <form className="form-horizontal" onSubmit={this.submitForm}>
				    <fieldset>
				      <div className="form-group">
				        <label className="col-md-1 control-label">Email</label>
				        <div className="col-md-3">
				          <input required id="email" ref="email" type="text" placeholder="useremail@email.com" className="form-control input-md"/>
				        </div>
				        <label className="col-md-1 control-label">Password</label>
				        <div className="col-md-2">
				          <input required id="password" ref="password" type="text" placeholder="********" className="form-control input-md"/>
				        </div>
				      </div>
				      <div className="form-group">
				        <label className="col-md-1 control-label">Custom ID</label>
				        <div className="col-md-3">
				          <input required id="customid" ref="customid" type="text" placeholder="" className="form-control input-md"/>
				        </div>
				        <label className="col-md-1 control-label">Phone #</label>
				        <div className="col-md-2">
				          <input id="phone" ref="phone" type="text" placeholder="01234555666" className="form-control input-md"/>
				        </div>
				        <div className="col-md-1">
				          <button id="submit" name="submit" type="submit" className="btn btn-primary">Create</button>
				        </div>
				      </div>
				    </fieldset>
				  </form>
			);
	}

});

module.exports = AccountCreator;
