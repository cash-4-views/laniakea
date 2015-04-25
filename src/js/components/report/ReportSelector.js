var React = require("react");

var ReportHeader = React.createClass({

	onSubmit: function(e) {
		"use strict";

		e.preventDefault();

		var selectedDate = React.findDOMNode(this.refs.reportselect).value;
		this.props.selectReport(selectedDate);
	},

	render: function() {
		"use strict";

		var datesList = [],
				dates 		= this.props.dates,
				downloadurl 	= this.props.YYYY_MM ? "/api/v1/reports/" + this.props.YYYY_MM +
													"?csv=true&getAll=true" : null;

		// Value should actually just be date, but currently workaround b/c database stored
		// as yYYYY_MM rather than _YYYY_MM
		for(var date in dates) {
			datesList.push( <option key={dates[date]} value={dates[date]}>{dates[date]}</option> );
		}

		return (
			<div>
				<h3 className="sub-header">Select a report</h3>
				  <div className="row placeholders">
				    <form className="form-horizontal" onSubmit={this.onSubmit}>
				      <fieldset>
				        <div className="form-group">
				          <label className="col-md-2 control-label">Date</label>
				          <div className="col-md-6">
				            <select id="YYYY_MM" ref="reportselect" className="form-control input-md">
				              {datesList}
				            </select>
				          </div>
				          <div className="col-md-1">
				            <button type="submit" className="btn btn-primary" onSubmit={this.onSubmit}>Select</button>
				          </div>
				          {this.props.YYYY_MM ?
					          <div className="col-md-1">
				            	<button type="submit" className="btn btn-primary">
				            		<a href={downloadurl} id="dl" target="_blank">Download</a>
				            	</button>
					          </div> : <span />
				          }
				        </div>
				      </fieldset>
				    </form>
				  </div>
				</div>
			);
	}

});

module.exports = ReportHeader;
