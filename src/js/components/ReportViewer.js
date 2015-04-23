var React 	= require("react"),
		Button 	= require("./Button"),
		Griddle = require("griddle-react");

var ReportViewer = React.createClass({

	render: function() {
		"use strict";
		return (
			<div>
				<h3 className="sub-header">View Reports</h3>
				<div>
					<div className="btn-group btn-group-justified tableSelector" role="group" aria-label="...">
					  <Button type="success" value="approved" onClickCallback={this.props.switchReportPanel} />
					  <Button type="info" value="unapproved" onClickCallback={this.props.switchReportPanel} />
					  <Button type="warning" value="unassigned" onClickCallback={this.props.switchReportPanel} />
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

module.exports = ReportViewer;
