import { LogicLayer as LogicLayerjs } from "./LogicLayer";
import { LogicNode as LogicNodejs } from "./LogicNode";
import { LogicNodes as LogicNodesjs } from "./LogicNodes";
import { LogicInterface as LogicInterfacejs } from "./LogicInterface";
var LogicNodeInt_outportInt;
var LogicNodeInt_ineventDecrease;
var LogicNodeInt_ineventIncrease;
var LogicNodeInt_ineventReset;
var LogicNodeInt_editorName;
var LogicNodeInt_logicInterface;
function LogicNodeInt() {
	LogicNodejs.call(this);
	LogicNodeInt_logicInterface = LogicNodeInt_logicInterface;;
	this.type = 'LogicNodeInt';
	this.defValue = 0;
	this.value = 0;
}

LogicNodeInt.prototype = Object.create(LogicNodejs.prototype);
LogicNodeInt_editorName = "Int";;

LogicNodeInt.prototype.onConfigure = function (newConfig) {
	if (newConfig.value !== undefined) {
		this.defValue = newConfig.value;
	}

	this.value = this.defValue;
};

LogicNodeInt.prototype.onConnected = function (instDesc) {
	LogicLayerjs.writeValue(instDesc, LogicNodeInt_outportInt, this.value);
};

LogicNodeInt.prototype.onEvent = function (instDesc, evt) {
	if (evt === LogicNodeInt_ineventIncrease) {
		this.value = this.value + 1;
	} else if (evt === LogicNodeInt_ineventDecrease) {
		this.value = this.value - 1;
	} else {
		this.value = this.defValue;
	}

	LogicLayerjs.writeValue(this.logicInstance, LogicNodeInt_outportInt, this.value);
};

LogicNodeInt.prototype.onSystemStarted = function () {
	LogicLayerjs.writeValue(this.logicInstance, LogicNodeInt_outportInt, this.value);
};

LogicNodeInt.prototype.onSystemStopped = function () {};

LogicNodesjs.registerType('LogicNodeInt', LogicNodeInt);

LogicNodeInt_logicInterface = new LogicInterfacejs();
LogicNodeInt_ineventReset = LogicNodeInt_logicInterface.addInputEvent("reset");;
LogicNodeInt_ineventIncrease = LogicNodeInt_logicInterface.addInputEvent("increase");;
LogicNodeInt_ineventDecrease = LogicNodeInt_logicInterface.addInputEvent("decrease");;
LogicNodeInt_outportInt = LogicNodeInt_logicInterface.addOutputProperty("value", "int");;
LogicNodeInt.logicInterface.addConfigEntry({
	name: 'value',
	type: 'int',
	label: 'Value'
});

var exported_LogicNodeInt = LogicNodeInt;

/**
 * Logic node that provides an integer.
 * @private
 */
export { exported_LogicNodeInt as LogicNodeInt };