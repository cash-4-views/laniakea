var React  = require("react"),
		Button = require("../common/Button");

var Alert = React.createClass({

	render: function() {
		"use strict";

		var closeIcon = <span aria-hidden="true">&times;</span>;
		var color = this.props.alert.type === "Success!" ? "success" : "danger";
		return(
			<div className={"alert alert-" + color + " alert-dismissible"} role="alert">
				<Button size="small close" isDisabled={false} onClickCallback={this.props.closeAlert} content={closeIcon}/>
			  <strong>{this.props.alert.type + " "}</strong>
			  {this.props.alert.content}
			</div>
			);
	}
});

module.exports = Alert;
