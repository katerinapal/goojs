import { ComponentHandler as ComponentHandlerjs } from "../loaders/handlers/ComponentHandler";
import { TimelineComponent as TimelineComponentjs } from "../timelinepack/TimelineComponent";
import { ValueChannel as ValueChanneljs } from "../timelinepack/ValueChannel";
import { EventChannel as EventChannel_EventChanneljs } from "../timelinepack/EventChannel";
import { ArrayUtils as ArrayUtilsjs } from "../util/ArrayUtils";
import { ObjectUtils as ObjectUtilsjs } from "../util/ObjectUtils";
import { Linear as Easingjs_Linear } from "../util/Easing";
function TimelineComponentHandler() {
	ComponentHandlerjs.apply(this, arguments);
	this._type = 'TimelineComponent';
}

TimelineComponentHandler.prototype = Object.create(ComponentHandlerjs.prototype);
TimelineComponentHandler.prototype.constructor = TimelineComponentHandler;
ComponentHandlerjs._registerClass('timeline', TimelineComponentHandler);

TimelineComponentHandler.prototype._prepare = function (/*config*/) {};

TimelineComponentHandler.prototype._create = function () {
	var component = new TimelineComponentjs();
	return component;
};

TimelineComponentHandler.tweenMap = {
	translationX: ValueChanneljs.getSimpleTransformTweener.bind(null, 'translation', 'x'),
	translationY: ValueChanneljs.getSimpleTransformTweener.bind(null, 'translation', 'y'),
	translationZ: ValueChanneljs.getSimpleTransformTweener.bind(null, 'translation', 'z'),
	scaleX: ValueChanneljs.getSimpleTransformTweener.bind(null, 'scale', 'x'),
	scaleY: ValueChanneljs.getSimpleTransformTweener.bind(null, 'scale', 'y'),
	scaleZ: ValueChanneljs.getSimpleTransformTweener.bind(null, 'scale', 'z'),
	rotationX: ValueChanneljs.getRotationTweener.bind(null, 0),
	rotationY: ValueChanneljs.getRotationTweener.bind(null, 1),
	rotationZ: ValueChanneljs.getRotationTweener.bind(null, 2)
};

function getEasingFunction(easingString) {
	if (!easingString) {
		return Easingjs_Linear.None;
	}
	var separator = easingString.indexOf('.');
	var easingType = easingString.substr(0, separator);
	var easingDirection = easingString.substr(separator + 1);
	return Easing[easingType][easingDirection];
}

function updateValueChannelKeyframe(keyframeConfig, keyframeId, channel) {
	var needsResorting = false;

	var keyframe = ArrayUtilsjs.find(channel.keyframes, function (keyframe) {
		return keyframe.id === keyframeId;
	});

	var easingFunction = getEasingFunction(keyframeConfig.easing);

	// create a new keyframe if it does not exist already or update it if it exists
	if (!keyframe) {
		channel.addKeyframe(
			keyframeId,
			keyframeConfig.time,
			keyframeConfig.value,
			easingFunction
		);
	} else {
		// the time of one keyframe changed so we're not certain anymore that they're sorted
		if (keyframe.time !== +keyframeConfig.time) {
			needsResorting = true;
		}
		keyframe.time = +keyframeConfig.time;
		keyframe.value = +keyframeConfig.value;
		keyframe.easingFunction = easingFunction;
	}

	return {
		needsResorting: needsResorting
	};
}

function updateEventChannelKeyFrame(keyframeConfig, keyframeId, channel, channelConfig) {
	var needsResorting = false;

	var callbackEntry = ArrayUtilsjs.find(channel.keyframes, function (callbackEntry) {
		return callbackEntry.id === keyframeId;
	});

	// create the event emitter callback, we're gonna use it anyway
	var eventEmitter = function () {
		SystemBus.emit(channelConfig.eventName, keyframeConfig.value);
	};

	// create a new callback entry in the callback agenda if it does not exist already or update it if it exists
	if (!callbackEntry) {
		channel.addCallback(keyframeId, keyframeConfig.time, eventEmitter);
	} else {
		// the time of one keyframe changed so we're not certain anymore that they're sorted
		if (callbackEntry.time !== +keyframeConfig.time) {
			needsResorting = true;
		}
		callbackEntry.time = +keyframeConfig.time;
		callbackEntry.callback = eventEmitter;
	}

	return {
		needsResorting: needsResorting
	};
}

