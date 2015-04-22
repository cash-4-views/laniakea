var React 	 = require("react"),
		Griddle  = require("griddle-react"),
		fakeData = require("./fakedata.json");

var ReportData = React.createClass({
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
				<div>
					<div className="btn-group btn-group-justified" role="group" aria-label="...">
					  <div className="btn-group" role="group">
					    <button type="button" className="btn btn-default">Approved</button>
					  </div>
					  <div className="btn-group" role="group">
					    <button type="button" className="btn btn-default">Unapproved</button>
					  </div>
					  <div className="btn-group" role="group">
					    <button type="button" className="btn btn-default">Unassigned</button>
					  </div>
					</div>
				</div>
				<Griddle results={fakeData}
					tableClassName="table" showFilter={true}
					columnMetadata={columnMeta}
					showSettings={true} className="DataTable"
					useGriddleStyles={false} />
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
