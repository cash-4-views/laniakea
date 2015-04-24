var React 	 = require("react"),
		Griddle  = require("griddle-react"),
		fakeData = require("./fakedata.json");

var ReportData = React.createClass({

	onClick: function(e) {
		"use strict";

		e.preventDefault();
		this.props.switchReportPanel(e.target.value);
	},

	render: function() {
		"use strict";

		var columns = [];

		var columnMeta = [
		  {
		  "columnName": "chickendippers",
		  "order": 1,
		  "locked": false,
		  "visible": true,
		  "customComponent": CustomIDForm
		  }
		];

		return (
			<div>
				<h3 className="sub-header">View Reports</h3>
				<div>
					<div className="btn-group btn-group-justified" role="group" aria-label="...">
					  <div className="btn-group" role="group">
					    <button type="button" className="btn btn-success" value="approved" onClick={this.onClick}>Approved</button>
					  </div>
					  <div className="btn-group" role="group">
					    <button type="button" className="btn btn-info" value="unapproved" onClick={this.onClick}>Unapproved</button>
					  </div>
					  <div className="btn-group" role="group">
					    <button type="button" className="btn btn-warning" value="unassigned" onClick={this.onClick}>Unassigned</button>
					  </div>
					</div>
				</div>
				<Griddle results={this.props.report}
					tableClassName="table" showFilter={true}
					showSettings={true} className="DataTable"
					useGriddleStyles={false}
					enableInfiniteScroll={true} bodyHeight={800}
					useFixedHeader={true}/>
			</div>
		);
	}
});

var CustomIDForm = React.createClass({
	render: function() {
		"use strict";

		return (
			<form action="POST" url="/mejulie" >
				<input type="text" name="customid" value="" />
				<button type="submit" />
			</form>
			);
	}
});

module.exports = ReportData;
