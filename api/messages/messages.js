var config    = require("config.js");
var api_key   = config.mailgunTest.apiKey;
var domain    = config.mailgunTest.domain;
var mailgun   = require("mailgun-js")({apiKey:api_key, domain: domain});
var mailLists = config.mailgun.mailLists;

var messageTemplates = {
    notify: function (message, data) {
        message.subject = "Monthly report available";
        message.text    = "The " + [previous.month] + "revenue report for " + data.client_name + "is now available. Please visit https://www.w00d_chipper/login to download it.";
        return message;
    }
}
