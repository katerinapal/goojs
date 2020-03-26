"use strict";

var _FilledPolygon = require("./FilledPolygon");

var _PolyLine = require("./PolyLine");

var _RegularPolygon = require("./RegularPolygon");

var _Surface = require("./Surface");

var _TextComponent = require("./text/TextComponent");

var _TextComponentHandler = require("./text/TextComponentHandler");

var _TextMeshGenerator = require("./text/TextMeshGenerator");

var _Triangle = require("./Triangle");

var indexjs;
indexjs = {
	FilledPolygon: _FilledPolygon.FilledPolygonjs,
	PolyLine: _PolyLine.PolyLinejs,
	RegularPolygon: _RegularPolygon.RegularPolygonjs,
	Surface: _Surface.Surfacejs,
	TextComponent: _TextComponent.TextComponentjs,
	TextComponentHandler: _TextComponentHandler.TextComponentHandlerjs,
	TextMeshGenerator: _TextMeshGenerator.textTextMeshGenerator_obj,
	Triangle: _Triangle.Trianglejs
};
if (typeof window !== 'undefined') {
	for (var key in module.exports) {
		window.goo[key] = module.exports[key];
	}
}
