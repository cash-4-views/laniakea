module.exports = {
	database : {
				dbacc  : process.env.AZURE_STORAGE_ACCOUNT  				 || require("./credentials.json").database.azure_storage_account,
				dbkey  : process.env.AZURE_STORAGE_ACCESS_KEY 			 || require("./credentials.json").database.azure_storage_access_key,
				dburl  : process.env.AZURE_STORAGE_CONNECTION_STRING || require("./credentials.json").database.azure_storage_connection_string,
				atable : "accounts",
				rtable : "reports"
	},
	cookie : {
				password: process.env.COOKIESECRET || require("./credentials.json").cookie.cookie_secret
	},
	mailgun : {
				apiKey   	: 												 require("./credentials.json").mailgun.mgApiKey,
				domain		: process.env.DOMAIN 		|| require("./credentials.json").mailgun.mgDomain,
				mailLists : process.env.MAILLISTS || require("./credentials.json").mailgun.mailLists,
				listURL   : process.env.LISTURL   || require("./credentials.json").mailgun.listURL

	}
};
