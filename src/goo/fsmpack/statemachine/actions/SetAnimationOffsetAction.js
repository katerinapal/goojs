import { Action as Actionjs } from "../../../fsmpack/statemachine/actions/Action";

function SetAnimationOffsetAction/*id, settings*/() {
	Actionjs.apply(this, arguments);
}

SetAnimationOffsetAction.prototype = Object.create(Actionjs.prototype);
SetAnimationOffsetAction.prototype.constructor = SetAnimationOffsetAction;

SetAnimationOffsetAction.external = {
	key: 'Set Animation Offset',
	name: 'Set Animation Offset',
	type: 'animation',
	description: 'Sets animation clip offset.',
	parameters: [{
		name: 'Offset (sec)',
		key: 'offset',
		type: 'float',
		description: 'Animation offset',
		'default': 0
	}],
	transitions: []
};

SetAnimationOffsetAction.prototype.enter = function (fsm) {
	var entity = fsm.getOwnerEntity();
	if (entity.animationComponent) {
		entity.animationComponent.shiftClipTime(this.offset);
	}
};

var exported_SetAnimationOffsetAction = SetAnimationOffsetAction;
export { exported_SetAnimationOffsetAction as SetAnimationOffsetAction };