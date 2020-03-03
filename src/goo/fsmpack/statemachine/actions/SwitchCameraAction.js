Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.SwitchCameraAction = undefined;

var _Action = require("../../../fsmpack/statemachine/actions/Action");

var _Renderer = require("../../../renderer/Renderer");

function SwitchCameraAction /*id, settings*/() {
	_Action.Action.apply(this, arguments);
	this._camera = null;
}

SwitchCameraAction.prototype = Object.create(_Action.Action.prototype);
SwitchCameraAction.prototype.constructor = SwitchCameraAction;

SwitchCameraAction.external = {
	key: 'Switch Camera',
	name: 'Switch Camera',
	type: 'camera',
	description: 'Switches to a selected camera.',
	parameters: [{
		name: 'Camera',
		key: 'cameraEntityRef',
		type: 'camera',
		description: 'Camera to switch to.',
		'default': null
	}],
	transitions: []
};

SwitchCameraAction.prototype.ready = function () /*fsm*/{
	this._camera = _Renderer.Renderer.mainCamera; // make this into get activeCamera
};

SwitchCameraAction.prototype.enter = function (fsm) {
	var world = fsm.getOwnerEntity()._world;
	var cameraEntity = world.entityManager.getEntityById(this.cameraEntityRef);
	if (cameraEntity && cameraEntity.cameraComponent) {
		SystemBus.emit('goo.setCurrentCamera', {
			camera: cameraEntity.cameraComponent.camera,
			entity: cameraEntity
		});
	}
};

SwitchCameraAction.prototype.cleanup = function () /*fsm*/{};

var exported_SwitchCameraAction = SwitchCameraAction;
exports.SwitchCameraAction = exported_SwitchCameraAction;
