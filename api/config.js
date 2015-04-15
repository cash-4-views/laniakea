module.exports = {
	azure : {
				dbacc  : process.env.AZURE_STORAGE_ACCOUNT  				 || require("./credentials.json").database.azure_storage_account,
				dbkey  : process.env.AZURE_STORAGE_ACCESS_KEY 			 || require("./credentials.json").database.azure_storage_access_key,
				dburl  : process.env.AZURE_STORAGE_CONNECTION_STRING || require("./credentials.json").database.azure_storage_connection_string,
	},
	cookie : {
				password: process.env.COOKIESECRET || require("./credentials.json").cookie.cookie_secret
	}
};
