Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ParticleSystemComponentHandler = undefined;

var _ComponentHandler = require("../../../loaders/handlers/ComponentHandler");

var _ParticleSystemComponent = require("../../../addons/particlepack/components/ParticleSystemComponent");

var _LinearCurve = require("../../../addons/particlepack/curves/LinearCurve");

var _ConstantCurve = require("../../../addons/particlepack/curves/ConstantCurve");

var _PolyCurve = require("../../../addons/particlepack/curves/PolyCurve");

var _Vector3Curve = require("../../../addons/particlepack/curves/Vector3Curve");

var _Vector4Curve = require("../../../addons/particlepack/curves/Vector4Curve");

var _LerpCurve = require("../../../addons/particlepack/curves/LerpCurve");

var _rsvp = require("../../../util/rsvp");

var _ObjectUtils = require("../../../util/ObjectUtils");

var ObjectUtils = _interopRequireWildcard(_ObjectUtils);

var _Vector = require("../../../math/Vector3");

var _MathUtils = require("../../../math/MathUtils");

var MathUtils = _interopRequireWildcard(_MathUtils);

var _ParticleSystemUtils = require("../../../util/ParticleSystemUtils");

var ParticleSystemUtils = _interopRequireWildcard(_ParticleSystemUtils);

function _interopRequireWildcard(obj) {
	if (obj && obj.__esModule) {
		return obj;
	} else {
		var newObj = {};if (obj != null) {
			for (var key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
			}
		}newObj.default = obj;return newObj;
	}
}

function ParticleSystemComponentHandler() {
	_ComponentHandler.ComponentHandler.apply(this, arguments);
	this._cachedPresetTextures = {};
	this._type = 'ParticleSystemComponent';
}

ParticleSystemComponentHandler.prototype = Object.create(_ComponentHandler.ComponentHandler.prototype);
ParticleSystemComponentHandler.prototype.constructor = ParticleSystemComponentHandler;
_ComponentHandler.ComponentHandler._registerClass('particleSystem', ParticleSystemComponentHandler);

function constantCurve(value) {
	return [{
		type: 'constant',
		offset: 0,
		value: value
	}];
}

function linearCurve(k, m) {
	return [{
		type: 'linear',
		offset: 0,
		k: k,
		m: m
	}];
}

/**
 * Prepare component. Set defaults on config here.
 * @param {Object} config
 * @returns {Object}
 * @private
 */
ParticleSystemComponentHandler.prototype._prepare = function (config) {
	return ObjectUtils.defaults(config, {
		gravity: [0, 0, 0],
		seed: -1,
		shapeType: 'cone',
		sphereRadius: 1,
		sphereEmitFromShell: false,
		randomDirection: false,
		coneEmitFrom: 'base',
		boxExtents: [1, 1, 1],
		coneRadius: 1,
		coneAngle: 10,
		coneLength: 1,
		startColor: [constantCurve(1), constantCurve(1), constantCurve(1), constantCurve(1)],
		colorOverLifetime: [constantCurve(1), constantCurve(1), constantCurve(1), constantCurve(1)],
		duration: 5,
		localSpace: true,
		startSpeed: constantCurve(5),
		localVelocityOverLifetime: [constantCurve(0), constantCurve(0), constantCurve(0)],
		worldVelocityOverLifetime: [constantCurve(0), constantCurve(0), constantCurve(0)],
		maxParticles: 100,
		emissionRate: constantCurve(10),
		startLifetime: constantCurve(5),
		renderQueue: 3010,
		discardThreshold: 0,
		loop: false,
		preWarm: true,
		blending: 'NoBlending',
		depthWrite: true,
		depthTest: true,
		textureTilesX: 1,
		textureTilesY: 1,
		textureAnimationCycles: 1,
		textureFrameOverLifetime: linearCurve(1, 0),
		startSize: constantCurve(1),
		sortMode: 'none',
		billboard: true,
		sizeOverLifetime: constantCurve(1),
		startAngle: constantCurve(0),
		rotationSpeedOverLifetime: constantCurve(0),
		texturePreset: 'Custom',
		textureRef: null
	});
};

/**
 * @returns {Component} the created component object
 * @private
 */
ParticleSystemComponentHandler.prototype._create = function () {
	return new _ParticleSystemComponent.ParticleSystemComponent();
};

/**
 * @param {Entity} entity
 * @private
 */
ParticleSystemComponentHandler.prototype._remove = function (entity) {
	entity.clearComponent('ParticleSystemComponent');
};

function createCurve(configs, multiplier) {
	multiplier = multiplier !== undefined ? multiplier : 1;

	var curve = new _PolyCurve.PolyCurve();

	for (var i = 0; i < configs.length; i++) {
		var config = configs[i];
		switch (config.type) {
			case 'linear':
				curve.addSegment(new _LinearCurve.LinearCurve({
					timeOffset: config.offset,
					k: config.k * multiplier,
					m: config.m * multiplier
				}));
				break;
			case 'constant':
				curve.addSegment(new _ConstantCurve.ConstantCurve({
					timeOffset: config.offset,
					value: config.value * multiplier
				}));
				break;
			case 'lerp':
				curve.addSegment(new _LerpCurve.LerpCurve({
					timeOffset: config.offset,
					curveA: createCurve(config.curveA, multiplier),
					curveB: createCurve(config.curveB, multiplier)
				}));
				break;
		}
	}

	return curve;
}

