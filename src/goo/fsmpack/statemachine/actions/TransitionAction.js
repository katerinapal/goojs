Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.TransitionAction = undefined;

var _Action = require('../../../fsmpack/statemachine/actions/Action');

function TransitionAction /*id, settings*/() {
	_Action.Action.apply(this, arguments);
}

TransitionAction.prototype = Object.create(_Action.Action.prototype);
TransitionAction.prototype.constructor = TransitionAction;

TransitionAction.external = {
	key: 'Transition',
	name: 'Transition',
	type: 'transitions',
	description: 'Transition to a selected state.',
	canTransition: true,
	parameters: [],
	transitions: [{
		key: 'transition',
		description: 'State to transition to.'
	}]
};

var labels = {
	transition: 'On Enter'
};

TransitionAction.getTransitionLabel = function (transitionKey /*, actionConfig*/) {
	return labels[transitionKey];
};

TransitionAction.prototype.enter = function (fsm) {
	fsm.send(this.transitions.transition);
};

var exported_TransitionAction = TransitionAction;
exports.TransitionAction = exported_TransitionAction;
