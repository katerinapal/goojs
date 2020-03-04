import { LogicLayer as LogicLayerjs } from "./LogicLayer";
import { LogicNode as LogicNodejs } from "./LogicNode";
import { LogicInterface as LogicInterfacejs } from "./LogicInterface";
import { LogicNodes as LogicNodesjs } from "./LogicNodes";
var LogicNodeTime_inEventReset;
var LogicNodeTime_inEventStop;
var LogicNodeTime_inEventStart;
var LogicNodeTime_outEventReached1;
var LogicNodeTime_outPropTime;
var LogicNodeTime_editorName;
var LogicNodeTime_logicInterface;
function LogicNodeTime() {
	LogicNodejs.call(this);
	this.wantsProcessCall = true;
	LogicNodeTime_logicInterface = LogicNodeTime_logicInterface;;
	this.type = 'LogicNodeTime';
	this._time = 0;
	this._running = true;
}

// Logic interface set-up
LogicNodeTime.prototype = Object.create(LogicNodejs.prototype);

LogicNodeTime_editorName = "Time";;
LogicNodeTime_logicInterface = new LogicInterfacejs();

// ports
LogicNodeTime_outPropTime = LogicNodeTime_logicInterface.addOutputProperty("Time", "float");;

// events
LogicNodeTime_outEventReached1 = LogicNodeTime_logicInterface.addOutputEvent(">1");;
LogicNodeTime_inEventStart = LogicNodeTime_logicInterface.addInputEvent("Start");;
LogicNodeTime_inEventStop = LogicNodeTime_logicInterface.addInputEvent("Stop");;
LogicNodeTime_inEventReset = LogicNodeTime_logicInterface.addInputEvent("Reset");;

LogicNodeTime.prototype.onConfigure = function () {
	this._time = 0;
	this._running = true;
};

// Process
LogicNodeTime.prototype.processLogic = function (tpf) {
	if (this._running) {
		var old = this._time;
		this._time += tpf;
		LogicLayerjs.writeValue(this.logicInstance, LogicNodeTime_outPropTime, this._time);

		if (old < 1 && this._time >= 1) {
			LogicLayerjs.fireEvent(this.logicInstance, LogicNodeTime_outEventReached1);
		}
	}
};

// should they have args too?
LogicNodeTime.prototype.onEvent = function (instDesc, event) {
	if (event === LogicNodeTime_inEventStart) {
		this._running = true;
	} else if (event === LogicNodeTime_inEventStop) {
		this._running = false;
	} else if (event === LogicNodeTime_inEventReset) {
		this._time = 0;
		LogicLayerjs.writeValue(this.logicInstance, LogicNodeTime_outPropTime, 0);
	}
};

LogicNodesjs.registerType('LogicNodeTime', LogicNodeTime);

var exported_LogicNodeTime = LogicNodeTime;

/**
 * Logic node implementing a time counter. Processed every frame and time is increased. Output
 * can be read through the 'Time' port
 * @private
 */
export { exported_LogicNodeTime as LogicNodeTime };