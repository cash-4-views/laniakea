
//var csv is the CSV file with headers
function csvJSON(csv){

  var csv = csv.toString();
  var lines=csv.split("\n");
 
  var result = [];
  var headers=lines[0].split(",");
 
  for(var i=1;i<lines.length;i++){
 
	  var obj = {};
	  var currentline=lines[i].split(",");
 
	  for(var j=0;j<headers.length;j++){
		  obj[headers[j]] = currentline[j];
	  }
 
	  result.push(obj);
 
  }
  console.log(result);
  //return result; //JavaScript object
  return JSON.stringify(csv); //JSON
}

module.exports = csvJSON;