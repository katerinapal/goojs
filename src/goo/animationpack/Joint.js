var Joint_Joint = Joint;
import { Transform as mathTransform_Transformjs } from "../math/Transform";
function Joint(name) {
	this._name = name;

	this._index = 0;
	this._parentIndex = Joint.NO_PARENT;
	this._inverseBindPose = new mathTransform_Transformjs();
}

Joint.NO_PARENT = -32768;

/**
 * Representation of a Joint in a Skeleton. Meant to be used within a specific Skeleton object.
 * @param {string} name Name of joint
 */
export { Joint_Joint as Joint };