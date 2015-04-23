var React = require("react");

var Button = React.createClass({

	onClick: function(e) {
		"use strict";

		e.preventDefault();
		this.props.onClickCallback(e.target.value);

	},

	render: function() {
		"use strict";

		return(
			<div className="btn-group" role="group">
			  <button type="button" className={"btn btn-"+this.props.type} value={this.props.value} onClick={this.onClick}>{this.props.value[0].toUpperCase() + this.props.value.slice(1)}</button>
			</div>
			);
	}
});

module.exports = Button;
