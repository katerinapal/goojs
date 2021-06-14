var allScripts;
var create;
var getScript;
var getClasses;
var addClass;
var register;

import {
    fillDefaultValues as ScriptUtilsjs_fillDefaultValues,
    fillDefaultNames as ScriptUtilsjs_fillDefaultNames,
} from "../scripts/ScriptUtils";

import { ObjectUtils as ObjectUtils_ObjectUtils } from "../util/ObjectUtils";

// the collection of scripts
var _scripts = {};

register = function (factoryFunction) {
	var key = factoryFunction.externals.key || factoryFunction.externals.name;
	if (_scripts[key]) {
		console.warn('Script already registered for key ' + key);
		return;
	}
	//! AT: this will modify the external object but that's ok
	ScriptUtilsjs_fillDefaultNames(factoryFunction.externals.parameters);
	_scripts[key] = factoryFunction;
};

addClass = ObjectUtils_ObjectUtils.warnOnce(
	'Scripts.addClass is deprecated; please consider using the global goo object instead',
	function (/* name, klass */) {
		// deprecated as of v0.15.3 and scheduled for removal in version 0.17.0
	}
);

getClasses = ObjectUtils_ObjectUtils.warnOnce(
	'Scripts.getClasses is deprecated; please consider using the global goo object instead',
	function () {
		return window.goo;
	}
);

getScript = function (key) {
	return _scripts[key];
};

create = function (key, options) {
	var factoryFunction;
	if (typeof key === 'string') {
		factoryFunction = _scripts[key];
		if (!factoryFunction) {
			throw new Error('Script "' + key + '" is not registered');
		}
	} else if (typeof key === 'function') {
		factoryFunction = key;
	}

	var script = factoryFunction();
	script.parameters = {};
	script.environment = null;
	script.externals = factoryFunction.externals;

	if (factoryFunction.externals) {
		ScriptUtilsjs_fillDefaultNames(script.externals.parameters);
		ScriptUtilsjs_fillDefaultValues(script.parameters, factoryFunction.externals.parameters);
	}

	if (options) {
		ObjectUtils_ObjectUtils.extend(script.parameters, options);
	}

	return script;
};

allScripts = function () {
	// REVIEW: Why not return _scripts? Document this function.
	var scripts = {};
	var keys = Object.keys(_scripts);
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		scripts[key] = _scripts[key];
	}
	return scripts;
};

export { register, getScript, create };
