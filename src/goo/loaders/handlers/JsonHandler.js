"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsonHandler = undefined;

var _ConfigHandler = require("../../loaders/handlers/ConfigHandler");

var _PromiseUtils = require("../../util/PromiseUtils");

function JsonHandler() {
  _ConfigHandler.ConfigHandler.apply(this, arguments);
}

JsonHandler.prototype = Object.create(_ConfigHandler.ConfigHandler.prototype);
JsonHandler.prototype.constructor = JsonHandler;
_ConfigHandler.ConfigHandler._registerClass('json', JsonHandler);

/**
 * Adds/updates/removes a json data object.
 *
 * @param {string} ref
 * @param {Object} config
 * @returns {RSVP.Promise} Resolves with the updated shader or null if removed
 */
JsonHandler.prototype._update = function (ref, config) {
  if (!config) {
    this._remove(ref);
    return _PromiseUtils.PromiseUtils.resolve();
  }

  var data;
  try {
    data = JSON.parse(config.body);
  } catch (error) {
    data = {};
  }

  return _PromiseUtils.PromiseUtils.resolve(data);
};

var exported_JsonHandler = JsonHandler;

/**
 * Handler for loading json objects.
 *
 * @param {World} world
 * @param {Function} getConfig
 * @param {Function} updateObject
 *
 * @extends ConfigHandler
 * @private
 */
exports.JsonHandler = exported_JsonHandler;
