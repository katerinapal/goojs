Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.EntityHandler = undefined;

var _ConfigHandler = require("../../loaders/handlers/ConfigHandler");

var _ComponentHandler = require("../../loaders/handlers/ComponentHandler");

var _rsvp = require("../../util/rsvp");

var RSVP = _interopRequireWildcard(_rsvp);

var _StringUtils = require("../../util/StringUtils");

var StringUtils = _interopRequireWildcard(_StringUtils);

var _PromiseUtils = require("../../util/PromiseUtils");

var PromiseUtils = _interopRequireWildcard(_PromiseUtils);

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

function EntityHandler() {
	_ConfigHandler.ConfigHandler.apply(this, arguments);
	this._componentHandlers = {};
}

EntityHandler.prototype = Object.create(_ConfigHandler.ConfigHandler.prototype);
EntityHandler.prototype.constructor = EntityHandler;
_ConfigHandler.ConfigHandler._registerClass('entity', EntityHandler);

/**
 * Creates an empty entity
 * @param {string} ref will be the entity's id
 * @returns {Entity}
 * @private
 */
EntityHandler.prototype._create = function () {
	return this.world.createEntity();
};

/**
 * Removes an entity
 * @param {ref}
 * @private
 */
EntityHandler.prototype._remove = function (ref) {
	var entity = this._objects.get(ref);
	var that = this;
	if (entity) {
		// Remove components
		var promises = [];
		var components = entity._components.slice(0);
		for (var i = 0; i < components.length; i++) {
			var type = this._getComponentType(components[i]);
			var p = this._updateComponent(entity, type, null);
			if (p instanceof RSVP.Promise) {
				promises.push(p);
			}
		}
		return RSVP.all(promises).then(function () {
			entity.removeFromWorld();
			that._objects.delete(ref);
		});
	}
};

function updateTags(entity, tags) {
	entity._tags.clear();
	if (!tags) {
		return;
	}

	for (var tag in tags) {
		entity.setTag(tag);
	}
}

function updateAttributes(entity, attributes) {
	entity._attributes.clear();
	if (!attributes) {
		return;
	}

	for (var attribute in attributes) {
		entity.setAttribute(attribute, attributes[attribute]);
	}
}

/**
 * Adds/updates/removes an entity
 * @param {string} ref
 * @param {Object} config
 * @param {Object} options
 * @returns {RSVP.Promise} Resolves with the updated entity or null if removed
 */
EntityHandler.prototype._update = function (ref, config, options) {
	var that = this;
	return _ConfigHandler.ConfigHandler.prototype._update.call(this, ref, config, options).then(function (entity) {
		if (!entity) {
			return;
		}
		entity.id = ref;
		entity.name = config.name;
		entity.static = !!config.static;

		updateTags(entity, config.tags);
		updateAttributes(entity, config.customAttributes);

		var promises = [];

		// Adding/updating components
		for (var type in config.components) {
			if (config.components[type]) {
				var p = that._updateComponent(entity, type, config.components[type], options);
				if (p) {
					promises.push(p);
				} else {
					console.error('Error handling component ' + type);
				}
			}
		}

		// Removing components
		var components = entity._components;
		for (var i = 0; i < components.length; i++) {
			var type = that._getComponentType(components[i]);
			if (!config.components[type]) {
				that._updateComponent(entity, type, null, options);
			}
		}
		// When all is done, hide or show and return
		return PromiseUtils.optimisticAll(promises).then(function () /*components*/{
			if (config.hidden) {
				entity.hide();
			} else {
				entity.show();
			}
			return entity;
		});
	});
};

/**
 * Adds/updates/removes a component on an entity
 * @param {Entity} entity
 * @param {string} type
 * @param {Object} config
 * @param {Object} options
 * @returns {RSVP.Promise} Resolves with updated entity
 * @private
 */
EntityHandler.prototype._updateComponent = function (entity, type, config, options) {
	var handler = this._getHandler(type);
	if (!handler) {
		return null;
	}

	var p = handler.update(entity, config, options);
	if (!p || !p.then) {
		return null;
	}

	return p;
};

/**
 * Get the type for the component. Needed to match engine components against data model
 * component types.
 * @param {Component} component
 * @returns {string}
 * @private
 */
EntityHandler.prototype._getComponentType = function (component) {
	var type = component.type;
	type = type.slice(0, type.lastIndexOf('Component'));
	type = StringUtils.uncapitalize(type);
	if (type === 'howler') {
		type = 'sound';
	} // HowlerComponent should be renamed
	return type;
};

/**
 * Gets the handler for a component type or creates a new one if necessary
 * @param {string} type
 * @returns {ComponentHandler}
 */
EntityHandler.prototype._getHandler = function (type) {
	if (!this._componentHandlers[type]) {
		var Handler = _ComponentHandler.ComponentHandler.getHandler(type);
		if (Handler) {
			this._componentHandlers[type] = new Handler(this.world, this.getConfig, this.updateObject, this.loadObject);
		}
	}
	return this._componentHandlers[type];
};

var exported_EntityHandler = EntityHandler;

/**
 * Handler for loading entities into engine
 * @extends ConfigHandler
 * @param {World} world
 * @param {Function} getConfig
 * @param {Function} updateObject
 * @private
 */
exports.EntityHandler = exported_EntityHandler;
