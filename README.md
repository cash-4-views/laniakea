# wood_chipper

A reporting platform for providing youtube reports with the following features:
 * Parses csv/xls data, splitting it into per-client slices
 * Generates per-client reports, and stores them
 * Allows an admin to manually edit and approve reports
 * Upon approval,
 	* sends off an email to a registered client informing them that their report is available
 	* makes the report available for download at the client's account page
 * Client registration must be done manually by the admin

Further potential features include:
 * From their account page, a client may upload videos to their official youtube channel. However, this also does the following:
 	* Archives a copy of this video in our database,
 	* Archives metadata about this video in our database

## Technologies

 * csv parsing -
 * xls parsing -
 * report generation -
 * mailing -
 * authentication -
 * Video uploading -

## How to use
```
git clone
cd laniakeia
npm install
npm start
```

## Tests
```
npm test
```
