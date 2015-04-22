var React 		 = require("react");
var request 	 = require("superagent");

var ReportApp = require("./components/ReportApp");

var dataArray;


var ReportPage = React.createClass({
	ajaxCall : function() {
		"use strict";
		request
			.get("api/v1/reports/2015_01/Royal_Albert_Hall")
			.end(function(err, res) {
				if (err) console.log("AJAX error: " + err);
				console.log("ajax call finished");
				this.setState({data : res.body[0]});
				console.log("state set");
				console.log(this.state.data);
			}.bind(this));
	},
	getInitialState: function() {
		"use strict";
		return {data: []};
	},
	componentDidMount: function() {
		"use strict";
		this.ajaxCall();
		console.log("AJAX called");
		console.log(this.state.data);
	},
	render: function() {
		"use strict";
		return(
			<ReportData />
		);
	}
});

React.render(
	<ReportPage />,
	document.getElementById("content")
);
