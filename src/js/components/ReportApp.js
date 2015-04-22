var React 					= require("react"),
		request 				= require("superagent"),
		ReportSelector 	= require("./ReportSelector"),
		ReportApprover  = require("./ReportApprover"),
		ReportViewer 		= require("./ReportViewer");

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

		request.get("/api/v1/reports")
						.end(function(err, res){
							if (this.isMounted()) {
								var dates = res.body;
								console.log(res);
								this.setState({dates: dates});
							}
					  }.bind(this));
	},

	selectReport: function(date) {
		"use strict";

		request.get("/api/v1/reports/customidList")
						.query({date: date})
						.end(function(err, res) {
							if(this.isMounted()) {
								var idObj = res.body;
								this.setState({YYYY_MM: date, customidList: idObj});
							}
						}.bind(this));
	},

	downloadReport: function(customid) {
		"use strict";
		// Why is this not downloading? Response comes correctly but doesn't download
		request.get("/api/v1/reports/" + this.state.YYYY_MM)
						.query({customid: customid, csv: true})
						.end();
	},

	approveReport: function(customid) {
		"use strict";

		request.put("/api/v1/approvedlist/" + customid)
						.send({YYYY_MM: this.state.YYYY_MM})
						.end(function(err, res) {
							if(this.isMounted()) {
								if(err) console.log(err);
								else {
									console.log(res);
									this.setState({alert: res});
								}
							}
						}.bind(this));
	},

	switchReportPanel: function(panel) {
		"use strict";

		var queryObject = {};

		if(panel === "approved") queryObject.approved = true;
		else if(panel === "unapproved") {
			queryObject.customid = true;
			queryObject.approved = false;
		}
		else if(panel === "unassigned") queryObject.customid = false;

		this.setState({panel: panel, report: []});
		request.get("/api/v1/reports/" + this.state.YYYY_MM)
						.query(queryObject)
						.end(this._onReceivingResults);
	},

	getMoreResults: function() {
		"use strict";

		var queryObject = this.state.currentQuery;

		request.get("/api/v1/reports" + this.state.YYYY_MM)
						.query(queryObject)
						.end(this._onReceivingResults);
	},

	_onReceivingResults: function(err, res) {
		"use strict";

		if(this.isMounted()) {
			if(err) console.log(err);
			else {
				var queryObject = this.state.currentQuery;
				console.log(res);
				if(res.body.token) {
					for(var prop in res.body.token) {
						queryObject[prop] = res.body.token[prop];
					}
				} else {
					delete queryObject.nextPartitionKey;
					delete queryObject.nextRowKey;
					delete queryObject.targetLocation;
				}
				this.setState({report: this.state.report.concat(res.body.results), currentQuery: queryObject});
			}
		}
	},

	render: function() {
		"use strict";
		var sections = [];

		if(this.state.dates) 				sections.push(<ReportSelector dates={this.state.dates} selectReport={this.selectReport} />);
		if(this.state.customidList) sections.push(<ReportApprover customidList={this.state.customidList}
																								downloadReport={this.downloadReport}
																								approveReport={this.approveReport} />);
		if(this.state.YYYY_MM) 			sections.push(<ReportViewer report={this.state.report}
																								switchReportPanel={this.switchReportPanel}
																								getMoreResults={this.getMoreResults} />);

		return (
			<div>
				{sections}
		  </div>
		);

	}

});

module.exports = ReportApp;
