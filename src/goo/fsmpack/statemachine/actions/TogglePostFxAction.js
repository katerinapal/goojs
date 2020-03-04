import { Action as Actionjs } from "./Action";

function TogglePostFxAction/*id, settings*/() {
	Actionjs.apply(this, arguments);
}

TogglePostFxAction.prototype = Object.create(Actionjs.prototype);
TogglePostFxAction.prototype.constructor = TogglePostFxAction;

TogglePostFxAction.external = {
	key: 'Toggle Post FX',
	name: 'Toggle Post FX',
	type: 'fx',
	description: 'Enabled/disables post fx globally.',
	parameters: [{
		name: 'Set Post FX state',
		key: 'enabled',
		type: 'boolean',
		description: 'Set Post FX on/off.',
		'default': true
	}],
	transitions: []
};

TogglePostFxAction.prototype.enter = function (fsm) {
	var renderSystem = fsm.getWorld().gooRunner.renderSystem;
	if (renderSystem) {
		renderSystem.enableComposers(this.enabled);
	}
};

var exported_TogglePostFxAction = TogglePostFxAction;
export { exported_TogglePostFxAction as TogglePostFxAction };