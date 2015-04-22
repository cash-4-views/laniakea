var React = require("react");
var ReportData = require("./ReportData");

var ReportApp = React.createClass({

	getInitialState: function() {
		"use strict";

		return {YYYY_MM: "2015_01"};
	},

	render: function() {
		"use strict";

		var url = "/api/v1/reports/" + this.state.YYYY_MM;

		return (
			<div>
				<h3 className="sub-header">Approve a report</h3>
			  <div className="row placeholders">
			    <form action={url} method="GET" className="form-horizontal">
			      <fieldset>
			        <div className="form-group">
			          <label for="customid" className="col-md-2 control-label">Custom ID</label>
			          <div className="col-md-3">
			            <select id="customid" name="customid" className="form-control input-md">
			              <option value="Royal_Albert_Hall">Royal Albert Hall</option>
			            </select>
			          </div>
			          <div className="col-md-1">
			            <button id="submit" type="submit" className="btn btn-primary">View</button>
			          </div>
			          <div className="col-md-1">
			            <button id="submit" name="csv" value="true" type="submit" className="btn btn-primary">Download</button>
			          </div>
			          <div className="col-md-1">
			            <button id="submit" name="submit" type="submit" className="btn btn-primary">Approve</button>
			          </div>
			        </div>
			      </fieldset>
			    </form>
			  </div>
			  <ReportData />
		  </div>
		);

	}

});

module.exports = ReportApp;
