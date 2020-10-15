'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.LinearCurve = undefined;

var _Curve = require('../../../addons/particlepack/curves/Curve');

var LinearCurve_LinearCurve = LinearCurve;

function LinearCurve(options) {
	options = options || {};

	_Curve.Curve.call(this, options);

	/**
  * Slope of the line.
  * @type {number}
  */
	this.k = options.k !== undefined ? options.k : 1;

	/**
  * Value of the line when time is 0.
  * @type {number}
  */
	this.m = options.m || 0;
}
LinearCurve.prototype = Object.create(_Curve.Curve.prototype);
LinearCurve.prototype.constructor = LinearCurve;

/**
 * Create the linar curve from a start and end value.
 * @param {number} startValue
 * @param {number} endValue
 */
LinearCurve.prototype.fromStartEnd = function (startValue, endValue) {
	this.m = startValue;
	this.k = endValue - startValue;
};

LinearCurve.prototype.toGLSL = function (timeVariableName /*, lerpValueVariableName*/) {
	return '(' + _Curve.Curve.numberToGLSL(this.k) + '*' + timeVariableName + '+' + _Curve.Curve.numberToGLSL(this.m) + ')';
};

LinearCurve.prototype.integralToGLSL = function (timeVariableName /*, lerpValueVariableName*/) {
	var k = _Curve.Curve.numberToGLSL(this.k);
	var m = _Curve.Curve.numberToGLSL(this.m);
	return '(' + k + '*' + timeVariableName + '*' + timeVariableName + '*0.5+' + m + '*' + timeVariableName + ')';
};

LinearCurve.prototype.getValueAt = function (t /*, lerpValue*/) {
	return this.k * (t - this.timeOffset) + this.m;
};

LinearCurve.prototype.getIntegralValueAt = function (t /*, lerpValue*/) {
	var x = t - this.timeOffset;
	var k = this.k;
	var m = this.m;
	return 0.5 * k * x * x + m * x;
};

/**
 * @class
 * @constructor
 * @extends Curve
 * @param {object} [options]
 * @param {number} [options.k]
 * @param {number} [options.m]
 */
exports.LinearCurve = LinearCurve_LinearCurve;