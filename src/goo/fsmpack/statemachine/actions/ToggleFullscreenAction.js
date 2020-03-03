Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ToggleFullscreenAction = undefined;

var _Action = require("./Action");

var _GameUtils = require("./../../../util/GameUtils");

function ToggleFullscreenAction /*id, settings*/() {
	_Action.Action.apply(this, arguments);
}

ToggleFullscreenAction.prototype = Object.create(_Action.Action.prototype);
ToggleFullscreenAction.prototype.constructor = ToggleFullscreenAction;

ToggleFullscreenAction.external = {
	key: 'Toggle Fullscreen',
	name: 'Toggle Fullscreen',
	type: 'display',
	description: 'Toggles fullscreen on/off. Note that in most browsers this must be initiated by a user gesture. For example, click or touch.',
	parameters: [],
	transitions: []
};

ToggleFullscreenAction.prototype.enter = function () /*fsm*/{
	(0, _GameUtils.toggleFullScreen)();
};

var exported_ToggleFullscreenAction = ToggleFullscreenAction;
exports.ToggleFullscreenAction = exported_ToggleFullscreenAction;
