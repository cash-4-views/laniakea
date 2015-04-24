var React = require("react");

var Button = React.createClass({

	onClick: function(e) {
		"use strict";

		e.preventDefault();
		this.props.onClickCallback(e.target.value);

	},

	render: function() {
		"use strict";

		var loader = (
			<div className="spinner">
			  <div className="cube1"></div>
			  <div className="cube2"></div>
			</div>
			);

		return(
			<div className={"btn-group carrier "+this.props.size}  role="group">
			  <button type="button" className={"btn btn-"+this.props.type}
			  				value={this.props.value} disabled={this.props.isDisabled}
			  				onClick={this.onClick}>
			  				{this.props.content}
			  </button>
			  {this.props.isLoading ? loader : undefined}
			</div>
			);
	}
});

module.exports = Button;
