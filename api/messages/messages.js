var config    = require("../config");
var api_key   = config.mailgun.apiKey;
var domain    = config.mailgun.domain;
var mailgun   = require("mailgun-js")({ apiKey : api_key, domain : domain });
var mailLists = config.mailgun.mailLists;
var list = mailgun.lists("members@sandbox4922452d57df45d891c470ce3aa4ee3e.mailgun.org");


var messageTemplates = {

    approve: function (message, data) {
    	"use strict";
    	message.subject = "Your account has been approved";
    	message.text		= "Hi " + data.customid + ". \n\nThank you for signing up to receive online revenue reports from Laniakea. Please add this email address to your contacts to avoid further communication being filtered as spam.";
    	return message;
    },

    notify: function (message, data) {
		"use strict";

      message.subject = "Monthly report available";
      message.text    = "The PREVIOUS_MONTH revenue report is now available. Please visit 'https://www.w00d_chipper/login' to download it.";
      return message;
    }
};


getRecipient = function(data) {
	"use strict";

	if(data.email.indexOf("@") !== -1) return data.email;

	var found = mailLists.filter (function(val, index) {
		return(val.name === data.email);
	});

	if (found.length === 1) {
		return found[0].email;
	}

	if (found.length === 0) {
		console.log("No matching email addresses found for" + data.email);
	}
};


createMessage = function(emailType, data) {
	"use strict";

	var message = {
		from: "mail@sandbox4922452d57df45d891c470ce3aa4ee3e.mailgun.org"
	};
	console.log("Message sent from :" + message.from);
	message.to = getRecipient(data);

	switch(emailType) {
		case "approve" : return messageTemplates.approve(message, data);
		break;

		case "notify" : return messageTemplates.notify(message, data);
		break;

		default: console.log("Message type not found, try again");
	}
};

module.exports = {

	addToMailingList : function(data, onComplete) {
		"use strict";

		list.members().create(data, function(err, data) {
			if (err) console.log("members err: " + err);
			console.log("members added to mailing list: " + data.member.name);
		});
	},


	// compose email components and send \\
	sendEmail : function(emailType, data, onComplete) {
		"use strict";

		var message = createMessage(emailType, data);

		mailgun.messages().send(message, function(senderror) {
			if (senderror) {
				console.log("SendError: " + senderror);
			} else {
				console.log("Mail successfully sent to " + data.email);
			}
		});
	},
};
