"use strict";

var _World = require("../../../../src/goo/entities/World");

var _HtmlComponent = require("../../../../src/goo/entities/components/HtmlComponent");

var _DynamicLoader = require("../../../../src/goo/loaders/DynamicLoader");

var _Configs = require("../../../../test/unit/loaders/Configs");

require("../../../../src/goo/loaders/handlers/HtmlComponentHandler");

describe('HtmlComponentHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new _World.World();
		world.gooRunner = {
			renderer: {
				domElement: document.createElement('div')
			}
		};

		loader = new _DynamicLoader.DynamicLoader({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads an entity with an htmlComponent', function (done) {
		var config = _Configs.Configs.entity(['html']);
		loader.preload(_Configs.Configs.get());
		loader.load(config.id).then(function (entity) {
			expect(entity.htmlComponent).toEqual(jasmine.any(_HtmlComponent.HtmlComponent));
			expect(entity.htmlComponent.useTransformComponent).toBeTruthy();
			expect(/[^\-\w]/.test(entity.htmlComponent.domElement.id)).toBeFalsy();
			expect(document.getElementById(entity.htmlComponent.domElement.id)).not.toBeNull();
			done();
		}, function () {
			expect('').toEqual('Should never get here');
			done();
		});
	});

	it('removes an html entity', function (done) {
		var config = _Configs.Configs.entity(['html']);
		loader.preload(_Configs.Configs.get());

		var entity, htmlComponent;
		loader.load(config.id).then(function (_entity) {
			entity = _entity;
			htmlComponent = entity.htmlComponent;
			return loader.remove(config.id);
		}).then(function () {
			expect(entity.htmlComponent).toBeUndefined();
			expect(document.getElementById(htmlComponent.domElement.id)).toBeNull();
			done();
		}, function () {
			expect('').toEqual('Should never get here');
			done();
		});
	});
});