function updateChannel(channelConfig, channelId, component, entityResolver, rotationMap) {
	// search for existing one
	var channel = ArrayUtilsjs.find(component.channels, function (channel) {
		return channel.id === channelId;
	});

	// and create one if needed
	if (!channel) {
		var key = channelConfig.propertyKey;
		if (key) {
			var entityId = channelConfig.entityId;
			if (entityId && !rotationMap[entityId]) {
				rotationMap[entityId] = [0, 0, 0];
			}
			var updateCallback =
				TimelineComponentHandler.tweenMap[key](entityId, entityResolver, rotationMap[entityId]);

			channel = new ValueChanneljs(channelId, {
				callbackUpdate: updateCallback
			});
		} else {
			channel = new EventChannel_EventChanneljs(channelId);
		}
		component.channels.push(channel);
	} else if (channelConfig.entityId && channel.callbackUpdate && channel.callbackUpdate.rotation) {
		var rotation = rotationMap[channelConfig.entityId] = channel.callbackUpdate.rotation;
		rotation[0] = 0;
		rotation[1] = 0;
		rotation[2] = 0;
	}

	channel.enabled = channelConfig.enabled !== false;

	// remove existing keyframes in the channel that are not mentioned in the config anymore
	// filter preserves the order, otherwise the channel would fail to work
	// the keyframes need always be sorted by their time property
	channel.keyframes = channel.keyframes.filter(function (keyframe) {
		return !!channelConfig.keyframes[keyframe.id];
	});

	var needsResorting = false;

	if (channelConfig.propertyKey) {
		for (var keyframeId in channelConfig.keyframes) {
			var keyframeConfig = channelConfig.keyframes[keyframeId];
			var updateResult = updateValueChannelKeyframe(keyframeConfig, keyframeId, channel, channelConfig);
			needsResorting = needsResorting || updateResult.needsResorting;
		}
	} else {
		for (var keyframeId in channelConfig.keyframes) {
			var keyframeConfig = channelConfig.keyframes[keyframeId];
			var updateResult = updateEventChannelKeyFrame(keyframeConfig, keyframeId, channel, channelConfig);
			needsResorting = needsResorting || updateResult.needsResorting;
		}
	}

	// !AT: if time was changed for any keyframe then the whole channel might not work as expected
	// could make this even faster but let's not go that far
	if (needsResorting) {
		channel.sort();
	}
}

TimelineComponentHandler.prototype.update = function (entity, config, options) {
	var that = this;
	return ComponentHandlerjs.prototype.update.call(this, entity, config, options).then(function (component) {
		if (!component) { return; }

		if (!isNaN(config.duration)) {
			component.duration = +config.duration;
		}
		component.loop = (config.loop.enabled === true);

		component.autoStart = (config.autoStart !== undefined ? config.autoStart : true);
		if (component.autoStart) {
			component.start();
		} else {
			component.stop();
		}

		// remove existing channels in the component that are not mentioned in the config anymore
		component.channels = component.channels.filter(function (channel) {
			return !!config.channels[channel.id];
		});

		var entityResolver = function (entityId) {
			return that.world.entityManager.getEntityById(entityId);
		};
		var rotationMap = {};

		ObjectUtilsjs.forEach(config.channels, function (channelConfig) {
			updateChannel(channelConfig, channelConfig.id, component, entityResolver, rotationMap);
		}, null, 'sortValue');

		return component;
	});
};

var exported_TimelineComponentHandler = TimelineComponentHandler;

/**
 * @hidden
 */
export { exported_TimelineComponentHandler as TimelineComponentHandler };