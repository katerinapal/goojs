import {
    ComponentHandler as ComponentHandler_ComponentHandlerjs,
    _registerClass as ComponentHandlerjs__registerClass,
} from "../../loaders/handlers/ComponentHandler";

import { CameraComponent as CameraComponentjs } from "../../entities/components/CameraComponent";
import { Camera as Camerajs } from "../../renderer/Camera";
import { defaults as ObjectUtilsjs_defaults } from "../../util/ObjectUtils";
function CameraComponentHandler() {
	ComponentHandler_ComponentHandlerjs.apply(this, arguments);
	this._type = 'CameraComponent';
}

CameraComponentHandler.prototype = Object.create(ComponentHandler_ComponentHandlerjs.prototype);
ComponentHandlerjs__registerClass('camera', CameraComponentHandler);
CameraComponentHandler.prototype.constructor = CameraComponentHandler;

/**
 * Prepare component. Set defaults on config here.
 * @param {Object} config
 * @returns {Object}
 * @private
 */
CameraComponentHandler.prototype._prepare = function (config) {
	ObjectUtilsjs_defaults(config, {
		near: 1,
		far: 10000,
		projectionMode: 'Perspective',
		aspect: 1,
		lockedRatio: false
	});
	if (config.projectionMode === 'Perspective' && config.fov === undefined) {
		config.fov = 45;
	}
	if (config.projectionMode === 'Parallel' && config.size === undefined) {
		config.size = 100;
	}
	if (config.projectionMode !== 'Perspective' && config.projectionMode !== 'Parallel') {
		config.projectionMode = 'Perspective';
	}
};

/**
 * Create camera component object.
 * @param {Entity} entity The entity on which this component should be added.
 * @returns {CameraComponent} the created component object
 * @private
 */
CameraComponentHandler.prototype._create = function () {
	var camera = new Camerajs(45, 1, 1, 1000);
	var component = new CameraComponentjs(camera);
	return component;
};

// TODO: Handle if cameracomponent is removed and camera is active

/**
 * Update engine cameracomponent object based on the config.
 * @param {Entity} entity The entity on which this component should be added.
 * @param {Object} config
 * @param {Object} options
 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
 */
CameraComponentHandler.prototype.update = function (entity, config, options) {
	return ComponentHandler_ComponentHandlerjs.prototype.update.call(this, entity, config, options).then(function (component) {
		if (!component) { return; }
		component.camera.setProjectionMode(Camerajs[config.projectionMode]);
		component.camera.lockedRatio = false;
		if (config.projectionMode === 'Perspective') {
			component.camera.setFrustumPerspective(config.fov, null, config.near, config.far);
		} else {
			var size = config.size;
			component.camera.setFrustum(config.near, config.far, -size, size, size, -size, null);
			component.camera.size = size;
		}
		return component;
	});
};

var exported_CameraComponentHandler = CameraComponentHandler;

/**
 * For handling loading of camera components
 * @param {World} world The goo world
 * @param {Function} getConfig The config loader function. See {@see DynamicLoader._loadRef}.
 * @param {Function} updateObject The handler function. See {@see DynamicLoader.update}.
 * @extends ComponentHandler
 * @hidden
 */
export { exported_CameraComponentHandler as CameraComponentHandler };
