var React 					= require("react"),
		ReportAlert 		= require("../common/Alert"),
		ReportSelector 	= require("./ReportSelector"),
		ReportUploader 	= require("./ReportUploader"),
		ReportApprover  = require("./ReportApprover"),
		ReportViewer 		= require("./ReportViewer"),
		ReportAPIUtils 	= require("../../utils/ReportAPIUtils"),
		CommonAPIUtils  = require("../../utils/CommonAPIUtils");

var ReportApp = React.createClass({

	getInitialState: function() {
		"use strict";

		return {
			dates 			: null,
			YYYY_MM 		: null,
			customidList: null,
			panel 			: null,
			loadingPanel: null,
			loadingBtn  : false,
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

		CommonAPIUtils.getCustomIDList(date, function(idsFromServer) {
			if(this.isMounted()) {
				if(this.state.YYYY_MM === date) {
					this.setState({YYYY_MM: date, customidList: idsFromServer });
				} else {
					this.setState({YYYY_MM: date, customidList: idsFromServer, report: [],
													selectedID: null, panel: null, loadingPanel: null});
				}
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
			loadingPanel: panel,
			// Unsure if this is a good thing - perhaps they should be able to refresh it
			report: (this.state.panel === panel) ? this.state.report : []
		});

		ReportAPIUtils.getReportRows(this.state.YYYY_MM, queryObject, null, function(results, token, queryObj) {
			if(panel === this.state.loadingPanel) {
				this._onReceivingResults(results, token, queryObj);
			}
		}.bind(this));

	},

	getMoreResults: function(getTheRest) {
		"use strict";

		this.setState({loadingPanel: this.state.panel});
		ReportAPIUtils.getReportRows(this.state.YYYY_MM, this.state.currentQuery, getTheRest, function(results, token, queryObj) {
			if(this.state.panel === this.state.loadingPanel) {
				this._onReceivingResults(results, token, queryObj);
			}
		}.bind(this));
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
				s 			 = this.state,
				topleft;

		if(s.dates) 				topleft = 	 (<ReportSelector key="ReportSelector" YYYY_MM={s.YYYY_MM} dates={s.dates} selectReport={this.selectReport} />);
		if(s.alert)					sections.push(<Alert  	key="Alert"  	 alert={s.alert} closeAlert={this.closeAlert} />);

		if(s.customidList) 	sections.push(<ReportApprover key="ReportApprover" customidList={s.customidList} YYYY_MM={s.YYYY_MM}
																					selectedID={s.selectedID} loadingBtn={s.loadingBtn} downloadReport={this.downloadReport}
																					approveReport={this.approveReport} changeSelected={this.changeSelected}/>);

		if(s.YYYY_MM) 			sections.push(<ReportViewer  	key="ReportViewer" report={s.report} loadingPanel={s.loadingPanel} panel={s.panel}
																					submitCustomID={this.submitCustomID} 	 switchReportPanel={this.switchReportPanel}
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

			var newReport = this.state.report.concat(results).map(function(ele) {
				for(var prop in ele) {
					ele[prop] = +ele[prop] || ele[prop];
				}
				return ele;
			});

			this.setState({report: newReport, currentQuery: queryObject, panel: this.state.loadingPanel, loadingPanel: null});
		}

	},

});

module.exports = ReportApp;
