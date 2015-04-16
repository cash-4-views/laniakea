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
	}
};
