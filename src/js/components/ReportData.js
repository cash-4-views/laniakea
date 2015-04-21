var React 	 = require("react"),
		Griddle  = require("griddle-react"),
		fakeData = require("./fakedata.json");

var ReportData = React.createClass({
	render: function() {
		"use strict";

		var columns = [];

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
					showSettings={true} className="DataTable"
					useGriddleStyles={false} />
			</div>
		);
	}
});

var CustomIDForm = React.createClass({
	render: function() {
		"use strict";

		var url = "/submit/" + this.props.rowData.state;

		return (
			<form action="POST" url={url} onSubmit={this.onSubmit}>
				<input type="text" name="customid" value="" onChange={this.onChange}/>
				<button type="submit" onSubmit={this.onSubmit}/>
			</form>
			);
	}
});

module.exports = ReportData;
