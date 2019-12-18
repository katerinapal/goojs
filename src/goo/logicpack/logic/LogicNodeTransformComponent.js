Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.LogicNodeTransformComponent = undefined;

var _LogicLayer = require("./LogicLayer");

var _LogicNode = require("./LogicNode");

var _LogicNodes = require("./LogicNodes");

var LogicNodes = _interopRequireWildcard(_LogicNodes);

var _LogicInterface = require("./LogicInterface");

var _Vector = require("../../math/Vector3");

var _Matrix = require("../../math/Matrix3");

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

function LogicNodeTransformComponent() {
	_LogicNode.LogicNode.call(this);
	this.logicInterface = LogicNodeTransformComponent.logicInterface;
	this.type = 'TransformComponent';
}

LogicNodeTransformComponent.prototype = Object.create(_LogicNode.LogicNode.prototype);
LogicNodeTransformComponent.editorName = 'TransformComponent';

LogicNodeTransformComponent.prototype.onConfigure = function (config) {
	this.entityRef = config.entityRef; //
};

LogicNodeTransformComponent.prototype.onInputChanged = function (instDesc, portID, value) {
	var entity = _LogicLayer.LogicLayer.resolveEntityRef(instDesc, this.entityRef);
	var transformComponent = entity.transformComponent;

	if (portID === LogicNodeTransformComponent.inportPos) {
		transformComponent.setTranslation(value);
	} else if (portID === LogicNodeTransformComponent.inportRot) {
		transformComponent.setRotation(value[0], value[1], value[2]);
	} else if (portID === LogicNodeTransformComponent.inportScale) {
		transformComponent.setScale(value);
	}
	_LogicLayer.LogicLayer.writeValue(this.logicInstance, LogicNodeTransformComponent.outportPos, entity.transformComponent.transform.translation.clone());
	_LogicLayer.LogicLayer.writeValue(this.logicInstance, LogicNodeTransformComponent.outportRot, entity.transformComponent.transform.rotation.clone());
};

LogicNodeTransformComponent.logicInterface = new _LogicInterface.LogicInterface('Transform');
LogicNodeTransformComponent.inportPos = LogicNodeTransformComponent.logicInterface.addInputProperty('position', 'Vector3', new _Vector.Vector3(0, 0, 0));
LogicNodeTransformComponent.inportRot = LogicNodeTransformComponent.logicInterface.addInputProperty('rotation', 'Vector3', new _Vector.Vector3(0, 0, 0));
LogicNodeTransformComponent.inportScale = LogicNodeTransformComponent.logicInterface.addInputProperty('scale', 'Vector3', new _Vector.Vector3(1, 1, 1));
LogicNodeTransformComponent.outportPos = LogicNodeTransformComponent.logicInterface.addOutputProperty('outpos', 'Vector3', new _Vector.Vector3());
LogicNodeTransformComponent.outportRot = LogicNodeTransformComponent.logicInterface.addOutputProperty('rotmat', 'Matrix3', new _Matrix.Matrix3());
LogicNodeTransformComponent.logicInterface.addConfigEntry({
	name: 'entityRef',
	type: 'entityRef',
	label: 'Entity'
});

LogicNodes.registerType('TransformComponent', LogicNodeTransformComponent);

var exported_LogicNodeTransformComponent = LogicNodeTransformComponent;

/**
 * Logic node that connects to the transform component of an entity.
 * @private
 */
exports.LogicNodeTransformComponent = exported_LogicNodeTransformComponent;
