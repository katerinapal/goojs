Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.StartParticleSystemAction = undefined;

var _Action = require('./Action');

function StartParticleSystemAction /*id, settings*/() {
	_Action.Action.apply(this, arguments);
}
StartParticleSystemAction.prototype = Object.create(_Action.Action.prototype);
StartParticleSystemAction.prototype.constructor = StartParticleSystemAction;

StartParticleSystemAction.external = {
	key: 'startParticleSystem',
	name: 'Start Particle System',
	type: 'misc',
	description: 'Starts / plays the particle system on the entity.',
	canTransition: false,
	parameters: [],
	transitions: []
};

StartParticleSystemAction.prototype.enter = function (fsm) {
	var entity = fsm.getOwnerEntity();
	if (!entity || !entity.particleSystemComponent) {
		return;
	}
	entity.particleSystemComponent.play();
};

var exported_StartParticleSystemAction = StartParticleSystemAction;
exports.StartParticleSystemAction = exported_StartParticleSystemAction;
