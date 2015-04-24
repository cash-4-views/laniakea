var React  = require("react"),
		Button = require("./Button");

var ReportApprover = React.createClass({

	onClickCallback: function() {
		"use strict";

		var selectedID = React.findDOMNode(this.refs.customidselect).value;

		this.props.approveReport(selectedID);
	},

	onChange: function(e) {
		"use strict";

		this.props.changeSelected(e.target.value);
	},

	render: function() {
		"use strict";

		var customidArray = [],
				customids 		= this.props.customidList,
				downloadurl 	= this.props.selectedID ? "/api/v1/reports/" + this.props.YYYY_MM +
													"?customid=" + this.props.selectedID +
													"&csv=true" : null;

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
			            <select id="customid" ref="customidselect" className="form-control input-md" value={this.props.selectedID} onChange={this.onChange}>
			            	<option defaultValue="Select an ID"></option>
			            	{customidArray}
			            </select>
			          </div>
			          <div className="col-md-1 approver">
			            {this.props.selectedID ?
			            		<button className="btn btn-primary" value="download">
				          			<a href={downloadurl} id="dl" target="_blank">Download</a>
			            		</button> : <span /> }
			          </div>
			          <div className="col-md-1">
			          	{this.props.selectedID ?
				            <Button size="approver" value="approve" type="primary"
				            		isLoading={this.props.loadingBtn} onClickCallback={this.onClickCallback}
				            		isDisabled={false} content={this.props.loadingBtn ? "" : "Approve"} /> :
			          	<span />}
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
