var mailgun   = require("mailgun-js");

var messageTemplates = {

  approve: function (message, customid) {
  	"use strict";

  	message.subject = "Your account has been approved";
  	message.text		= "Hi " + customid + ". \n\nThank you for signing up to receive online revenue reports from Laniakea. Please add this email address to your contacts to avoid further communication being filtered as spam.";
  	return message;
  },

  notify: function (message, data) {
  	"use strict";

    message.subject = "Monthly report available";
    message.text    = "A new revenue report is now available. Please visit 'https://www.w00d_chipper/account' to download it.";
    return message;
  }
};

function getMessageTemplates(emailType, message, customid, callback) {
	"use strict";

			var templatedMessage;

			switch(emailType) {

				case "approve" :
					templatedMessage = messageTemplates.approve(message, customid);
					break;

				case "notify" :
					templatedMessage = messageTemplates.notify(message, customid);
					break;

				default:
					console.log("Message type not found, try again");
			}
			return callback(null, templatedMessage);

}

function Messages(mailConfig) {
	"use strict";


	this.mailgun 					= mailgun({ apiKey : mailConfig.apiKey, domain : mailConfig.domain });
	this.mailLists 				= "members@" + mailConfig.domain;
	this.domain 					= mailConfig.domain;
	this.list 	 					= this.mailgun.lists(this.mailLists);
}

Messages.prototype = {

	addToMailingList: function(account, onComplete) {
		"use strict";
		var self = this;

		self.list.members().create(account, function(err, res) {
			if (err) console.log("members err: " + err);
			console.log("member added to mailing list: " + account.address);
		});
	},


	// compose email components and send \\
	sendEmail: function(emailType, email, customid, onComplete) {
		"use strict";
		var self = this;

		self.createMessage(emailType, email, customid, function(err, message) {
			self.mailgun.messages().send(message, function(senderror) {
				if (senderror) {
					console.log("SendError: " + senderror);
					return onComplete(senderror);
				} else {
					console.log("Mail successfully sent to " + message.to);
					return onComplete(null, message.to);
				}
		});
		});
	},

	getRecipient: function(customid, callback) {
		"use strict";
		var self = this;

		self.list.members().list(function(errList, body) {
			if (errList) console.log("list err: " + errList);
			console.log(body);
			self.searchMailList(customid, body.items, function(err, memberEmail) {
				if(err) return callback(err);
				else 		return callback(null, memberEmail);
			});
		});
	},

	searchMailList: function(customid, members, callback) {
		"use strict";
		var self = this;
		members.forEach(function(member) {
			if (customid === member.name) {
				callback(null, member.address);
				return true;
			}
		});
	},

	createMessage: function(emailType, email, customid, callback) {
		"use strict";
		var self = this;
		if(!email) {
			self.getRecipient(customid, function(error, emailAddress) {

				var message = {
					from: "mail@" + self.domain,
					to: emailAddress
				};

				getMessageTemplates(emailType, message, customid, callback);
			});
		}	else {
				var message = {
					from: "mail@" + self.domain,
					to: email
				};

			getMessageTemplates(emailType, message, customid, callback);
		}
	}

};

module.exports = Messages;
