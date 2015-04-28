# wood_chipper

A thing for providing YouTube revenue reports for clients with the following features:
 * Parses csv data, processing and storing the parsed report data
 * Allows admin control over, and generation of per-client reports
 * Allows admin approval of individual client reports, which, upon approval,
 	* sends off an email to any registered client that has been given the same id as found in the report, informing them that their report is available
 	* makes that report available for download at the client's account page
 * CRUD facilities for accounts are available only to the admin
 * Built on a JSON api

## Technologies
 
 * Server - Hapi
 * DB - Azure table storage
 * UI - React
 --
 * Csv parsing - Babyparse
 * Mailing - Mailgun
 * Authentication - Hapi-auth-cookie

## How to use

You will need either:
a) a credentials.json file of the same form as credentials.example.json in api
b) enviroment variables as outlined in config.js in api.

```
git clone
cd wood_chipper
npm install

// -- 1st terminal
gulp

//-- 2nd terminal 
node app.js
```

## Tests
```
npm test
```

Note: Azure table storage currently has a bug with 'createTableIfNotExists'. You can either ignore it (and the create table tests will fail), or you can go to `node_modules/azure-storage/lib/services/table/tableservice` and add the following line at 673:
```js
created = false;
if(!createResponse) createResponse = {}; <--- add this line
createResponse.isSuccessful = true;
```
