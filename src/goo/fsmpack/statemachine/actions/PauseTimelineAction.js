import { Action as Actionjs } from "./Action";

function PauseTimelineAction/*id, settings*/() {
	Actionjs.apply(this, arguments);
}

PauseTimelineAction.prototype = Object.create(Actionjs.prototype);
PauseTimelineAction.prototype.constructor = PauseTimelineAction;

PauseTimelineAction.external = {
	key: 'Pause Timeline',
	name: 'Pause Timeline',
	type: 'timeline',
	description: 'Pauses the timeline.',
	canTransition: true,
	parameters: [],
	transitions: []
};

PauseTimelineAction.prototype.enter = function (fsm) {
	var entity = fsm.getOwnerEntity();

	if (!entity.hasComponent('TimelineComponent')) { return; }

	entity.timelineComponent.pause();
};

var exported_PauseTimelineAction = PauseTimelineAction;
export { exported_PauseTimelineAction as PauseTimelineAction };