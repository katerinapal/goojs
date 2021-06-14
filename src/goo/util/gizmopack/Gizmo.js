"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Gizmo = undefined;

var _MeshData = require("../../renderer/MeshData");

var _Shader = require("../../renderer/Shader");

var _Material = require("../../renderer/Material");

var _Renderer = require("../../renderer/Renderer");

var _Transform = require("../../math/Transform");

var _Plane = require("../../math/Plane");

var _Vector = require("../../math/Vector3");

var _Camera = require("../../renderer/Camera");

var _MathUtils = require("../../math/MathUtils");

var mod_Gizmo = Gizmo;

/**
 * @hidden
 */
function Gizmo(name) {
	this.name = name;

	this._plane = new _Plane.Plane();
	this._line = new _Vector.Vector3();
	this._activeHandle = null;

	this.visible = false;

	this.transform = new _Transform.Transform();
	this.renderables = [];
	this.onChange = null;
}

Gizmo.handleStore = [];

Gizmo.registerHandle = function (handle) {
	var retVal = Gizmo.handleStore.length + 16000;
	Gizmo.handleStore.push(handle);
	return retVal;
};

Gizmo.getHandle = function (id) {
	if (id < 16000) {
		return null;
	}
	return Gizmo.handleStore[id - 16000];
};

Gizmo.prototype.getRenderable = function (id) {
	for (var i = 0; i < this.renderables.length; i++) {
		var renderable = this.renderables[i];
		if (renderable.id === id) {
			return renderable;
		}
	}
};

/**
 * Turns snapping on or off
 * @param {boolean} snap
 */
Gizmo.prototype.setSnap = function (snap) {
	this._snap = snap;
};

Gizmo.prototype.activate = function (properties) {
	this._activeHandle = properties.data;

	this._activeRenderable = this.getRenderable(properties.id);

	this._activeRenderable.materials[0].uniforms.color = [1, 1, 0]; //! AT: hardcoded pure yellow
};

Gizmo.prototype.deactivate = function () {
	if (this._activeRenderable) {
		var originalColor = this._activeRenderable.originalColor;
		this._activeRenderable.materials[0].uniforms.color = originalColor.slice();
	}
};

Gizmo.prototype.copyTransform = function (transform) {
	this.transform.setIdentity();
	if (transform) {
		transform.matrix.getTranslation(this.transform.translation);
		this.transform.rotation.copy(transform.rotation);
		this.updateTransforms();
	}
};

Gizmo.prototype._postProcess = function (data) {
	this.updateTransforms();

	if (this.onChange instanceof Function) {
		this.onChange(data);
	}
};

/**
 * Update the transform of the provided renderable.
 * @param renderable
 */
Gizmo.prototype.updateRenderableTransform = function (renderable) {
	renderable.transform.matrix.mul2(this.transform.matrix, renderable.transform.matrix);
};

var GIZMO_SIZE = 1 / 60;

/**
 * Updates the transforms of the renderables of this gizmo.
 * Scale adjustment is also performed.
 */
Gizmo.prototype.updateTransforms = function () {
	if (_Renderer.mainCamera) {
		var camera = _Renderer.mainCamera;
		var scale;
		if (camera.projectionMode === _Camera.Camera.Perspective) {
			var dist = camera.translation.distance(this.transform.translation);
			scale = dist * GIZMO_SIZE;
			scale *= Math.tan(camera.fov * _MathUtils.DEG_TO_RAD / 2) * 2;
		} else {
			scale = (camera._frustumTop - camera._frustumBottom) / 30;
		}
		this.transform.scale.setDirect(scale, scale, scale);
	}

	this.transform.update();

	for (var i = this.renderables.length - 1; i >= 0; i--) {
		this.renderables[i].transform.update();
		this.updateRenderableTransform(this.renderables[i]);
	}
};

