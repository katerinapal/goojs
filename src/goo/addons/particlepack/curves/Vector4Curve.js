var Vector4Curve_Vector4Curve = Vector4Curve;
import { ConstantCurve as addonsparticlepackcurvesConstantCurve_ConstantCurvejs } from "../../../addons/particlepack/curves/ConstantCurve";
import { Curve as addonsparticlepackcurvesCurve_Curvejs } from "../../../addons/particlepack/curves/Curve";
import { ObjectUtils as utilObjectUtils_ObjectUtilsjs } from "../../../util/ObjectUtils";
function Vector4Curve(options) {
	options = options || {};

	options = utilObjectUtils_ObjectUtilsjs.clone(options);
	options.type = 'vec4';
	addonsparticlepackcurvesCurve_Curvejs.call(this, options);

	this.x = options.x ? options.x.clone() : new addonsparticlepackcurvesConstantCurve_ConstantCurvejs();
	this.y = options.y ? options.y.clone() : new addonsparticlepackcurvesConstantCurve_ConstantCurvejs();
	this.z = options.z ? options.z.clone() : new addonsparticlepackcurvesConstantCurve_ConstantCurvejs();
	this.w = options.w ? options.w.clone() : new addonsparticlepackcurvesConstantCurve_ConstantCurvejs({ value: 1 });

	if (this.x.type !== 'float' || this.y.type !== 'float' || this.z.type !== 'float' || this.w.type !== 'float') {
		throw new Error('Vector4Curve must have scalar components.');
	}
}
Vector4Curve.prototype = Object.create(addonsparticlepackcurvesCurve_Curvejs.prototype);
Vector4Curve.prototype.constructor = Vector4Curve;

Vector4Curve.prototype.toGLSL = function (timeVariableName, lerpValueVariableName) {
	return 'vec4(' + [this.x, this.y, this.z, this.w].map(function (c) { return c.toGLSL(timeVariableName, lerpValueVariableName); }).join(',') + ')';
};

Vector4Curve.prototype.integralToGLSL = function (timeVariableName, lerpValueVariableName) {
	return 'vec4(' + [this.x, this.y, this.z, this.w].map(function (c) { return c.integralToGLSL(timeVariableName, lerpValueVariableName); }).join(',') + ')';
};

Vector4Curve.prototype.getVec4ValueAt = function (t, lerpValue, store) {
	store.setDirect(
		this.x.getValueAt(t, lerpValue),
		this.y.getValueAt(t, lerpValue),
		this.z.getValueAt(t, lerpValue),
		this.w.getValueAt(t, lerpValue)
	);
};

Vector4Curve.prototype.getVec4IntegralValueAt = function (t, lerpValue, store) {
	store.setDirect(
		this.x.getIntegralValueAt(t, lerpValue),
		this.y.getIntegralValueAt(t, lerpValue),
		this.z.getIntegralValueAt(t, lerpValue),
		this.w.getIntegralValueAt(t, lerpValue)
	);
};

/**
 * Three scalar curves. Can be converted to a vec4-valued expression in GLSL code.
 * @class
 * @constructor
 * @param {object} [options]
 * @param {Curve} [options.x]
 * @param {Curve} [options.y]
 * @param {Curve} [options.z]
 * @param {Curve} [options.w]
 */
export { Vector4Curve_Vector4Curve as Vector4Curve };