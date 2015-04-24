var React 			   = require("react"),
		ButtonTray 		 = require("./ButtonTray"),
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
				"displayName": "RowKey",
				"customComponent": CustomIDForm
			}
		];

		return (
			<div>
				<h3 className="sub-header">View Reports</h3>
				<ButtonTray switchReportPanel={this.props.switchReportPanel} getMoreResults={this.props.switchReportPanel} loadingPanel={this.props.loadingPanel} panel={this.props.panel} />
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

		ReportAPIUtils.submitCustomID(this.props.rowData.PartitionKey, customid, rowkey, function(alert) {console.log(alert);});
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
		      <input type="text" className="form-control" ref="customid" placeholder={alreadyGotACustomID ? this.props.data : "Enter a Custom ID"} disabled={alreadyGotACustomID}/>
		    </div>
		);
	}

});

module.exports = ReportViewer;
