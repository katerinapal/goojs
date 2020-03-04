import { World as Worldjs } from "../../../../src/goo/entities/World";
import { Entity as Entityjs } from "../../../../src/goo/entities/Entity";
import { DynamicLoader as DynamicLoaderjs } from "../../../../src/goo/loaders/DynamicLoader";
import { Configs as Configs_Configsjs } from "../../../../test/unit/loaders/Configs";
import "../../../../src/goo/loaders/handlers/EntityHandler";

describe('EntityHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new Worldjs();
		loader = new DynamicLoaderjs({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads an entity', function (done) {
		var config = Configs_Configsjs.entity();
		loader.preload(Configs_Configsjs.get());
		loader.load(config.id).then(function (entity) {
			expect(entity).toEqual(jasmine.any(Entityjs));
			expect(entity.id).toBe(config.id);
			done();
		});
	});

	it('loads an entity with tags', function (done) {
		var config = Configs_Configsjs.entity();
		config.tags = { t1: true, t2: true };
		loader.preload(Configs_Configsjs.get());
		loader.load(config.id).then(function (entity) {
			expect(entity.hasTag('t1')).toEqual(true);
			expect(entity.hasTag('t2')).toEqual(true);
			done();
		});
	});
});
