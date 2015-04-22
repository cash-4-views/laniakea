var React 					= require("react"),
		request 				= require("superagent"),
		ReportSelector 	= require("./ReportSelector"),
		ReportApprover  = require("./ReportApprover"),
		ReportData 			= require("./ReportData");

var ReportApp = React.createClass({

	getInitialState: function() {
		"use strict";

		return {
			dates: null,
			YYYY_MM: null,
			customidList: null,
			report: null,
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
								else console.log(res.body);
							}
						}.bind(this));
	},

	render: function() {
		"use strict";
		var sections = [];

		if(this.state.dates) 				sections.push(<ReportSelector dates={this.state.dates} selectReport={this.selectReport}/>);
		if(this.state.customidList) sections.push(<ReportApprover customidList={this.state.customidList}
																								downloadReport={this.downloadReport}
																								approveReport={this.approveReport}/>);
		if(this.state.report) 			sections.push(<ReportData report={this.state.report} />);

		return (
			<div>
				{sections}
		  </div>
		);

	}

});

module.exports = ReportApp;
