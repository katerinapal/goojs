"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JointChannel = undefined;

var _TransformChannel = require("../../animationpack/clip/TransformChannel");

var _JointData = require("../../animationpack/clip/JointData");

var mod_JointChannel = JointChannel;

/**
 * Transform animation channel, specifically geared towards describing the motion of skeleton joints.
 * @param {string} jointName our joint name.
 * @param {number} jointIndex our joint index
 * @param {Array<number>} times our time offset values.
 * @param {Array<number>} rotations the rotations to set on this channel at each time offset.
 * @param {Array<number>} translations the translations to set on this channel at each time offset.
 * @param {Array<number>} scales the scales to set on this channel at each time offset.
 */
function JointChannel(jointIndex, jointName, times, rotations, translations, scales, blendType) {
  _TransformChannel.TransformChannel.call(this, jointName, times, rotations, translations, scales, blendType);

  this._jointName = jointName; // Joint has a name even though index is used for id, this can be used for debugging purposes.
  this._jointIndex = jointIndex;
}

JointChannel.prototype = Object.create(_TransformChannel.TransformChannel.prototype);

/**
 * @type {string}
 * @readonly
 * @default '_jnt'
 */
JointChannel.JOINT_CHANNEL_NAME = '_jnt';

/*
 * Creates a data item for this type of channel
 * @returns {JointData}
 */
JointChannel.prototype.createStateDataObject = function () {
  return new _JointData.JointData();
};

/*
 * Applies the channels animation state to supplied data item
 * @param {number} sampleIndex
 * @param {number} progressPercent
 * @param {JointData} value The data item to apply animation to
 */
JointChannel.prototype.setCurrentSample = function (sampleIndex, progressPercent, jointData) {
  _TransformChannel.TransformChannel.prototype.setCurrentSample.call(this, sampleIndex, progressPercent, jointData);
  jointData._jointIndex = this._jointIndex;
};

/**
 * Apply a specific index of this channel to a {@link TransformData} object.
 * @param {number} index the index to grab.
 * @param {JointData} [store] the TransformData to store in. If null, a new one is created.
 * @returns {JointData} our resulting TransformData.
 */
JointChannel.prototype.getData = function (index, store) {
  var rVal = store ? store : new _JointData.JointData();
  _TransformChannel.TransformChannel.prototype.getData.call(this, index, rVal);
  rVal._jointIndex = this._jointIndex;
  return rVal;
};

/**
 * Transform animation channel, specifically geared towards describing the motion of skeleton joints.
 * @param {string} jointName our joint name.
 * @param {number} jointIndex our joint index
 * @param {Array<number>} times our time offset values.
 * @param {Array<number>} rotations the rotations to set on this channel at each time offset.
 * @param {Array<number>} translations the translations to set on this channel at each time offset.
 * @param {Array<number>} scales the scales to set on this channel at each time offset.
 */
exports.JointChannel = mod_JointChannel;