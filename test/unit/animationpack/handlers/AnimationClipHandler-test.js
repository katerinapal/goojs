import { World as Worldjs } from "../../../../src/goo/entities/World";
import { DynamicLoader as DynamicLoaderjs } from "../../../../src/goo/loaders/DynamicLoader";
import { AnimationClip as AnimationClip_AnimationClipjs } from "../../../../src/goo/animationpack/clip/AnimationClip";
import { Configs as Configs_Configsjs } from "../../../../test/unit/loaders/Configs";
import "../../../../src/goo/animationpack/handlers/AnimationHandlers";

describe('AnimationClipHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new Worldjs();
		loader = new DynamicLoaderjs({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads a clip', function (done) {
		var config = Configs_Configsjs.clip();
		loader.preload(Configs_Configsjs.get());
		loader.load(config.id).then(function (clip) {
			expect(clip).toEqual(jasmine.any(AnimationClip_AnimationClipjs));
			done();
		});
	});
});