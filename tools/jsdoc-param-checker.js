import ext_fs_fs from "fs";
import ext_glob_glob from "glob";
import { extract as modocsrcextractor_extractjs } from "./modoc/src/extractor";
import { extract as modocsrcjsdocparser_extractjs } from "./modoc/src/jsdoc-parser";
import "colors";
// jshint node:true
/**
 * Reports any undocumented function parameter
 * Ignores function that have no documentation at all
 *
 * Usage: node tools/jsdoc-param-checker.js
 */

'use strict';

var allFiles = ext_glob_glob.sync('src/**/*.js');

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
		if (!data.rawComment) { return []; }

		var functionParams = data.params;

		var jsdoc = modocsrcjsdocparser_extractjs(data.rawComment);

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
				errors.push(makeError(
					data.name,
					'parameter ' + functionParam + ' is missing from the jsdoc'
				));
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
	var source = ext_fs_fs.readFileSync(file, 'utf8');

	var data = modocsrcextractor_extractjs(source, file);

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