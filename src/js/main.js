var React 		 = require("react");
var request 	 = require("superagent");
var ReportData = require("./components/ReportData");
var Griddle    = require("griddle-react");

var data;


var ReportPage = React.createClass({
	ajaxCall : function() {
		"use strict";
		request
			.get("api/v1/reports/2015_01/Royal_Albert_Hall")
			.end(function(err, res) {
				if (err) console.log("AJAX error: " + err);
				this.setState({data : res.body[0]});
			}.bind(this));
	},
	getInitialState: function() {
		"use strict";
    var initial = { "results": [],
        "currentPage": 0,
        "maxPages": 0,
        "externalResultsPerPage": 5,
        "externalSortColumn": null,
        "externalSortAscending": true
    };
    return initial;
    },
	componentDidMount: function() {
		"use strict";
		this.ajaxCall();
	},
	setPage : function(index) {
		"use strict";
		return null;
	},
	changeSort: function() {
		"use strict";
		return null;
	},
	setFilter: function(){
		"use strict";
		return null;
	},
	setPageSize: function() {
		"use strict";
		return 50;
	},
	render: function() {
		"use strict";
		console.log(this.state.data);
		 return <Griddle useExternal={true} externalSetPage={this.setPage}
        externalChangeSort={this.changeSort} externalSetFilter={this.setFilter}
        externalSetPageSize={this.setPageSize} externalMaxPage={this.state.maxPages}
        externalCurrentPage={this.state.currentPage} results={this.state.data}
        resultsPerPage={this.state.externalResultsPerPage}
        externalSortColumn={this.state.externalSortColumn}
        externalSortAscending={this.state.externalSortAscending}
        showFilter={true} showSettings={false} />;
	}
});

React.render(
	<ReportPage />,
	document.getElementById("content")
	);
