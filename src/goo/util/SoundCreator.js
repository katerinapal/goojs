var SoundCreator_SoundCreator = SoundCreator;
import { SoundHandler as loadershandlersSoundHandler_SoundHandlerjs } from "../loaders/handlers/SoundHandler";
import { AudioContextjs as soundAudioContext_AudioContextjsjs } from "../sound/AudioContext";
import { Ajax as utilAjax_Ajaxjs } from "../util/Ajax";

import {
    createUniqueId as StringUtilsjs_createUniqueId,
    getAfterLast as StringUtilsjs_getAfterLast,
} from "../util/StringUtils";

import { PromiseUtils as utilPromiseUtils_PromiseUtilsjs } from "../util/PromiseUtils";
function SoundCreator() {
	var ajax = this.ajax = new utilAjax_Ajaxjs();

	this.soundHandler = new loadershandlersSoundHandler_SoundHandlerjs(
		{},
		function (ref, options) {
			return ajax.load(ref, options ? options.noCache : false);
		},
		function () {},
		function (ref, options) {
			return ajax.load(ref, options ? options.noCache : false);
		}
	);
}

/**
 * Releases any references to cached objects
 */
SoundCreator.prototype.clear = function () {
	this.ajax.clear();
	this.soundHandler.clear();
};

/**
 * Load a sound.
 * @param  {string}   url
 * @param  {Object}   settings
 * @returns {RSVP.Promise}
 */
SoundCreator.prototype.loadSound = function (url, settings) {
	if (!soundAudioContext_AudioContextjsjs.isSupported()) {
		return utilPromiseUtils_PromiseUtilsjs.reject(new Error('AudioContext is not supported!'));
	}

	var id = StringUtilsjs_createUniqueId('sound');
	settings = settings || {};
	settings.audioRefs = {};

	var fileExtension = StringUtilsjs_getAfterLast(url, '.');
	settings.audioRefs[fileExtension] = url;

	var sound = this.soundHandler._create();
	this.soundHandler._objects.set(id, sound);

	return this.soundHandler.update(id, settings, {});
};

/**
 * Provides a simple way to load sounds
 */
export { SoundCreator_SoundCreator as SoundCreator };
