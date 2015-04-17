var Test         = require("tape"),
    csvConverter = require("../api/utils/csvConverter"),
    sampleJSON   = require("./utils/testdata/sampleJSON.json");

Test("csvConverter", function(t) {
    "use strict";

    var csv = csvConverter(sampleJSON);

		console.log(sampleJSON);
		console.log(csv);

    t.test("the input should", function(st) {
        st.equals(typeof sampleJSON, "object", "be an object");
        st.equals(Object.prototype.toString.call(sampleJSON), "[object Array]", "be an array");
        st.end();
    });

    t.test("the output should", function(st) {
        st.equals(typeof csv, "string", "be a string");
        st.end();
    });
});
