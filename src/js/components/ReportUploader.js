var React = require("react");

var ReportUploader = React.createClass({

	onSubmit: function(e){
		"use strict";
		var self = this;

		e.preventDefault();

		var file 	 = React.findDOMNode(this.refs["upload-report"]).files[0],
				reader = new FileReader();

				reader.onload = function(upload) {
					self.props.uploadReport(upload.target.result);
				};

				reader.readAsBinaryString(file);
	},

	render: function() {
		"use strict";

		return (
			<div>
				<h3 className="sub-header">Upload a CSV report</h3>
			  <div className="row placeholders">
			    <form action="/api/v1/reports" method="POST" encType="multipart/form-data" className="form-horizontal">
			      <div className="form-group">
			        <label className="col-md-4 control-label">Upload Your File</label>
			        <div className="col-md-4">
			          <input ref="upload-report" id="upload" name="upload-report" type="file" className="input-file"/>
			        </div>
			        <div className="col-md-1">
			          <button id="submit" type="submit" value="Upload" className="btn btn-primary">Upload</button>
			        </div>
			      </div>
			    </form>
			  </div>
		  </div>
		);
	}
});

module.exports = ReportUploader;
