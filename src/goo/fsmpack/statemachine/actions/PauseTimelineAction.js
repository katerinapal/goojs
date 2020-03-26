import { Action as Action_Actionjs } from "./Action";

function PauseTimelineAction/*id, settings*/() {
	Action_Actionjs.apply(this, arguments);
}

PauseTimelineAction.prototype = Object.create(Action_Actionjs.prototype);
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