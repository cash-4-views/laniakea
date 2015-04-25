var React 		 = require("react"),
		ReportApp  = require("./report/ReportApp"),
		AccountApp = require("./account/AccountApp");

var AppHolder = React.createClass({

	getInitialState: function() {
		"use strict";

		return {currentPage: "accounts"};
	},

	switchPage: function(page) {
		"use strict";

		this.setState({currentPage: page});
	},

	render: function() {
		"use strict";

		return (
			<div>
				<nav className="navbar navbar-inverse navbar-fixed-top">
				  <div className="container-fluid">
				    <div className="navbar-header">
				      <button type="button" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar" className="navbar-toggle collapsed">
				      	<span className="sr-only">Toggle navigation</span>
				      	<span className="icon-bar"></span>
				      	<span className="icon-bar"></span>
				      	<span className="icon-bar"></span>
				      </button>
				      <a href="#" className="navbar-brand">Laniakea</a>
				    </div>
				    <div id="navbar" className="navbar-collapse collapse">
				      <ul className="nav navbar-nav navbar-right">
				        <li><a onClick={this.switchPage.bind(this, "accounts")} className={this.state.currentPage === "accounts" ? "activetab" : undefined}>Accounts</a></li>
				        <li><a onClick={this.switchPage.bind(this, "reports")} className={this.state.currentPage === "reports" ? "activetab" : undefined}>Reports</a></li>
				        <li><a href="/logout">Logout</a></li>
				      </ul>
				    </div>
				  </div>
				</nav>
				<div className="container-fluid">
				  <div className="row">
				    <div className="col-sm-2 col-md-1 sidebar">
				      <ul className="nav nav-sidebar"></ul>
				    </div>
				    <div className="col-sm-10 col-sm-offset-2 col-md-11 col-md-offset-1 main">
				      <h1 className="page-header">{this.state.currentPage[0].toUpperCase() + this.state.currentPage.slice(1)}</h1>
							{this.state.currentPage === "accounts" ? <AccountApp /> : <ReportApp />}
				    </div>
				  </div>
				</div>
			</div>
			);
	}

});

module.exports = AppHolder;
