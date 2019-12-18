Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.LogicNodeMultiplyFloat = undefined;

var _LogicLayer = require("./LogicLayer");

var _LogicNode = require("./LogicNode");

var _LogicNodes = require("./LogicNodes");

var LogicNodes = _interopRequireWildcard(_LogicNodes);

var _LogicInterface = require("./LogicInterface");

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

function LogicNodeMultiplyFloat() {
	_LogicNode.LogicNode.call(this);
	this.logicInterface = LogicNodeMultiplyFloat.logicInterface;
	this.type = 'LogicNodeMultiplyFloat';
	this._x = this._y = 0; // REVIEW: unused?
}

LogicNodeMultiplyFloat.prototype = Object.create(_LogicNode.LogicNode.prototype);
LogicNodeMultiplyFloat.editorName = 'MultiplyFloat';

LogicNodeMultiplyFloat.prototype.onConfigure = function (newConfig) {
	if (newConfig.value !== undefined) {
		this.value = newConfig.value;
	}
};

LogicNodeMultiplyFloat.prototype.onInputChanged = function (instDesc) {
	var x = _LogicLayer.LogicLayer.readPort(instDesc, LogicNodeMultiplyFloat.inportX);
	var y = this.value;
	_LogicLayer.LogicLayer.writeValue(instDesc, LogicNodeMultiplyFloat.outportProduct, x * y);
};

LogicNodeMultiplyFloat.logicInterface = new _LogicInterface.LogicInterface();
LogicNodeMultiplyFloat.outportProduct = LogicNodeMultiplyFloat.logicInterface.addOutputProperty('product', 'float');
LogicNodeMultiplyFloat.inportX = LogicNodeMultiplyFloat.logicInterface.addInputProperty('x', 'float', 0);
LogicNodeMultiplyFloat.logicInterface.addConfigEntry({
	name: 'value',
	type: 'float',
	label: 'Value'
});

LogicNodes.registerType('LogicNodeMultiplyFloat', LogicNodeMultiplyFloat);

var exported_LogicNodeMultiplyFloat = LogicNodeMultiplyFloat;

/**
 * Logic node that multiplies two floats.
 * @private
 */
exports.LogicNodeMultiplyFloat = exported_LogicNodeMultiplyFloat;
