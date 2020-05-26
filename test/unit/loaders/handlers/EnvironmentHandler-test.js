import { World as srcgooentitiesWorld_Worldjs } from "../../../../src/goo/entities/World";
import {     TransformComponent as srcgooentitiescomponentsTransformComponent_TransformComponentjs, } from "../../../../src/goo/entities/components/TransformComponent";
import {     MeshDataComponent as srcgooentitiescomponentsMeshDataComponent_MeshDataComponentjs, } from "../../../../src/goo/entities/components/MeshDataComponent";
import {     MeshRendererComponent as srcgooentitiescomponentsMeshRendererComponent_MeshRendererComponentjs, } from "../../../../src/goo/entities/components/MeshRendererComponent";
import { RenderSystem as srcgooentitiessystemsRenderSystem_RenderSystemjs } from "../../../../src/goo/entities/systems/RenderSystem";
import { DynamicLoader as srcgooloadersDynamicLoader_DynamicLoaderjs } from "../../../../src/goo/loaders/DynamicLoader";
import { ShaderBuilder as srcgoorenderershadersShaderBuilder_ShaderBuilderjs } from "../../../../src/goo/renderer/shaders/ShaderBuilder";
import { Configs as testunitloadersConfigs_Configsjs } from "../../../../test/unit/loaders/Configs";
import "../../../../src/goo/loaders/handlers/EnvironmentHandler";
var srcgooentitiesWorld_WorldjsBinding = {};

describe('EnvironmentHandler', function () {
	var loader, world;

	beforeEach(function () {
		srcgooentitiesWorld_Worldjs = new srcgooentitiesWorld_Worldjs();

		// Pretending to be gooRunner
		world.registerComponent(srcgooentitiescomponentsTransformComponent_TransformComponentjs);
		world.registerComponent(srcgooentitiescomponentsMeshDataComponent_MeshDataComponentjs);
		world.registerComponent(srcgooentitiescomponentsMeshRendererComponent_MeshRendererComponentjs);
		world.setSystem(new srcgooentitiessystemsRenderSystem_RenderSystemjs());
		// Faking a goorunner
		world.gooRunner = {
			world: world
		};

		loader = new srcgooloadersDynamicLoader_DynamicLoaderjs({
			world: world,
			rootPath: typeof(window) !== 'undefined' && window.__karma__ ? './' : 'loaders/res'
		});
	});

	it('loads an environment', function (done) {
		var config = testunitloadersConfigs_Configsjs.environment();
		loader.preload(testunitloadersConfigs_Configsjs.get());
		loader.load(config.id).then(function (environment) {
			expect(srcgoorenderershadersShaderBuilder_ShaderBuilderjs.GLOBAL_AMBIENT).toEqual(environment.globalAmbient);

			expect(srcgoorenderershadersShaderBuilder_ShaderBuilderjs.FOG_SETTINGS).toEqual([environment.fog.near, environment.fog.far]);
			expect(srcgoorenderershadersShaderBuilder_ShaderBuilderjs.FOG_COLOR).toEqual(environment.fog.color);
			expect(srcgoorenderershadersShaderBuilder_ShaderBuilderjs.USE_FOG).toBe(environment.fog.enabled);

			expect(world._addedEntities).toContain(
				environment.weatherState.snow.snow.particleCloudEntity
			);

			done();
		});
	});
});
