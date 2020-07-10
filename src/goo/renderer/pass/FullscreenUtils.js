"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FullscreenUtils = undefined;

var _Quad = require("../../shapes/Quad");

var _Camera = require("../../renderer/Camera");

var _Vector = require("../../math/Vector3");

var FullscreenUtils_FullscreenUtils = FullscreenUtils;

function FullscreenUtils() {}

var camera = new _Camera.Camera();
camera.projectionMode = _Camera.Camera.Parallel;
camera.setFrustum(0, 1, -1, 1, 1, -1);
camera._left.copy(_Vector.Vector3.UNIT_X).negate();
camera._up.copy(_Vector.Vector3.UNIT_Y);
camera._direction.copy(_Vector.Vector3.UNIT_Z);
camera.onFrameChange();
FullscreenUtils.camera = camera;

FullscreenUtils.quad = new _Quad.Quad(2, 2);

/**
 * Utility class with a default setup parallel camera and fullscreen quad for fullscreen pass usage
 */
exports.FullscreenUtils = FullscreenUtils_FullscreenUtils;