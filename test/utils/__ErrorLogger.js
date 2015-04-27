"use strict";

var ErrorLogger = require("../../api/utils/ErrorLogger"),
		fs 					= require("fs"),
		test 				= require("tape");


test("The ErrorLogger constructor ", function(t) {
	var errorLogger = new ErrorLogger();

	t.equal(errorLogger.errorCounter, 0, "should create an error logger with a counter of 0");
	t.deepEqual(errorLogger.errorLog, [], "should create an error logger with an empty log array");
	t.equal(new ErrorLogger().errorCounter, 0, "should be chainable");
	t.end();
});

test("ErrorLogger.prototype.addError ", function(t) {
	var errorLogger = new ErrorLogger();

	errorLogger.addError("hi", "hello m8", "offender");

	t.equal(errorLogger.errorCounter, 1, "should increment the error counter");
	t.equal(errorLogger.errorLog.length, 1, "should add to the error log");
	t.deepEqual(errorLogger.errorLog[0], {id: "hi", err: "hello m8", item: "offender"}, "should add an object the error log");
	t.end();
});

test("ErrorLogger.prototype.conclude ", function(t) {
	var errorLogger = new ErrorLogger();


	t.notOk(errorLogger.conclude("appond", "dog"), "should return undefined if there are no errors");
	t.notOk(errorLogger.conclude(), "should return undefined if there are less than 2 arguments");

	errorLogger.errorLog.push({id: "hi", err: "hello m8", item: "offender"});

	t.notOk(errorLogger.conclude("chiken", "dog"), "should return undefined with dodgy arguments");
	t.end();
});
