
function csvConverter(objArray) {
    console.log(Buffer.isBuffer(objArray));
    var array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    console.log(array);
    var str = '';
    var len = array.length;

    for (var i = 0; i < len; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line !== '') line += ',';

            line += array[i][index];
        }

        str += line + '\r\n';
    }
    return str;
}

module.exports = csvConverter;


