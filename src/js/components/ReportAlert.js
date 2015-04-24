var React = require("react"),
		Button = require("./Button");

var ReportAlert = React.createClass({

	render: function() {
		"use strict";

		var closeIcon = <span aria-hidden="true">&times;</span>;

		return(
			<div className="alert alert-success alert-dismissible" role="alert">
				<Button size="small close" isDisabled={false} onClickCallback={this.props.closeAlert} content={closeIcon}/>
			  <strong>{this.props.alert.type}</strong>
			  {" " + this.props.alert.content}
			</div>
			);
	}
});

module.exports = ReportAlert;
