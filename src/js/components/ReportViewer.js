var React 			   = require("react"),
		Button 				 = require("./Button"),
		ReportAPIUtils = require("../utils/ReportAPIUtils"),
		Griddle 			 = require("griddle-react");

var ReportViewer = React.createClass({

	render: function() {
		"use strict";
		var report = this.props.report,
				columns = ["RowKey", "Asset_Title", "Video_Title", "Total_Earnings"];

		var columnMeta = [
			{
				"columnName": "RowKey",
				"order": 1,
				"locked": false,
				"visible": true,
				"displayName": (report && report[0] && report[0].Custom_ID) ? "RowKey" : "Custom ID",
				"customComponent": CustomIDForm
			}
		];

		return (
			<div>
				<h3 className="sub-header">View Reports</h3>
				<div className="btn-group btn-group-justified tableSelector" role="group" aria-label="...">
					  <Button type="success" size="chief" 	 value="approved"   content="Approved"   onClickCallback={this.props.switchReportPanel} isLoading={this.props.loadingPanel==="approved"}/>
					  <Button type="success" size="appended" value="Fetch All"  content="All" 		   onClickCallback={this.props.getMoreResults} 		isDisabled={this.props.panel!=="approved"}/>
					  <Button type="info" 	 size="chief" 	 value="unapproved" content="Unapproved" onClickCallback={this.props.switchReportPanel} isLoading={this.props.loadingPanel==="unapproved"}/>
					  <Button type="info" 	 size="appended" value="Fetch All"  content="All"			   onClickCallback={this.props.getMoreResults} 		isDisabled={this.props.panel!=="unapproved"}/>
					  <Button type="warning" size="chief" 	 value="unassigned" content="Unassigned" onClickCallback={this.props.switchReportPanel} isLoading={this.props.loadingPanel==="unassigned"}/>
					  <Button type="warning" size="appended" value="Fetch All"  content="All" 			 onClickCallback={this.props.getMoreResults} 		isDisabled={this.props.panel!=="unassigned"}/>
				</div>
				<Griddle results={this.props.report}
					columnMetadata={columnMeta}
					columns={columns}
					tableClassName="table" showFilter={true}
					showSettings={true} className="DataTable"
					useGriddleStyles={false}
					enableInfiniteScroll={true} bodyHeight={800}
					useFixedHeader={true}
					settingsToggleClassName="btn btn-default"/>
			</div>
		);
	}
});

var CustomIDForm = React.createClass({

	onClick: function(e) {
		"use strict";
		e.preventDefault();

		var rowkey 	 = this.props.data,
				customid = React.findDOMNode(this.refs.customid).value;

		ReportAPIUtils.submitCustomID(this.props.rowData.PartitionKey, customid, rowkey);
	},

	render: function() {
		"use strict";
		var alreadyGotACustomID = this.props.rowData && this.props.rowData.Custom_ID,
				bouteille = (<span className="input-group-btn">
		        					<button className="btn btn-warning glyphicon glyphicon-ok" type="button" onClick={this.onClick}></button>
		      					</span>);


		return (
		    <div className="input-group">
		      {alreadyGotACustomID ? null : bouteille}
		      <input type="text" className="form-control" ref="customid" placeholder={alreadyGotACustomID ? this.props.data : "Custom ID"} disabled={alreadyGotACustomID}/>
		    </div>
		);
	}

});

module.exports = ReportViewer;
