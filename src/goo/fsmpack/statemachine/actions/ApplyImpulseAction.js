var ApplyImpulseAction_ApplyImpulseAction = ApplyImpulseAction;
import { Action as fsmpackstatemachineactionsAction_Actionjs } from "../../../fsmpack/statemachine/actions/Action";
import { Vector3 as mathVector3_Vector3js } from "../../../math/Vector3";

function ApplyImpulseAction/*id, settings*/() {
	fsmpackstatemachineactionsAction_Actionjs.apply(this, arguments);
}

ApplyImpulseAction.prototype = Object.create(fsmpackstatemachineactionsAction_Actionjs.prototype);
ApplyImpulseAction.prototype.constructor = ApplyImpulseAction;

ApplyImpulseAction.external = {
	key: 'ApplyImpulse',
	name: 'Apply impulse on rigid body',
	type: 'physics',
	description: 'Apply an impulse to the attached rigid body.',
	canTransition: false,
	parameters: [{
		name: 'Impulse',
		key: 'impulse',
		type: 'position',
		description: 'Impulse to apply to the body.',
		'default': [0, 0, 0]
	}, {
		name: 'Apply point',
		key: 'point',
		type: 'position',
		description: 'Where on the body to apply the impulse, relative to the center of mass.',
		'default': [0, 0, 0]
	}, {
		name: 'Space',
		key: 'space',
		type: 'string',
		control: 'dropdown',
		description: 'The space where the impulse and apply point are defined.',
		'default': 'World',
		options: ['World', 'Local']
	}],
	transitions: []
};

var impulseVector = new mathVector3_Vector3js();
var applyPoint = new mathVector3_Vector3js();
ApplyImpulseAction.prototype.enter = function (fsm) {
	var entity = fsm.getOwnerEntity();
	if (!entity.rigidBodyComponent) { return; }

	impulseVector.setArray(this.impulse);
	applyPoint.setArray(this.point);
	if (this.space === 'World') {
		entity.rigidBodyComponent.applyImpulse(impulseVector, applyPoint);
	} else {
		entity.rigidBodyComponent.applyImpulseLocal(impulseVector, applyPoint);
	}
};

export { ApplyImpulseAction_ApplyImpulseAction as ApplyImpulseAction };