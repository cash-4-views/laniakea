var React 					= require("react"),
		ReportSelector 	= require("./ReportSelector"),
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
			report 			: [],
			currentQuery: {}
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

	selectReport: function(date) {
		"use strict";
			ReportAPIUtils.selectReportFromList(date, function(idsFromServer) {
				if(this.isMounted()) {
					this.setState({YYYY_MM: date, customidList: idsFromServer});
				}
			}.bind(this));

	},

	downloadReport: function(customid) {
		"use strict";

		ReportAPIUtils.downloadReportForID(this.state.YYYY_MM, customid);

	},

	approveReport: function(customid) {
		"use strict";

		ReportAPIUtils.approveReportForID(this.state.YYYY_MM, customid, function(alert) {
				if(this.isMounted()) {
					this.setState({alert: alert});
				}
			}.bind(this));

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
			// Unsure if this is a good thing - perhaps they should be able to refresh it
			report: (this.state.panel === panel) ? this.state.report : []
		});

		ReportAPIUtils.getReportRows(this.state.YYYY_MM, queryObject, null, this._onReceivingResults);

	},

	getMoreResults: function(getTheRest) {
		"use strict";

		ReportAPIUtils.getReportRows(this.state.YYYY_MM, this.state.currentQuery, getTheRest, this._onReceivingResults);

	},

	submitCustomID: function(customid, rowkey) {
		"use strict";

		ReportAPIUtils.submitCustomID(this.state.YYYY_MM, customid, rowkey, function(success) {
			console.log(success);
		});
	},


	render: function() {
		"use strict";
		var sections = [];

		if(this.state.dates) 				sections.push(<ReportSelector dates={this.state.dates} selectReport={this.selectReport} />);
		if(this.state.customidList) sections.push(<ReportApprover customidList={this.state.customidList}
																								downloadReport={this.downloadReport}
																								approveReport={this.approveReport} />);
		if(this.state.YYYY_MM) 			sections.push(<ReportViewer report={this.state.report}
																								panel={this.state.panel}
																								submitCustomID={this.submitCustomID}
																								switchReportPanel={this.switchReportPanel}
																								getMoreResults={this.getMoreResults} />);

		return (
			<div>
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

			this.setState({report: this.state.report.concat(results), currentQuery: queryObject});
		}

	},

});

module.exports = ReportApp;
