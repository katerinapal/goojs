import { Action as Actionjs } from "./Action";

function PauseParticleSystemAction/*id, settings*/() {
	Actionjs.apply(this, arguments);
}
PauseParticleSystemAction.prototype = Object.create(Actionjs.prototype);
PauseParticleSystemAction.prototype.constructor = PauseParticleSystemAction;

PauseParticleSystemAction.external = {
	key: 'pauseParticleSystem',
	name: 'Pause Particle System',
	type: 'misc',
	description: 'Pauses the particle system on the entity.',
	canTransition: false,
	parameters: [],
	transitions: []
};

PauseParticleSystemAction.prototype.enter = function (fsm) {
	var entity = fsm.getOwnerEntity();
	if (!entity || !entity.particleSystemComponent) { return; }
	entity.particleSystemComponent.pause();
};

var exported_PauseParticleSystemAction = PauseParticleSystemAction;
export { exported_PauseParticleSystemAction as PauseParticleSystemAction };