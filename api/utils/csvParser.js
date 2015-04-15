function csvParser(rawCSV){
  "use strict";

  var videoRegEx  = /\n(?=Video ID)/g;
  var legendRegEx = /\n\n(?=Legend)/g;

  var csv = rawCSV.toString();

  var splitA = csv.split(videoRegEx);

  var section1 = splitA[1];

  var splitB = section1.split(legendRegEx);

  csv = splitB[0];

  var lines = csv.split("\n");

  var result  = [];
  var headers = lines[0].split(",");

  var ll = lines.length,
      i;

  for(i = 1; i < ll; i+= 1){

	  var obj = {};
	  var currentline = lines[i].split(",");

    var hl = headers.length,
        j;

	  for(j = 0; j < hl; j+= 1){
		  obj[headers[j]] = currentline[j];
	  }

	  result.push(obj);

  }
  return result;
}

module.exports = csvParser;
