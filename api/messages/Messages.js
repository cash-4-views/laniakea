"use strict";

var mailgun   = require("mailgun-js");

var messageTemplates = {

  approve: function (message, customid) {

  	message.subject = "Laniakea - Your account has been approved";
  	message.text		= "Thank you for signing up to receive online revenue reports from Laniakea. Please add this email address to your contacts to avoid further communication being filtered as spam.";
  	return message;
  },

  notify: function (message, data) {

    message.subject = "Laniakea - Monthly YouTube revenue report available";
    message.text    = "A new revenue report is available. Please visit http://wood-chipper.azurewebsites.net/ to download it.";
    return message;
  }
};

function getMessageTemplates(emailType, message, customid, callback) {

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


	this.mailgun 					= mailgun({ apiKey : mailConfig.apiKey, domain : mailConfig.domain });
	this.mailLists 				= "members@" + mailConfig.domain;
	this.domain 					= mailConfig.domain;
	this.list 	 					= this.mailgun.lists(this.mailLists);
}

Messages.prototype = {

	addToMailingList: function(account, onComplete) {
		var self = this;

		self.list.members().create(account, function(err, res) {
			if(err) return onComplete(err);
			else 		return onComplete(null);
		});
	},

	deleteFromMailingList: function(email, onComplete) {
		var self = this;

		self.list.members(email).delete(function(err, res) {
			if(err) return onComplete(err);
			else 		return onComplete(null);
		});
	},

	updateMailingListAccount: function(email, updateMailObj, onComplete) {
		var self = this;

		self.list.members(email).update(updateMailObj, function(err, res) {
			if(err) return onComplete(err);
			else 		return onComplete(null);
		});
	},

	// compose email components and send \\
	sendEmail: function(emailType, email, customid, onComplete) {
		var self = this;

		self.createMessage(emailType, email, customid, function(err, message) {
			if(err && err === 404) return onComplete(404);

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
		var self = this;

		self.list.members().list(function(errList, body) {
			if (errList) console.log("list err: " + errList);

			self.searchMailList(customid, body.items, function(err, memberEmail) {
				if(err) return callback(err);
				else 		return callback(null, memberEmail);
			});
		});
	},

	searchMailList: function(customid, members, callback) {
		var self = this;

		var foundone;

		members.forEach(function(member, ind) {

			if (customid === member.name) {
				foundone = true;
				callback(null, member.address);
			} else if (ind === members.length-1 && !foundone) {
				callback(404);
			}
		});
	},

	createMessage: function(emailType, email, customid, callback) {
		var self = this;
		if(!email) {
			self.getRecipient(customid, function(error, emailAddress) {

				if(error && error === 404) return callback(404);

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
