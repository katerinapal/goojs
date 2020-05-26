var SceneHandler_SceneHandler = SceneHandler;
import { ConfigHandler as loadershandlersConfigHandler_ConfigHandlerjs } from "../../loaders/handlers/ConfigHandler";
import { SystemBusjs as entitiesSystemBus_SystemBusjsjs } from "../../entities/SystemBus";
import { rsvpjs as utilrsvp_rsvpjsjs } from "../../util/rsvp";
function SceneHandler() {
	loadershandlersConfigHandler_ConfigHandlerjs.apply(this, arguments);
}

SceneHandler.prototype = Object.create(loadershandlersConfigHandler_ConfigHandlerjs.prototype);
SceneHandler.prototype.constructor = SceneHandler;
loadershandlersConfigHandler_ConfigHandlerjs._registerClass('scene', SceneHandler);

/**
 * Removes the scene, i e removes all entities in scene from engine world
 * @param {ref}
 */
SceneHandler.prototype._remove = function (ref) {
	//Todo Clear engine
	var scene = this._objects.get(ref);
	if (scene) {
		for (var i = 0; i < scene.entities.length; i++) {
			scene.entities[i].removeFromWorld();
		}
	}
	// Remove posteffects
	// Remove environment

	this._objects.delete(ref);
};

/**
 * Creates an empty scene which will hold some scene data
 * @returns {Entity}
 * @private
 */
SceneHandler.prototype._create = function () {
	return {
		id: null,
		entities: {},
		posteffects: [],
		environment: null,
		initialCameraRef: null
	};
};

/**
 * Creates/updates/removes a scene
 * @param {string} ref
 * @param {Object} config
 * @param {Object} options
 * @returns {RSVP.Promise} Resolves with the updated scene or null if removed
 */
SceneHandler.prototype._update = function (ref, config, options) {
	var that = this;
	return loadershandlersConfigHandler_ConfigHandlerjs.prototype._update.call(this, ref, config, options).then(function (scene) {
		if (!scene) { return; }
		scene.id = ref;
		var promises = [];
		promises.push(that._handleEntities(config, scene, options));
		if (config.posteffectsRef) {
			promises.push(that._load(config.posteffectsRef, options));
		}
		if (config.environmentRef) {
			promises.push(that._load(config.environmentRef, options));
		}
		if (!options.scene || !options.scene.dontSetCamera) {
			if (config.initialCameraRef && config.initialCameraRef !== scene.initialCameraRef) {
				promises.push(that._load(config.initialCameraRef, options).then(function (cameraEntity) {
					if (cameraEntity && cameraEntity.cameraComponent) {
						entitiesSystemBus_SystemBusjsjs.emit('goo.setCurrentCamera', {
							camera: cameraEntity.cameraComponent.camera,
							entity: cameraEntity
						});
					}
					scene.initialCameraRef = config.initialCameraRef;
				}));
			}
		}
		return utilrsvp_rsvpjsjs.all(promises).then(function () {
			return scene;
		});
	});
};

/**
 * Adding and removing entities to the engine and thereby the scene
 * @param {Object} config
 * @param {Object} scene
 * @param {Object} options
 */
SceneHandler.prototype._handleEntities = function (config, scene, options) {
	var that = this;

	var removedEntityIds = Object.keys(scene.entities).filter(function (id) {
		return !config.entities[id];
	});

	return utilrsvp_rsvpjsjs.all([
		this._loadEntities(Object.keys(config.entities)),
		this._loadEntities(removedEntityIds)
	])
	.then(function (result) {
		that._addEntities(scene, result[0])
		that._removeEntities(scene, result[1]);
	});
};

SceneHandler.prototype._loadEntities = function (ids, options) {
	var that = this;

	return utilrsvp_rsvpjsjs.all(ids.map(function (id) {
		return that._load(id, options);
	}));
};

SceneHandler.prototype._addEntities = function (scene, entities) {
	entities.forEach(function (entity) {
		scene.entities[entity.id] = entity;
		if (!entity._world.entityManager.containsEntity(entity)) {
			entity.addToWorld();
		}
	});
};

SceneHandler.prototype._removeEntities = function (scene, entities) {
	entities.forEach(function (entity) {
		entity.removeFromWorld();
		delete scene.entities[entity.id];
	});
};

/**
 * Handling posteffects
 * @param {Object} config
 * @param {Object} scene
 * @param {Object} options
 */
SceneHandler.prototype._handlePosteffects = function (config, scene, options) {
	return this._load(config.posteffectsRef, options);
};

/**
 * Handling environment, to be implemented
 * @param {Object} config
 * @param {Object} scene
 * @param {Object} options
 */
SceneHandler.prototype._handleEnvironment = function (config, scene, options) {
	return this._load(config.environmentRef, options);
};

/**
 * Handler for loading scene into engine
 * @extends ConfigHandler
 * @param {World} world
 * @param {Function} getConfig
 * @param {Function} updateObject
 * @private
 */
export { SceneHandler_SceneHandler as SceneHandler };