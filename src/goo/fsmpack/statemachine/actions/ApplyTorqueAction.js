import { Action as Action_Actionjs } from "./Action";
import { Vector3 as mathVector3_Vector3js } from "../../../math/Vector3";
import { SystemBusjs as entitiesSystemBus_SystemBusjsjs } from "../../../entities/SystemBus";

function ApplyTorqueAction/*id, settings*/() {
	Action_Actionjs.apply(this, arguments);
}

ApplyTorqueAction.prototype = Object.create(Action_Actionjs.prototype);
ApplyTorqueAction.prototype.constructor = ApplyTorqueAction;

ApplyTorqueAction.external = {
	key: 'ApplyTorque',
	name: 'Apply torque on rigid body',
	type: 'physics',
	description: 'Apply a torque to the attached rigid body.',
	canTransition: false,
	parameters: [{
		name: 'Torque',
		key: 'torque',
		type: 'position',
		description: 'Torque to apply to the body.',
		'default': [0, 0, 0]
	}, {
		name: 'Space',
		key: 'space',
		type: 'string',
		control: 'dropdown',
		description: 'Whether to apply the torque in local or world space.',
		'default': 'World',
		options: ['World', 'Local']
	}],
	transitions: []
};

var torqueVector = new mathVector3_Vector3js();
ApplyTorqueAction.prototype.enter = function (fsm) {
	entitiesSystemBus_SystemBusjsjs.addListener('goo.physics.substep', this.substepListener = function () {
		var entity = fsm.getOwnerEntity();
		if (!entity || !entity.rigidBodyComponent) { return; }

		torqueVector.setArray(this.torque);
		if (this.space === 'World') {
			entity.rigidBodyComponent.applyTorque(torqueVector);
		} else {
			entity.rigidBodyComponent.applyTorqueLocal(torqueVector);
		}
	}.bind(this));
};

ApplyTorqueAction.prototype.exit = function () {
	entitiesSystemBus_SystemBusjsjs.removeListener('goo.physics.substep', this.substepListener);
};

var exported_ApplyTorqueAction = ApplyTorqueAction;
export { exported_ApplyTorqueAction as ApplyTorqueAction };