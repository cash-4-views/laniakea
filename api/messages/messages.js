var config    = require("./config");
var api_key   = config.mailgunTest.apiKey;
var domain    = config.mailgunTest.domain;
var mailgun   = require("mailgun-js")({ apiKey : api_key, domain : domain });
var mailLists = config.mailgun.mailLists;


var messageTemplates = {

    notify: function (message, data) {
		"use strict";

        message.subject = "Monthly report available";
        message.text    = "The " + [previous.month] + "revenue report for " + data.client_name + "is now available. Please visit https://www.w00d_chipper/login to download it.";
        return message;
    }
};

getRecipient = function(data) {
	"use strict";

	console.log("Recipient is " + data.email);
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
	message.to = getRecipient(data);

	switch(emailType) {
		case "notify" : return messageTemplates.notify(message, data);
		break;
		default: console.log("Message type not found, check yo shit");
	}
};


function sendEmail(data, emailType, onComplete) {
	"use strict";

	var message = createMessage(emailType, data);
}
