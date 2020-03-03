"use strict";

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _glob = require("glob");

var _glob2 = _interopRequireDefault(_glob);

var _extractor = require("./modoc/src/extractor");

var _jsdocParser = require("./modoc/src/jsdoc-parser");

require("colors");

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

// jshint node:true
/**
 * Reports any undocumented function parameter
 * Ignores function that have no documentation at all
 *
 * Usage: node tools/jsdoc-param-checker.js
 */

'use strict';

var allFiles = _glob2.default.sync('src/**/*.js');

function pluck(property) {
	return function (obj) {
		return obj[property];
	};
}

// don't use for long arrays
function contains(array, element) {
	return array.indexOf(element) !== -1;
}

function makeError(functionName, message) {
	return {
		functionName: functionName,
		message: message
	};
}

function validate(data) {
	function validateFunction(data) {
		if (!data.rawComment) {
			return [];
		}

		var functionParams = data.params;

		var jsdoc = (0, _jsdocParser.extract)(data.rawComment);

		if (!jsdoc['@param']) {
			if (functionParams.length) {
				return [makeError(data.name, 'missing @params')];
			} else {
				return [];
			}
		}

		var jsdocParams = jsdoc['@param'].map(pluck('name'));

		return functionParams.reduce(function (errors, functionParam) {
			if (!contains(jsdocParams, functionParam)) {
				errors.push(makeError(data.name, 'parameter ' + functionParam + ' is missing from the jsdoc'));
			}
			return errors;
		}, []);
	}

	var constructorErrors = data.constructor ? validateFunction(data.constructor) : [];
	var methodErrors = Array.prototype.concat.apply([], data.methods.map(validateFunction));
	var staticMethodErrors = Array.prototype.concat.apply([], data.staticMethods.map(validateFunction));

	return constructorErrors.concat(methodErrors, staticMethodErrors);
}

var count = 0;

allFiles.forEach(function (file) {
	var source = _fs2.default.readFileSync(file, 'utf8');

	var data = (0, _extractor.extract)(source, file);

	var errors = validate(data, file);

	if (errors.length) {
		count += errors.length;

		console.log(file.yellow);
		errors.forEach(function (error) {
			console.log(error.functionName, error.message.grey);
		});
		console.log();
	}
});

console.log(('Total number of errors ' + count)[count ? 'red' : 'green']);
