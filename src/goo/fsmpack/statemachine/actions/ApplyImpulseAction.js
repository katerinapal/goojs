"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ApplyImpulseAction = undefined;

var _Action = require("../../../fsmpack/statemachine/actions/Action");

var _Vector = require("../../../math/Vector3");

var mod_ApplyImpulseAction = ApplyImpulseAction;

function ApplyImpulseAction() /*id, settings*/{
	_Action.Action.apply(this, arguments);
}

ApplyImpulseAction.prototype = Object.create(_Action.Action.prototype);
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

var impulseVector = new _Vector.Vector3();
var applyPoint = new _Vector.Vector3();
ApplyImpulseAction.prototype.enter = function (fsm) {
	var entity = fsm.getOwnerEntity();
	if (!entity.rigidBodyComponent) {
		return;
	}

	impulseVector.setArray(this.impulse);
	applyPoint.setArray(this.point);
	if (this.space === 'World') {
		entity.rigidBodyComponent.applyImpulse(impulseVector, applyPoint);
	} else {
		entity.rigidBodyComponent.applyImpulseLocal(impulseVector, applyPoint);
	}
};

exports.ApplyImpulseAction = mod_ApplyImpulseAction;