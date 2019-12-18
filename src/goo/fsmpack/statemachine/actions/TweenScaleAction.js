Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.TweenScaleAction = undefined;

var _Action = require("../../../fsmpack/statemachine/actions/Action");

var _Vector = require("../../../math/Vector3");

var _Easing = require("../../../util/Easing");

var Easing = _interopRequireWildcard(_Easing);

function _interopRequireWildcard(obj) {
	if (obj && obj.__esModule) {
		return obj;
	} else {
		var newObj = {};if (obj != null) {
			for (var key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
			}
		}newObj.default = obj;return newObj;
	}
}

function TweenScaleAction /*id, settings*/() {
	_Action.Action.apply(this, arguments);

	this.fromScale = new _Vector.Vector3();
	this.toScale = new _Vector.Vector3();
	this.completed = false;
}

TweenScaleAction.prototype = Object.create(_Action.Action.prototype);
TweenScaleAction.prototype.constructor = TweenScaleAction;

TweenScaleAction.external = {
	key: 'Tween Scale',
	name: 'Tween Scale',
	type: 'animation',
	description: 'Transition to the set scale.',
	canTransition: true,
	parameters: [{
		name: 'Scale',
		key: 'to',
		type: 'position',
		description: 'Scale.',
		'default': [0, 0, 0]
	}, {
		name: 'Relative',
		key: 'relative',
		type: 'boolean',
		description: 'If true add, otherwise set.',
		'default': true
	}, {
		name: 'Time (ms)',
		key: 'time',
		type: 'float',
		description: 'Time it takes for this movement to complete.',
		'default': 1000
	}, {
		name: 'Easing type',
		key: 'easing1',
		type: 'string',
		control: 'dropdown',
		description: 'Easing type.',
		'default': 'Linear',
		options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
	}, {
		name: 'Direction',
		key: 'easing2',
		type: 'string',
		control: 'dropdown',
		description: 'Easing direction.',
		'default': 'In',
		options: ['In', 'Out', 'InOut']
	}],
	transitions: [{
		key: 'complete',
		description: 'State to transition to when the scaling completes.'
	}]
};

TweenScaleAction.getTransitionLabel = function (transitionKey /*, actionConfig*/) {
	return transitionKey === 'complete' ? 'On Tween Scale Complete' : undefined;
};

TweenScaleAction.prototype.enter = function (fsm) {
	var transformComponent = fsm.getOwnerEntity().transformComponent;

	this.fromScale.set(transformComponent.transform.scale);
	this.toScale.setDirect(this.to[0], this.to[1], this.to[2]);
	if (this.relative) {
		this.toScale.add(this.fromScale);
	}

	this.startTime = fsm.getTime();
	this.completed = false;
};

TweenScaleAction.prototype.update = function (fsm) {
	if (this.completed) {
		return;
	}
	var transformComponent = fsm.getOwnerEntity().transformComponent;

	var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
	var fT = Easing[this.easing1][this.easing2](t);

	transformComponent.transform.scale.set(this.fromScale).lerp(this.toScale, fT);
	transformComponent.setUpdated();

	if (t >= 1) {
		fsm.send(this.transitions.complete);
		this.completed = true;
	}
};

var exported_TweenScaleAction = TweenScaleAction;
exports.TweenScaleAction = exported_TweenScaleAction;
