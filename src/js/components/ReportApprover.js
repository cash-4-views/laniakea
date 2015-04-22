var React = require("react");

var ReportApprover = React.createClass({

	onClick: function(e) {
		"use strict";

		e.preventDefault();

		var selectedID = React.findDOMNode(this.refs.customidselect).value,
				buttonClicked = e.target.value;

		switch(buttonClicked) {

			case "download":
				this.props.downloadReport(selectedID);
				break;

			case "approve":
				this.props.approveReport(selectedID);
				break;

			default:
				return;
		}
	},

	render: function() {
		"use strict";

		var customidArray = [],
				customids 		= this.props.customidList;

		for(var customid in customids) {
			customidArray.push(<option key={customids[customid]} value={customids[customid]}>{customids[customid]}</option>);
		}

		return (
			<div>
				<h3 className="sub-header">Approve a report</h3>
			  <div className="row placeholders">
			    <form className="form-horizontal">
			      <fieldset>
			        <div className="form-group">
			          <label for="customid" className="col-md-2 control-label">Custom ID</label>
			          <div className="col-md-3">
			            <select id="customid" ref="customidselect" className="form-control input-md">
			            	{customidArray}
			            </select>
			          </div>
			          <div className="col-md-1">
			            <button id="submit" value="view" className="btn btn-primary" onClick={this.onClick}>View</button>
			          </div>
			          <div className="col-md-1">
			            <button id="submit" value="download" className="btn btn-primary" onClick={this.onClick}>Download</button>
			          </div>
			          <div className="col-md-1">
			            <button id="submit" value="approve" className="btn btn-primary" onClick={this.onClick}>Approve</button>
			          </div>
			        </div>
			      </fieldset>
			    </form>
			  </div>
			 </div>
			);
	}

});

module.exports = ReportApprover;
