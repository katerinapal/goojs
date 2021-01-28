"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.TaskScheduler = undefined;

var _PromiseUtils = require("../util/PromiseUtils");

var mod_TaskScheduler = TaskScheduler;


var performance = typeof window !== 'undefined' ? window.performance : {};

performance.now = performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function () {
	return Date.now();
};

function TaskScheduler() {}

TaskScheduler.maxTimePerFrame = 50;

// Engine loop must be disabled while running this
TaskScheduler.each = function (queue) {
	return _PromiseUtils.PromiseUtils.createPromise(function (resolve) {
		var i = 0;

		function process() {
			var startTime = performance.now();
			while (i < queue.length && performance.now() - startTime < TaskScheduler.maxTimePerFrame) {
				queue[i]();
				i++;
			}

			if (i < queue.length) {
				// REVIEW: 4ms is 'lagom'? Should this number be hard-coded?
				//! AT: 4 ms is the minimum amount as specified by the HTML standard
				setTimeout(process, 4);
			} else {
				resolve();
			}
		}

		process();
	});
};

exports.TaskScheduler = mod_TaskScheduler;