var React 			   = require("react"),
		ButtonTray 		 = require("./ButtonTray"),
		ReportAPIUtils = require("../../utils/ReportAPIUtils"),
		Griddle 			 = require("griddle-react");

var ReportViewer = React.createClass({

	render: function() {
		"use strict";
		var report = this.props.report,
				columns = ["RowKey", "Asset_Title", "Video_Title", "Total_Earnings", "Video_ID", "Total_Views"];

		var columnMeta = [
			{
				"columnName": "RowKey",
				"order": 1,
				"locked": false,
				"visible": true,
				"displayName": "Custom ID",
				"customComponent": CustomIDForm
			},
			{
				"columnName": "Custom_ID",
				"order": 2,
				"locked": false,
				"visible": true,
				"displayName": "Custom ID (sort)"
			},

		];

		return (
			<div>
				<h3 className="sub-header">View Reports</h3>
				<ButtonTray switchReportPanel={this.props.switchReportPanel} getMoreResults={this.props.getMoreResults} loadingPanel={this.props.loadingPanel} panel={this.props.panel} />
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

	getInitialState: function() {
		"use strict";

		return({status: null});
	},

	onClick: function(e) {
		"use strict";
		var self = this;

		e.preventDefault();

		this.setState({status: "Clicked!"});

		var rowkey 	 = this.props.data,
				customid = React.findDOMNode(this.refs.customid).value;

		ReportAPIUtils.submitCustomID(this.props.rowData.PartitionKey, customid, rowkey, function(alert) {
			console.log("done");
			self.setState({status: alert.type});
		});
	},

	render: function() {
		"use strict";
		var buttonClass;

		switch (this.state.status) {

			case "Success!":
				buttonClass = "btn btn-info glyphicon glyphicon-ok";
				break;

			case "Error!":
				buttonClass = "btn btn-danger glyphicon glyphicon-remove";
				break;

			case "Clicked!":
				buttonClass = "btn btn-warning";
				break;

			default:
				buttonClass = "btn btn-warning glyphicon glyphicon-edit";
				break;
		}

		var loadingAnimation = (<div className="but spinner">
														  <div className="cube1"></div>
														  <div className="cube2"></div>
														</div>);

		var alreadyGotACustomID = this.props.rowData && this.props.rowData.Custom_ID,
				bouteille = (<span className="input-group-btn">
		        					<button className={buttonClass} type="button" onClick={this.onClick} disabled={this.state.status !== null} >
		        						{this.state.status === "Clicked!" ? loadingAnimation : <span />}
		        					</button>
		      					</span>);


		return (
		    <div className="input-group">
		      {alreadyGotACustomID ? null : bouteille}
		      <input type="text" className="form-control" ref="customid" placeholder={alreadyGotACustomID ? this.props.rowData.Custom_ID : "Enter a Custom ID"} disabled={alreadyGotACustomID || this.state.status !== null} />
		    </div>
		);
	}

});

var NumericField = React.createClass({

	render: function() {
		"use strict";

		return(
			<span>parseInt(this.props.data, 10)</span>
			);
	}

});

module.exports = ReportViewer;
