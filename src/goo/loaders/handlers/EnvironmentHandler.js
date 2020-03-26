import { ConfigHandler as loadershandlersConfigHandler_ConfigHandlerjs } from "../../loaders/handlers/ConfigHandler";
import { ObjectUtils as utilObjectUtils_ObjectUtilsjs } from "../../util/ObjectUtils";
import { SystemBusjs as entitiesSystemBus_SystemBusjsjs } from "../../entities/SystemBus";
import { ShaderBuilder as renderershadersShaderBuilder_ShaderBuilderjs } from "../../renderer/shaders/ShaderBuilder";
import { Snow as utilSnow_Snowjs } from "../../util/Snow";
import { rsvpjs as utilrsvp_rsvpjsjs } from "../../util/rsvp";

var defaults = {
	backgroundColor: [0.3, 0.3, 0.3, 1],
	globalAmbient: [0, 0, 0],
	fog: {
		enabled: false,
		color: [1, 1, 1],
		near: 10,
		far: 1000
	}
};
var soundDefaults = {
	volume: 1,
	reverb: 0,
	rolloffFactor: 0.4,
	maxDistance: 100
};

function EnvironmentHandler() {
	loadershandlersConfigHandler_ConfigHandlerjs.apply(this, arguments);
}

EnvironmentHandler.prototype = Object.create(loadershandlersConfigHandler_ConfigHandlerjs.prototype);
EnvironmentHandler.prototype.constructor = EnvironmentHandler;
loadershandlersConfigHandler_ConfigHandlerjs._registerClass('environment', EnvironmentHandler);

EnvironmentHandler.prototype._prepare = function (config) {
	utilObjectUtils_ObjectUtilsjs.defaults(config, defaults);
};

EnvironmentHandler.prototype._create = function () {
	return {
		weatherState: {}
	};
};

EnvironmentHandler.prototype._remove = function (ref) {
	var object = this._objects.get(ref);
	this._objects.delete(ref);
	if (!object) {
		return;
	}

	// Remove weather
	for (var key in object.weatherState) {
		EnvironmentHandler.weatherHandlers[key].remove(object.weatherState);
	}

	// Reset environment
	entitiesSystemBus_SystemBusjsjs.emit('goo.setClearColor', defaults.backgroundColor);
	renderershadersShaderBuilder_ShaderBuilderjs.CLEAR_COLOR = defaults.backgroundColor;
	renderershadersShaderBuilder_ShaderBuilderjs.GLOBAL_AMBIENT = defaults.globalAmbient.slice(0, 3);
	renderershadersShaderBuilder_ShaderBuilderjs.USE_FOG = defaults.fog.enabled;
	renderershadersShaderBuilder_ShaderBuilderjs.FOG_COLOR = defaults.fog.color.slice(0, 3);
	renderershadersShaderBuilder_ShaderBuilderjs.FOG_SETTINGS = [defaults.fog.near, defaults.fog.far];

	// Reset Sound
	var soundSystem = this.world.getSystem('SoundSystem');
	if (soundSystem) {
		soundSystem.updateConfig(soundDefaults);
		soundSystem.setReverb(null);
	}
};

/**
 * Adds/updates/removes an environment
 * @param {string} ref
 * @param {Object} config
 * @param {Object} options
 * @returns {RSVP.Promise} Resolves with the updated environment or null if removed
 */
EnvironmentHandler.prototype._update = function (ref, config, options) {
	var that = this;
	return loadershandlersConfigHandler_ConfigHandlerjs.prototype._update.call(this, ref, config, options).then(function (object) {
		if (!object) { return; }

		var backgroundColor = config.backgroundColor;
		var alpha = backgroundColor[3];
		object.backgroundColor = [
			backgroundColor[0] * alpha,
			backgroundColor[1] * alpha,
			backgroundColor[2] * alpha,
			backgroundColor[3]
		];
		object.globalAmbient = config.globalAmbient.slice(0, 3);

		object.fog = utilObjectUtils_ObjectUtilsjs.deepClone(config.fog);

		// Background color
		entitiesSystemBus_SystemBusjsjs.emit('goo.setClearColor', object.backgroundColor);

		// Fog and ambient
		renderershadersShaderBuilder_ShaderBuilderjs.CLEAR_COLOR = object.backgroundColor;
		renderershadersShaderBuilder_ShaderBuilderjs.GLOBAL_AMBIENT = object.globalAmbient;
		renderershadersShaderBuilder_ShaderBuilderjs.USE_FOG = object.fog.enabled;
		renderershadersShaderBuilder_ShaderBuilderjs.FOG_COLOR = object.fog.color.slice(0, 3);
		renderershadersShaderBuilder_ShaderBuilderjs.FOG_SETTINGS = [object.fog.near, config.fog.far];

		// Weather
		for (var key in config.weather) {
			var handler = EnvironmentHandler.weatherHandlers[key];
			if (handler) {
				handler.update.call(that, config.weather[key], object.weatherState);
			}
		}

		var promises = [];

		// Skybox
		if (config.skyboxRef) {
			EnvironmentHandler.currentSkyboxRef = config.skyboxRef;
			promises.push(that._load(config.skyboxRef, { reload: true }));
		} else if (EnvironmentHandler.currentSkyboxRef) {
			var p = that.updateObject(EnvironmentHandler.currentSkyboxRef, null)
			.then(function () {
				delete EnvironmentHandler.currentSkyboxRef;
			});
			promises.push(p);
		}

		// Sound
		var soundSystem = that.world.getSystem('SoundSystem');
		if (config.sound && soundSystem) {
			soundSystem.updateConfig(config.sound);
			if (config.sound.reverbRef) {
				var p = that._load(config.sound.reverbRef, options).then(function (sound) {
					soundSystem.setReverb(sound._buffer);
				});
				promises.push(p);
			} else {
				soundSystem.setReverb(null);
			}
		}
		return utilrsvp_rsvpjsjs.all(promises).then(function () { return object; });
	});
};


EnvironmentHandler.weatherHandlers = {
	snow: {
		update: function (config, weatherState) {
			if (config.enabled) {
				if (!weatherState.snow || !weatherState.snow.enabled) {
					// add snow
					weatherState.snow = weatherState.snow || {};
					weatherState.snow.enabled = true;
					weatherState.snow.snow = new utilSnow_Snowjs(this.world.gooRunner);
				}

				weatherState.snow.snow.setEmissionVelocity(config.velocity);
				weatherState.snow.snow.setReleaseRatePerSecond(config.rate);
				weatherState.snow.snow.setEmissionHeight(config.height);
			} else if (weatherState.snow && weatherState.snow.enabled) {
				// remove snow
				weatherState.snow.snow.remove();
				weatherState.snow.enabled = false;
				delete weatherState.snow.snow;
			}
		},
		remove: function (weatherState) {
			if (weatherState.snow && weatherState.snow.snow) {
				weatherState.snow.snow.remove();
				weatherState.snow.enabled = false;
				delete weatherState.snow.snow;
			}
		}
	}
};

var exported_EnvironmentHandler = EnvironmentHandler;

/**
 * Handling environments
 * @param {World} world
 * @param {Function} getConfig
 * @param {Function} updateObject
 * @private
 */
export { exported_EnvironmentHandler as EnvironmentHandler };