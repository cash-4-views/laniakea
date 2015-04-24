var React 					= require("react"),
		ReportAlert 		= require("./ReportAlert"),
		ReportSelector 	= require("./ReportSelector"),
		ReportUploader 	= require("./ReportUploader"),
		ReportApprover  = require("./ReportApprover"),
		ReportViewer 		= require("./ReportViewer"),
		ReportAPIUtils 	= require("../utils/ReportAPIUtils");

var ReportApp = React.createClass({

	getInitialState: function() {
		"use strict";

		return {
			dates 			: null,
			YYYY_MM 		: null,
			customidList: null,
			panel 			: null,
			loadingPanel: null,
			loadingBtn  : true,
			alert 			: null,
			report 			: [],
			currentQuery: {},
			selectedID  : null
		};

	},

	componentDidMount: function() {
		"use strict";

		ReportAPIUtils.getReportList(function(datesFromServer) {
			if (this.isMounted()) {
				this.setState({dates: datesFromServer});
			}
		}.bind(this));

	},

	uploadReport: function(reportCSV) {
		"use strict";

		ReportAPIUtils.uploadReport(reportCSV);
	},

	selectReport: function(date) {
		"use strict";
			ReportAPIUtils.selectReportFromList(date, function(idsFromServer) {
				if(this.isMounted()) {
					this.setState({YYYY_MM: date, customidList: idsFromServer });
				}
			}.bind(this));

	},

	downloadReport: function(customid) {
		"use strict";

		ReportAPIUtils.downloadReportForID(this.state.YYYY_MM, customid);

	},

	approveReport: function(customid) {
		"use strict";

		this.setState({loadingBtn: true});
		ReportAPIUtils.approveReportForID(this.state.YYYY_MM, customid, function(alert) {
				if(this.isMounted()) {
					this.setState({alert: alert, loadingBtn: false});
				}
			}.bind(this));

	},

	changeSelected: function(selectedID) {
		"use strict";

		this.setState({selectedID: selectedID, loadingBtn: false});
	},

	switchReportPanel: function(panel) {
		"use strict";

		var queryObject = {};

		switch(panel) {
			case "approved":
			// Deliberate fallthrough to default

			case "unapproved":
				queryObject.customid = true;
				queryObject.approved = false;
				break;

			case "unassigned":
				queryObject.customid = false;
				break;

			default:
				queryObject.approved = true;
				break;

		}

		this.setState({
			panel: panel,
			loadingPanel: panel,
			// Unsure if this is a good thing - perhaps they should be able to refresh it
			report: (this.state.panel === panel) ? this.state.report : []
		});

		ReportAPIUtils.getReportRows(this.state.YYYY_MM, queryObject, null, this._onReceivingResults);

	},

	getMoreResults: function(getTheRest) {
		"use strict";

		this.setState({loadingPanel: this.state.panel});
		ReportAPIUtils.getReportRows(this.state.YYYY_MM, this.state.currentQuery, getTheRest, this._onReceivingResults);
	},

	submitCustomID: function(customid, rowkey) {
		"use strict";

		ReportAPIUtils.submitCustomID(this.state.YYYY_MM, customid, rowkey, function(alert) {
				if(this.isMounted()) {
					this.setState({alert: alert});
				}
			}.bind(this));
	},

	closeAlert: function() {
		"use strict";

		this.setState({alert: null});
	},

	render: function() {
		"use strict";
		var sections = [],
				topleft;

		if(this.state.dates) 				topleft = 	 (<ReportSelector key="ReportSelector"
																									dates={this.state.dates} selectReport={this.selectReport} />);
		if(this.state.alert)				sections.push(<ReportAlert key="ReportAlert" alert={this.state.alert}
																									closeAlert={this.closeAlert} />);
		if(this.state.customidList) sections.push(<ReportApprover key="ReportApprover"
																									customidList={this.state.customidList}
																									YYYY_MM={this.state.YYYY_MM}
																									selectedID={this.state.selectedID}
																									loadingBtn={this.state.loadingBtn}
																									downloadReport={this.downloadReport}
																									approveReport={this.approveReport}
																									changeSelected={this.changeSelected}/>);
		if(this.state.YYYY_MM) 			sections.push(<ReportViewer  key="ReportViewer"
																									report={this.state.report}
																									loadingPanel={this.state.loadingPanel}
																									panel={this.state.panel}
																									submitCustomID={this.submitCustomID}
																									switchReportPanel={this.switchReportPanel}
																									getMoreResults={this.getMoreResults} />);

		return (
			<div>
				<div className="row">
					<div className="col-md-6">
						{topleft}
					</div>
					<div className="col-md-6">
						<ReportUploader uploadReport={this.uploadReport}/>
					</div>
		  	</div>
		  	{sections}
		  </div>
		);

	},

	_onReceivingResults: function(results, token, queryObject) {
		"use strict";

		if(this.isMounted()) {
			if(token) {
				for(var prop in token) {
					queryObject[prop] = token[prop];
				}
			} else {
				delete queryObject.nextPartitionKey;
				delete queryObject.nextRowKey;
				delete queryObject.targetLocation;
			}

			this.setState({report: this.state.report.concat(results), currentQuery: queryObject, loadingPanel: null});
		}

	},

});

module.exports = ReportApp;
