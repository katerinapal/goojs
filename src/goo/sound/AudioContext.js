'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var supported = true;

var AudioContext = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
if (!AudioContext) {
	// warn once
	console.warn('WebAudio not supported');
	supported = false;
}

var context;

var AudioContextjs_AudioContextjs = {
	getContext: function getContext() {
		// try to get a context if it's supposedly supported or not cached
		if (!context && supported) {
			try {
				// even if window.AudioContext is available something might go wrong
				context = new AudioContext();
			} catch (e) {
				console.warn(e.message);
				supported = false;
			}
		}
		return context;
	},
	isSupported: function isSupported() {
		return supported;
	}
};

exports.AudioContextjs = AudioContextjs_AudioContextjs;
