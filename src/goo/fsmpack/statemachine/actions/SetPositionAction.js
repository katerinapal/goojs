"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.SetPositionAction = undefined;

var _Action = require("../../../fsmpack/statemachine/actions/Action");

var _FsmUtils = require("../../../fsmpack/statemachine/FsmUtils");

var mod_SetPositionAction = SetPositionAction;

function SetPositionAction() /*id, settings*/{
	_Action.Action.apply(this, arguments);
}

SetPositionAction.prototype = Object.create(_Action.Action.prototype);
SetPositionAction.prototype.constructor = SetPositionAction;

SetPositionAction.prototype.configure = function (settings) {
	this.everyFrame = !!settings.everyFrame;
	this.entity = settings.entity || null;
	this.amountX = settings.amountX || 0;
	this.amountY = settings.amountY || 0;
	this.amountZ = settings.amountZ || 0;
};

SetPositionAction.external = {
	key: 'Set Position',
	name: 'Set Position',
	parameters: [{
		name: 'Entity',
		key: 'entity',
		type: 'entity',
		description: 'Entity to move.'
	}, {
		name: 'Amount X',
		key: 'amountX',
		type: 'float',
		description: 'Position on the X axis.',
		'default': 0
	}, {
		name: 'Amount Y',
		key: 'amountY',
		type: 'float',
		description: 'Position on the Y axis.',
		'default': 0
	}, {
		name: 'Amount Z',
		key: 'amountZ',
		type: 'float',
		description: 'Position on the Z axis.',
		'default': 0
	}, {
		name: 'On every frame',
		key: 'everyFrame',
		type: 'boolean',
		description: 'Repeat this action every frame.',
		'default': true
	}],
	transitions: []
};

SetPositionAction.prototype.update = function (fsm) {
	if (this.entity !== null) {
		this.entity.transformComponent.transform.translation.setDirect(_FsmUtils.FsmUtils.getValue(this.amountX, fsm), _FsmUtils.FsmUtils.getValue(this.amountY, fsm), _FsmUtils.FsmUtils.getValue(this.amountZ, fsm));
		this.entity.transformComponent.setUpdated();
	}
};

exports.SetPositionAction = mod_SetPositionAction;