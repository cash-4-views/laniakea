var React  = require("react"),
		Button = require("../common/Button");

var ButtonTray = React.createClass({

	render: function() {
		"use strict";

		var currentPanel = this.props.panel;

		function activePanelClass(panel) {
			if(currentPanel === panel) {
				return "selected";
			} else return "unselected";
		}

		return (
			<div className="btn-group btn-group-justified tableSelector" role="group" aria-label="...">
				  <Button type={"success " + activePanelClass("approved")} 	 size="chief" 	 value="approved"   content="Approved"
				  				onClickCallback={this.props.switchReportPanel} isLoading={this.props.loadingPanel==="approved"} />
				  <Button type="success" 																		 size="appended" value="Fetch All"  content="All"
				  				onClickCallback={this.props.getMoreResults} 		isDisabled={this.props.panel!=="approved"} 		  />
				  <Button type={"info " + activePanelClass("unapproved")} 	 size="chief" 	 value="unapproved" content="Unapproved"
				  				onClickCallback={this.props.switchReportPanel} isLoading={this.props.loadingPanel==="unapproved"}/>
				  <Button type="info" 																			 size="appended" value="Fetch All"  content="All"
				  				onClickCallback={this.props.getMoreResults} 		isDisabled={this.props.panel!=="unapproved"} 		 />
				  <Button type={"warning " + activePanelClass("unassigned")} size="chief" 	 value="unassigned" content="Unassigned"
				  				onClickCallback={this.props.switchReportPanel} isLoading={this.props.loadingPanel==="unassigned"}/>
				  <Button type="warning" 																		 size="appended" value="Fetch All"  content="All"
				  				onClickCallback={this.props.getMoreResults} 		isDisabled={this.props.panel!=="unassigned"} 		 />
			</div>
			);
	}
});

module.exports = ButtonTray;
