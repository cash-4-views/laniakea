var creds = require("./credentials.json");

module.exports = {
	azure : {
				dbacc  : process.env.AZURE_STORAGE_ACCOUNT  				 || creds.database.azure_storage_account,
				dbkey  : process.env.AZURE_STORAGE_ACCESS_KEY 			 || creds.database.azure_storage_access_key,
				dburl  : process.env.AZURE_STORAGE_CONNECTION_STRING || creds.database.azure_storage_connection_string
	},
	cookie : {
				password: process.env.COOKIESECRET || creds.cookie.cookie_secret
	},
	mailgun : {
				apiKey   	: creds.mailgun.mgApiKey,
				domain		: process.env.DOMAIN 		|| creds.mailgun.mgDomain,
				mailLists : process.env.MAILLISTS || creds.mailgun.mailLists

	}
};