function createVec3Curve(vector) {
	return new _Vector3Curve.Vector3Curve({
		x: createCurve(vector[0]),
		y: createCurve(vector[1]),
		z: createCurve(vector[2])
	});
}

function createVec4Curve(vector) {
	return new _Vector4Curve.Vector4Curve({
		x: createCurve(vector[0]),
		y: createCurve(vector[1]),
		z: createCurve(vector[2]),
		w: createCurve(vector[3])
	});
}

/**
 * @param {Entity} entity The entity on which this component should be added.
 * @param {Object} config
 * @param {Object} options
 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
 */
ParticleSystemComponentHandler.prototype.update = function (entity, config, options) {
	var that = this;
	return _ComponentHandler.ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
		if (!component) {
			return;
		}

		component.gravity.setArray(config.gravity);
		component.seed = config.seed;
		component.shapeType = config.shapeType;
		component.sphereRadius = config.sphereRadius;
		component.sphereEmitFromShell = config.sphereEmitFromShell;
		component.randomDirection = config.randomDirection;
		component.coneEmitFrom = config.coneEmitFrom;
		component.setBoxExtents(new _Vector.Vector3(config.boxExtents));
		component.coneRadius = config.coneRadius;
		component.coneAngle = config.coneAngle * MathUtils.DEG_TO_RAD;
		component.coneLength = config.coneLength;
		component.startColor = createVec4Curve(config.startColor);
		component.colorOverLifetime = createVec4Curve(config.colorOverLifetime);
		component.duration = config.duration;
		component.localSpace = config.localSpace;
		component.startSpeed = createCurve(config.startSpeed);
		component.localVelocityOverLifetime = createVec3Curve(config.localVelocityOverLifetime);
		component.worldVelocityOverLifetime = createVec3Curve(config.worldVelocityOverLifetime);
		component.maxParticles = config.maxParticles;
		component.emissionRate = createCurve(config.emissionRate);
		component.startLifetime = createCurve(config.startLifetime);
		component.renderQueue = config.renderQueue;
		component.discardThreshold = config.discardThreshold;
		component.loop = config.loop;
		component.preWarm = config.preWarm;
		component.blending = config.blending;
		component.depthWrite = config.depthWrite;
		component.depthTest = config.depthTest;
		component.textureTilesX = config.textureTilesX;
		component.textureTilesY = config.textureTilesY;
		component.textureFrameOverLifetime = createCurve(config.textureFrameOverLifetime);
		component.textureAnimationCycles = config.textureAnimationCycles;
		component.startSize = createCurve(config.startSize);
		component.sortMode = {
			'none': _ParticleSystemComponent.ParticleSystemComponent.SORT_NONE,
			'camera_distance': _ParticleSystemComponent.ParticleSystemComponent.SORT_CAMERA_DISTANCE
		}[config.sortMode];
		component.billboard = config.billboard;
		component.sizeOverLifetime = createCurve(config.sizeOverLifetime);
		component.startAngle = createCurve(config.startAngle, MathUtils.DEG_TO_RAD);
		component.rotationSpeedOverLifetime = createCurve(config.rotationSpeedOverLifetime, MathUtils.DEG_TO_RAD);
		component.autoPlay = config.autoPlay;

		if (!component.paused) {
			component.stop();
		}

		if (component.autoPlay) {
			component.play();
		}

		var promises = [];

		var cachedTextures = that._cachedPresetTextures;

		var textureRef = config.texture && config.texture.enabled && config.texture.textureRef;
		if (textureRef && config.texturePreset === 'Custom') {
			promises.push(that._load(textureRef, options).then(function (texture) {
				component.texture = texture;
				return component;
			}).then(null, function (err) {
				throw new Error('Error loading texture: ' + textureRef + ' - ' + err);
			}));
		} else if (config.texturePreset === 'Flare') {
			cachedTextures.Flare = cachedTextures.Flare || ParticleSystemUtils.createFlareTexture(32);
			component.texture = cachedTextures.Flare;
		} else if (config.texturePreset === 'Splash') {
			cachedTextures.Splash = cachedTextures.Splash || ParticleSystemUtils.createSplashTexture(32);
			component.texture = cachedTextures.Splash;
		} else if (config.texturePreset === 'Plankton') {
			cachedTextures.Plankton = cachedTextures.Plankton || ParticleSystemUtils.createPlanktonTexture(32);
			component.texture = cachedTextures.Plankton;
		} else if (config.texturePreset === 'Snowflake') {
			cachedTextures.Snowflake = cachedTextures.Snowflake || ParticleSystemUtils.createSnowflakeTexture(32);
			component.texture = cachedTextures.Snowflake;
		} else {
			component.texture = null;
		}

		if (promises.length) {
			return _rsvp.anonymus.all(promises).then(function () {
				return component;
			});
		} else {
			return component;
		}
	});
};

var exported_ParticleSystemComponentHandler = ParticleSystemComponentHandler;

/**
 * @extends ComponentHandler
 * @hidden
 */
exports.ParticleSystemComponentHandler = exported_ParticleSystemComponentHandler;
