'use strict';

var _Actions = require('../../../../../src/goo/fsmpack/statemachine/actions/Actions');

describe('Actions', function () {
	it('Every action has a key', function () {
		var allActions = (0, _Actions.allActionsArray)();
		for (var i = 0; i < allActions.length; i++) {
			expect(allActions[i]).toBeTruthy();
		}
	});
});