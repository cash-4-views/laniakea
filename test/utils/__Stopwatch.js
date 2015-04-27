"use strict";

var Stopwatch = require("../../api/utils/Stopwatch"),
		test 			= require("tape");


test("The Stopwatch constructor ", function(t) {
	var stopwatch = new Stopwatch();

	t.equal(stopwatch.getStart(), Date.now(), "should create a stopwatch with a start time of now in ms");
	t.deepEqual(stopwatch.lapTimes, [], "should create a stopwatch with an empty array of lap times");
	t.equal(stopwatch.lapCount, 0, "should create a stopwatch with a lap count of 0");
	t.end();
});

test("Stopwatch.prototype.lap ", function(t) {
	var stopwatch = new Stopwatch();

	var len1 = stopwatch.lapTimes.length;

	t.equal(stopwatch.lap().lapTimes.length, len1+1, "should add a time to the lapTimes array");
	t.equal(stopwatch.lapCount, 1, "should increment lapCount");
	t.ok(stopwatch.lap().lap(), "should be chainable");
	t.end();
});

test("Stopwatch.prototype.lapSum ", function(t) {
	var stopwatch = new Stopwatch();

	for(var i = 4 ;i--;) {
		stopwatch.lapTimes.push(Math.ceil(Math.random() * 500));
	}

	var n = stopwatch.lapTimes;

	t.equal(stopwatch.lapSum(), n[n.length-1], "without an argument, should return the time of the last lap");
	t.equal(stopwatch.lapSum(2), n[n.length-1] + n[n.length-2], "with an argument, should return the sum of the z most recent laps");
	t.end();
});

test("Stopwatch.prototype.stop ", function(t) {
	var stopwatch = new Stopwatch();

	for(var i = 4 ;i--;) {
		stopwatch.lapTimes.push(Math.ceil(Math.random() * 500));
	}

	var n = stopwatch.lapTimes;

	t.equal(Object.keys(stopwatch.stop()).length, 4, "should return an object with 4 keys");
	t.equal(stopwatch.stop().start, stopwatch.getStart(), " should return the starting time of the stopwatch");
	t.deepEqual(stopwatch.stop().laps, stopwatch.lapTimes, " should return the lap times");
	t.equal(stopwatch.stop().lapNum, stopwatch.lapCount, " should return the number of laps");
	t.equal(stopwatch.stop().total, Date.now() - stopwatch.getStart(), " should return the total duration since the stopwatch was started");
	t.end();
});
