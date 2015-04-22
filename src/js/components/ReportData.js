var React = require("react");
var Griddle = require("griddle-react");

var ReportData = React.createClass({
	render: function() {
		"use strict";
		console.log(this.props.data);
		return (
			<div className="DataTable" >
				<h4> ReportData </h4>
				<Griddle results={this.props.data} columns={["Album", "UGC"]} noDataMessage={"Please wait while data loads"}/>
			</div>
		);
	}
});

module.exports = ReportData;