(function () {
	var worldCenter = new _Vector.Vector3();
	var worldX = new _Vector.Vector3();
	var worldY = new _Vector.Vector3();
	var worldZ = new _Vector.Vector3();
	var screenCenter = new _Vector.Vector3();
	var screenX = new _Vector.Vector3();
	var screenY = new _Vector.Vector3();
	var screenZ = new _Vector.Vector3();

	Gizmo.prototype._setPlane = function () {
		var normal = this._plane.normal;

		if (this._activeHandle.type === 'Plane') {
			// Calculate plane's normal in world space
			normal.copy([_Vector.Vector3.UNIT_X, _Vector.Vector3.UNIT_Y, _Vector.Vector3.UNIT_Z][this._activeHandle.axis]);
			normal.applyPostVector(this.transform.matrix);
			normal.normalize();

			// Set plane distance from world origin by projecting world translation to plane normal
			worldCenter.copy(_Vector.Vector3.ZERO);
			worldCenter.applyPostPoint(this.transform.matrix);

			this._plane.constant = worldCenter.dot(normal);
		} else {
			// Get gizmo handle points in world space
			worldCenter.copy(_Vector.Vector3.ZERO);
			worldCenter.applyPostPoint(this.transform.matrix);

			worldX.copy(_Vector.Vector3.UNIT_X);
			worldX.applyPostPoint(this.transform.matrix);

			worldY.copy(_Vector.Vector3.UNIT_Y);
			worldY.applyPostPoint(this.transform.matrix);

			worldZ.copy(_Vector.Vector3.UNIT_Z);
			worldZ.applyPostPoint(this.transform.matrix);

			// Gizmo handle points in screen space
			_Renderer.mainCamera.getScreenCoordinates(worldCenter, 1, 1, screenCenter);
			_Renderer.mainCamera.getScreenCoordinates(worldX, 1, 1, screenX);
			screenX.sub(screenCenter);
			_Renderer.mainCamera.getScreenCoordinates(worldY, 1, 1, screenY);
			screenY.sub(screenCenter);
			_Renderer.mainCamera.getScreenCoordinates(worldZ, 1, 1, screenZ);
			screenZ.sub(screenCenter);

			// when dragging on a line
			// select the plane that's the "most perpendicular" to the camera
			switch (this._activeHandle.axis) {
				case 0:
					normal.copy(screenY.cross(screenX).length() > screenZ.cross(screenX).length() ? worldZ : worldY);
					break;
				case 1:
					normal.copy(screenZ.cross(screenY).length() > screenX.cross(screenY).length() ? worldX : worldZ);
					break;
				case 2:
					normal.copy(screenX.cross(screenZ).length() > screenY.cross(screenZ).length() ? worldY : worldX);
					break;
			}

			normal.sub(worldCenter).normalize();

			// Plane constant is world translation projected on normal
			this._plane.constant = worldCenter.dot(normal);
		}
	};
})();

Gizmo.prototype._setLine = function () {
	// If translating or scaling along a line, set current line
	this._line.copy([_Vector.Vector3.UNIT_X, _Vector.Vector3.UNIT_Y, _Vector.Vector3.UNIT_Z][this._activeHandle.axis]);
	this._line.applyPostVector(this.transform.matrix);
	this._line.normalize();
};

Gizmo.prototype.addRenderable = function (renderable) {
	renderable.originalColor = renderable.materials[0].uniforms.color;
	this.renderables.push(renderable);
};

Gizmo.buildMaterialForAxis = function (axis, opacity) {
	var material = new _Material.Material(SHADER_DEF, axis + 'Material');
	material.uniforms.color = COLORS[axis].slice();

	if (opacity !== undefined && opacity < 1.0) {
		material.blendState.blending = 'TransparencyBlending';
		material.uniforms.opacity = opacity;
		material.renderQueue = 3000;
	}
	material.cullState.enabled = false;

	return material;
};

var COLORS = [[1, 0.1, 0.3], [0.3, 1, 0.2], [0.2, 0.3, 1], [0.8, 0.8, 0.8]];

var SHADER_DEF = {
	attributes: {
		vertexPosition: _MeshData.MeshData.POSITION,
		vertexNormal: _MeshData.MeshData.NORMAL
	},
	uniforms: {
		viewProjectionMatrix: _Shader.Shader.VIEW_PROJECTION_MATRIX,
		worldMatrix: _Shader.Shader.WORLD_MATRIX,
		color: [1.0, 1.0, 1.0],
		opacity: 1.0
	},
	vshader: ['attribute vec3 vertexPosition;', 'attribute vec3 vertexNormal;', 'uniform mat4 viewProjectionMatrix;', 'uniform mat4 worldMatrix;', 'varying vec3 normal;', 'varying vec3 viewPosition;', 'void main(void) {', ' vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);', ' gl_Position = viewProjectionMatrix * worldPos;', ' normal = vertexNormal;', '}'].join('\n'),
	fshader: ['varying vec3 normal;', 'uniform vec3 color;', 'uniform float opacity;', 'void main(void)', '{', ' vec3 N = normalize(normal);', ' vec4 final_color = vec4(color, 1.0);', ' vec3 light = vec3(1.0, 1.0, 10.0);', ' float dotProduct = dot(N, normalize(light));', ' float diffuse = max(dotProduct, 0.0);', ' final_color.rgb *= (0.5 * diffuse + 0.5);', ' final_color.a = opacity;', ' gl_FragColor = final_color;', '}'].join('\n')
};

/**
 * @hidden
 */
exports.Gizmo = mod_Gizmo;