import { AbstractState as animationpackstateAbstractState_AbstractStatejs } from "../../animationpack/state/AbstractState";
function SteadyState(name) {
	animationpackstateAbstractState_AbstractStatejs.call(this);

	this.id = null;
	this._name = name;
	this._transitions = {};
	this._sourceTree = null;
}

SteadyState.prototype = Object.create(animationpackstateAbstractState_AbstractStatejs.prototype);
SteadyState.prototype.constructor = SteadyState;

/**
 * Sets the clipsource of the steadystate
 * @param {(ClipSource|BinaryLerpSource|FrozenClipSource|ManagedTransformSource)} clipSource
 */
SteadyState.prototype.setClipSource = function (clipSource) {
	this._sourceTree = clipSource;
};

/*
 * Updates the states clip instances
 */
SteadyState.prototype.update = function (globalTime) {
	if (!this._sourceTree.setTime(globalTime)) {
		if (this.onFinished) {
			this.onFinished();
		}
	}
};

/*
 * Gets the current animation data, used in {@link AnimationLayer}
 */
SteadyState.prototype.getCurrentSourceData = function () {
	return this._sourceTree.getSourceData();
};

/*
 */
SteadyState.prototype.getCurrentLoop = function () {
	return this._sourceTree.currentLoop;
};

/*
 * Resets the animationclips in the sourcetree
 * @param {number} globalStartTime Usually current time
 */
SteadyState.prototype.resetClips = function (globalStartTime) {
	animationpackstateAbstractState_AbstractStatejs.prototype.resetClips.call(this, globalStartTime);
	this._sourceTree.resetClips(globalStartTime);
};

SteadyState.prototype.shiftClipTime = function (shiftTime) {
	animationpackstateAbstractState_AbstractStatejs.prototype.shiftClipTime.call(this, shiftTime);
	this._sourceTree.shiftClipTime(shiftTime);
};

SteadyState.prototype.setTimeScale = function (timeScale) {
	this._sourceTree.setTimeScale(timeScale);
};

SteadyState.prototype.clone = function () {
	var cloned = new SteadyState(this._name);

	for (var key in this._transitions) {
		cloned._transitions[key] = this._transitions[key];
	}

	cloned._sourceTree = this._sourceTree.clone();

	return cloned;
};

var exported_SteadyState = SteadyState;

/**
 * A "steady" state is an animation state that is concrete and stand-alone (vs. a state that handles transitioning between two states, for example.)
 * @extends AbstractState
 * @param {string} name Name of state
 */
export { exported_SteadyState as SteadyState };