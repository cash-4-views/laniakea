var React = require("react");

var AccountCreator = React.createClass({

	onSubmit: function(e) {
		"use strict";


	},

	render: function() {
		"use strict";

		return(
				  <form action="/api/v1/accounts" method="POST" className="form-horizontal">
				    <fieldset>
				      <div className="form-group">
				        <label className="col-md-1 control-label">Email</label>
				        <div className="col-md-3">
				          <input id="email" name="email" type="text" placeholder="useremail@email.com" className="form-control input-md"/>
				        </div>
				        <label className="col-md-1 control-label">Password</label>
				        <div className="col-md-2">
				          <input id="password" name="password" type="text" placeholder="********" className="form-control input-md"/>
				        </div>
				      </div>
				      <div className="form-group">
				        <label className="col-md-1 control-label">Custom ID</label>
				        <div className="col-md-3">
				          <input id="customid" name="customid" type="text" placeholder="" className="form-control input-md"/>
				        </div>
				        <label className="col-md-1 control-label">Phone #</label>
				        <div className="col-md-2">
				          <input id="phone" name="phone" type="text" placeholder="01234555666" className="form-control input-md"/>
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
