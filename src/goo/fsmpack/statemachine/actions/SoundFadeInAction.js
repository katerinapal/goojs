import { Action as fsmpackstatemachineactionsAction_Actionjs } from "../../../fsmpack/statemachine/actions/Action";
import { PromiseUtils as utilPromiseUtil_PromiseUtilsjs } from "../../../util/PromiseUtil";

function SoundFadeInAction/*id, settings*/() {
	fsmpackstatemachineactionsAction_Actionjs.apply(this, arguments);
}

SoundFadeInAction.prototype = Object.create(fsmpackstatemachineactionsAction_Actionjs.prototype);
SoundFadeInAction.prototype.constructor = SoundFadeInAction;

SoundFadeInAction.external = {
	key: 'Sound Fade In',
	name: 'Sound Fade In',
	type: 'sound',
	description: 'Fades in a sound. NOTE: On iOS devices, you need to play the first sound inside a touchend event (for example using the MouseUpAction).',
	canTransition: true,
	parameters: [{
		name: 'Sound',
		key: 'sound',
		type: 'sound',
		description: 'Sound to fade.'
	}, {
		name: 'Time (ms)',
		key: 'time',
		type: 'float',
		description: 'Time it takes for the fading to complete.',
		'default': 1000
	}, {
		name: 'On Sound End',
		key: 'onSoundEnd',
		type: 'boolean',
		description: 'Whether to transition when the sound finishes playing, regardless of the specified transition time.',
		'default': false
	}],
	transitions: [{
		key: 'complete',
		description: 'State to transition to when the time expires or when the sound finishes playing.'
	}]
};

var labels = {
	complete: 'On Sound Fade In Complete'
};

SoundFadeInAction.getTransitionLabel = function (transitionKey /*, actionConfig*/){
	return labels[transitionKey];
};

SoundFadeInAction.prototype.enter = function (fsm) {
	var entity = fsm.getOwnerEntity();

	if (!entity.hasComponent('SoundComponent')) { return; }

	var sound = entity.soundComponent.getSoundById(this.sound);
	if (!sound) { return; }

	var endPromise;
	try {
		endPromise = sound.fadeIn(this.time / 1000);

		if (this.onSoundEnd) {
			endPromise = sound.play();
		}
	} catch (e) {
		console.warn('Could not play sound: ' + e);
		endPromise = utilPromiseUtil_PromiseUtilsjs();
	}

	endPromise.then(function () {
		fsm.send(this.transitions.complete);
	}.bind(this));
};

var exported_SoundFadeInAction = SoundFadeInAction;
export { exported_SoundFadeInAction as SoundFadeInAction };