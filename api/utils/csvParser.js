function csvParser(rawCSV){

  var csv   = rawCSV.toString();
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