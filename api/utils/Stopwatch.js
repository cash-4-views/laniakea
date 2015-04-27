/**
* A simple stopwatch for simple people
*
**/

"use strict";

function Stopwatch() {
	var start = Date.now();

	this.lapTimes = [];
	this.lapCount = 0;

	this.getStart = function() {
		return start;
	};

}

Stopwatch.prototype = {

	lap: function() {
		var now = Date.now();
		var lapTime = this.lapTimes[this.lapCount] ?
											now - this.lapTimes[this.lapCount] :
											now - this.getStart();

		this.lapTimes.push(lapTime);
		this.lapCount += 1;

		return this;
	},

	lapSum: function(n) {
		 return this.lapTimes.slice(-n || -1).reduce(function(a, b) {
				return a + b;
		 });
	},

	stop: function() {
		return {
			start  : this.getStart(),
			laps   : this.lapTimes,
			lapNum : this.lapCount,
			total  : Date.now() - this.getStart()
		};
	}

};

module.exports = Stopwatch;
