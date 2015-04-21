var mailgun   = require("mailgun-js");

var messageTemplates = {

  approve: function (message, account) {
  	"use strict";

  	message.subject = "Your account has been approved";
  	message.text		= "Hi " + account.email.split("@")[0] + ". \n\nThank you for signing up to receive online revenue reports from Laniakea. Please add this email address to your contacts to avoid further communication being filtered as spam.";
  	return message;
  },

  notify: function (message, data) {
  	"use strict";

    message.subject = "Monthly report available";
    message.text    = "The PREVIOUS_MONTH revenue report is now available. Please visit 'https://www.w00d_chipper/login' to download it.";
    return message;
  }
};

function Messages(mailConfig) {
	"use strict";


	this.mailgun 					= mailgun({ apiKey : mailConfig.apiKey, domain : mailConfig.domain });
	this.mailLists 				= mailConfig.mailLists;
	this.domain 					= mailConfig.domain;
	this.list 	 					= this.mailgun.lists("members@" + this.domain);
}

Messages.prototype = {

	addToMailingList: function(data, onComplete) {
		"use strict";
		var self = this;

		self.list.members().create(data, function(err, data) {
			if (err) console.log("members err: " + err);
			console.log("member added to mailing list: " + data.member.name);
		});
	},


	// compose email components and send \\
	sendEmail: function(emailType, data, onComplete) {
		"use strict";
		var self = this;

		var message = self.createMessage(emailType, data);

		self.mailgun.messages().send(message, function(senderror) {
			if (senderror) {
				console.log("SendError: " + senderror);
			} else {
				console.log("Mail successfully sent to " + data.email);
			}
		});
	},

	getRecipient: function(data) {
		"use strict";
		var self = this;

		if(data.email.indexOf("@") !== -1) return data.email;

		var found = self.mailLists.filter (function(val, index) {
			return(val.name === data.email);
		});

		if (found.length === 1) {
			return found[0].email;
		}

		if (found.length === 0) {
			console.log("No matching email addresses found for" + data.email);
		}
	},


	createMessage: function(emailType, data) {
		"use strict";
		var self = this;

		var message = {
			from: "mail@" + self.domain
		};

		console.log("Message sent from :" + message.from);
		message.to = self.getRecipient(data);

		switch(emailType) {

			case "approve" :
				return messageTemplates.approve(message, data);

			case "notify" :
				return messageTemplates.notify(message, data);

			default:
				console.log("Message type not found, try again");
		}
	}

};

module.exports = Messages;
