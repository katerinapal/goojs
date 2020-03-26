import { Manager as srcgooentitiesmanagersManager_Managerjs } from "../../../src/goo/entities/managers/Manager";
import { Entity as srcgooentitiesEntity_Entityjs } from "../../../src/goo/entities/Entity";
import { System as srcgooentitiessystemsSystem_Systemjs } from "../../../src/goo/entities/systems/System";
import { World as srcgooentitiesWorld_Worldjs } from "../../../src/goo/entities/World";
import {     TransformComponent as srcgooentitiescomponentsTransformComponent_TransformComponentjs, } from "../../../src/goo/entities/components/TransformComponent";
import {     MeshDataComponent as srcgooentitiescomponentsMeshDataComponent_MeshDataComponentjs, } from "../../../src/goo/entities/components/MeshDataComponent";
import {     MeshRendererComponent as srcgooentitiescomponentsMeshRendererComponent_MeshRendererComponentjs, } from "../../../src/goo/entities/components/MeshRendererComponent";
import {     CameraComponent as srcgooentitiescomponentsCameraComponent_CameraComponentjs, } from "../../../src/goo/entities/components/CameraComponent";
import { LightComponent as srcgooentitiescomponentsLightComponent_LightComponentjs } from "../../../src/goo/entities/components/LightComponent";
import {     ScriptComponent as srcgooentitiescomponentsScriptComponent_ScriptComponentjs, } from "../../../src/goo/entities/components/ScriptComponent";
import { Component as srcgooentitiescomponentsComponent_Componentjs } from "../../../src/goo/entities/components/Component";
import { ScriptSystem as srcgooentitiessystemsScriptSystem_ScriptSystemjs } from "../../../src/goo/entities/systems/ScriptSystem";
import { TransformSystem as srcgooentitiessystemsTransformSystem_TransformSystemjs } from "../../../src/goo/entities/systems/TransformSystem";
import { Box as srcgooshapesBox_Boxjs } from "../../../src/goo/shapes/Box";
import { Camera as srcgoorendererCamera_Camerajs } from "../../../src/goo/renderer/Camera";
import { PointLight as srcgoorendererlightPointLight_PointLightjs } from "../../../src/goo/renderer/light/PointLight";
import { ShaderLib as srcgoorenderershadersShaderLib_ShaderLibjs } from "../../../src/goo/renderer/shaders/ShaderLib";
import { Material as srcgoorendererMaterial_Materialjs } from "../../../src/goo/renderer/Material";
import { EntitySelection as srcgooentitiesEntitySelection_EntitySelectionjs } from "../../../src/goo/entities/EntitySelection";

describe('World with Systems', function () {

	var world;

	beforeEach(function () {
		world = new srcgooentitiesWorld_Worldjs();
	});

	it('cannot add the same system twice', function () {
		var systemA = new srcgooentitiessystemsSystem_Systemjs('A', []);

		world.setSystem(systemA);
		world.setSystem(systemA);

		expect(world._systems).toEqual([systemA]);
	});

	it('adds a system with default priority to the world', function () {
		var systemA = new srcgooentitiessystemsSystem_Systemjs('A', []);
		var systemB = new srcgooentitiessystemsSystem_Systemjs('B', []);

		world.setSystem(systemA);
		world.setSystem(systemB);

		expect(world._systems).toEqual([systemA, systemB]);
	});

	it ('adds a system with high priority to the world', function () {
		var systemA = new srcgooentitiessystemsSystem_Systemjs('A', []);
		var systemB = new srcgooentitiessystemsSystem_Systemjs('B', []);
		var systemC = new srcgooentitiessystemsSystem_Systemjs('A', []);
		systemC.priority = -1;

		world.setSystem(systemA);
		world.setSystem(systemB);
		world.setSystem(systemC);

		expect(world._systems).toEqual([systemC, systemA, systemB]);
	});

	it('adds a system with low priority to the world', function () {
		var world = new srcgooentitiesWorld_Worldjs();

		var systemA = new srcgooentitiessystemsSystem_Systemjs('A', []);
		var systemB = new srcgooentitiessystemsSystem_Systemjs('B', []);
		var systemC = new srcgooentitiessystemsSystem_Systemjs('C', []);
		systemC.priority = 5;

		world.setSystem(systemA);
		world.setSystem(systemB);
		world.setSystem(systemC);

		expect(world._systems).toEqual([systemA, systemB, systemC]);
	});

	it('adds a system with medium priority to the world', function () {
		var systemA = new srcgooentitiessystemsSystem_Systemjs('A', []);
		systemA.priority = 3;
		var systemB = new srcgooentitiessystemsSystem_Systemjs('B', []);
		systemB.priority = 1;
		var systemC = new srcgooentitiessystemsSystem_Systemjs('C', []);
		systemC.priority = 2;

		world.setSystem(systemA);
		world.setSystem(systemB);
		world.setSystem(systemC);

		expect(world._systems).toEqual([systemB, systemC, systemA]);
	});

	it('removes a system', function () {
		var systemA = new srcgooentitiessystemsSystem_Systemjs('A', []);
		systemA.priority = 3;
		var systemB = new srcgooentitiessystemsSystem_Systemjs('B', []);
		systemB.priority = 1;

		world.setSystem(systemA);
		world.setSystem(systemB);

		world.clearSystem('A');

		expect(world._systems).toEqual([systemB]);
	});

	it('calls the cleanup function of a system when removing it from the world', function () {
		var systemA = new srcgooentitiessystemsSystem_Systemjs('A', []);
		spyOn(systemA, 'cleanup').and.callThrough();

		world.setSystem(systemA);

		world.clearSystem('A');

		expect(systemA.cleanup).toHaveBeenCalled();
	});

	it('tries to add existing entities to a late added system', function () {
		function SystemA() {
			srcgooentitiessystemsSystem_Systemjs.call(this, 'SystemA', ['ComponentA']);
		}

		SystemA.prototype = Object.create(srcgooentitiessystemsSystem_Systemjs.prototype);
		var systemA = new SystemA();
		spyOn(systemA, '_check').and.callThrough();

		// ---
		function ComponentA() {
			srcgooentitiescomponentsComponent_Componentjs.apply(this, arguments);
			this.type = 'ComponentA';
		}

		ComponentA.prototype = Object.create(srcgooentitiescomponentsComponent_Componentjs.prototype);

		// ---
		var entity1 = world.createEntity(new ComponentA()).addToWorld();
		var entity2 = world.createEntity().addToWorld();

		world.process();

		world.setSystem(systemA);

		expect(systemA._check.calls.argsFor(0)[0]).toBe(entity1);
		expect(systemA._check.calls.argsFor(1)[0]).toBe(entity2);
	});
});

describe('World with Components', function () {
	var world;
	beforeEach(function () {
		world = new srcgooentitiesWorld_Worldjs();
		world.registerComponent(srcgooentitiescomponentsTransformComponent_TransformComponentjs);
		world.registerComponent(srcgooentitiescomponentsMeshDataComponent_MeshDataComponentjs);
		world.registerComponent(srcgooentitiescomponentsMeshRendererComponent_MeshRendererComponentjs);
		world.registerComponent(srcgooentitiescomponentsCameraComponent_CameraComponentjs);
		world.registerComponent(srcgooentitiescomponentsLightComponent_LightComponentjs);
		world.registerComponent(srcgooentitiescomponentsScriptComponent_ScriptComponentjs);
	});

	// Cucumber system
	function CucumberSystem() {
		srcgooentitiessystemsSystem_Systemjs.call(this, 'CucumberSystem', ['CucumberComponent']);
	}
	CucumberSystem.prototype = Object.create(srcgooentitiessystemsSystem_Systemjs.prototype);
	CucumberSystem.prototype.inserted = function () {};
	CucumberSystem.prototype.deleted = function () {};
	CucumberSystem.prototype.addedComponent = function () {};
	CucumberSystem.prototype.removedComponent = function () {};

	// Cucumber component
	function CucumberComponent() {
		srcgooentitiescomponentsComponent_Componentjs.apply(this, arguments);
		this.type = 'CucumberComponent';
	}

	var cucumberComponent, cucumberSystem, entity;

	beforeEach(function () {
		entity = world.createEntity();
		entity.addToWorld();
		// Process to prevent TransformComponent trigger addedComponent call on CucumberSystem
		world.process();

		cucumberSystem = new CucumberSystem();
		world.setSystem(cucumberSystem);
		cucumberComponent = new CucumberComponent();

		spyOn(cucumberSystem, 'inserted');
		spyOn(cucumberSystem, 'deleted');
		spyOn(cucumberSystem, 'addedComponent');
		spyOn(cucumberSystem, 'removedComponent');
	});

	CucumberComponent.prototype = Object.create(srcgooentitiescomponentsComponent_Componentjs.prototype);

	it('get added call when components in the interest list are added', function () {
		entity.setComponent(cucumberComponent);
		world.process();
		expect(cucumberSystem.inserted).toHaveBeenCalled();
		expect(cucumberSystem.addedComponent).toHaveBeenCalled();
	});

	it('gets deleted call when components in the interest list are deleted', function () {
		entity.setComponent(cucumberComponent);
		world.process();
		entity.clearComponent('CucumberComponent');
		world.process();
		expect(cucumberSystem.deleted).toHaveBeenCalled();
		expect(cucumberSystem.removedComponent).toHaveBeenCalled();
	});

	it('gets no update calls when deleting a non existent component', function () {
		entity.clearComponent('CucumberComponent');
		world.process();
		expect(cucumberSystem.inserted).not.toHaveBeenCalled();
		expect(cucumberSystem.deleted).not.toHaveBeenCalled();
		expect(cucumberSystem.addedComponent).not.toHaveBeenCalled();
		expect(cucumberSystem.removedComponent).not.toHaveBeenCalled();
	});

	it('can create a typical entity holding all sorts of stuff in random order', function () {
		world.gooRunner = {
			renderer: {
				domElement: null,
				viewportWidth: null,
				viewportHeight: null
			}
		};
		world.add(new srcgooentitiessystemsScriptSystem_ScriptSystemjs(world));

		var camera = new srcgoorendererCamera_Camerajs();
		var meshData = new srcgooshapesBox_Boxjs();
		var material = new srcgoorendererMaterial_Materialjs(srcgoorenderershadersShaderLib_ShaderLibjs.simple);
		var light = new srcgoorendererlightPointLight_PointLightjs();
		var script = { run: function () {} };

		var entity = world.createEntity(camera, meshData, script, 'entitate', material, light);
		expect(entity.toString()).toBe('entitate');
		expect(entity.hasComponent('MeshDataComponent')).toBeTruthy();
		expect(entity.hasComponent('MeshRendererComponent')).toBeTruthy();
		expect(entity.hasComponent('LightComponent')).toBeTruthy();
		expect(entity.hasComponent('CameraComponent')).toBeTruthy();
		expect(entity.hasComponent('ScriptComponent')).toBeTruthy();
	});

	it('automatically adds a TransformComponent on a newly created entity', function () {
		var entity = world.createEntity();

		expect(entity.transformComponent).toBeTruthy();
	});

	it('adds an entity using the \'add\' function', function () {
		var entity = new srcgooentitiesEntity_Entityjs(world);

		world.add(entity);
		world.process();
		expect(world.getEntities()).toContain(entity);
	});

	it('adds a system using the \'add\' function', function () {
		var system = new srcgooentitiessystemsTransformSystem_TransformSystemjs();

		world.add(system);
		expect(world._systems).toContain(system);
	});

	it('adds a manager using the \'add\' function', function () {
		function FishManager() {
			srcgooentitiesmanagersManager_Managerjs.call(this);
		}
		FishManager.prototype = Object.create(srcgooentitiesmanagersManager_Managerjs.prototype);

		var manager = new FishManager();

		world.add(manager);
		expect(world._managers).toContain(manager);
	});

	it('registers a component using the \'add\' function', function () {
		var component = new srcgooentitiescomponentsTransformComponent_TransformComponentjs();

		world.add(component);
		expect(world._components).toContain(component);
	});

	// api installing
	it('installs the api of a manager', function () {
		var world = new srcgooentitiesWorld_Worldjs();
		expect(world.by.id).toBeTruthy();
		expect(world.by.name).toBeTruthy();
	});

	it('does not override existing methods on install', function () {
		var a = 0;
		function FishManager() {
			srcgooentitiesmanagersManager_Managerjs.call(this);
			this.type = 'FishManager';
			this.api = {
				color: function () { a += 123; }
			};
		}
		FishManager.prototype = Object.create(srcgooentitiesmanagersManager_Managerjs.prototype);


		var b = 0;
		function BananaManager() {
			this.type = 'BananaManager';
			this.api = {
				color: function () { b += 234; }
			};
		}
		BananaManager.prototype = Object.create(srcgooentitiesmanagersManager_Managerjs.prototype);


		var world = new srcgooentitiesWorld_Worldjs();

		world.setManager(new FishManager());
		expect(function () {
			world.setManager(new BananaManager());
		}).toThrow(new Error('Could not install method color of BananaManager as it is already taken'))

		world.by.color();

		expect(a).toEqual(123);
		expect(b).toEqual(0);
	});

	describe('with EntitySelection', function () {
		// if this is useful provide it in some test-util class
		function getSuperSpy() {
			// we need a spy that can track on what object it has been called
			// sadly jasmine spies are not self aware
			var history = [];

			function superSpy() {
				var entry = {
					this_: this,
					arguments_: Array.prototype.slice.call(arguments, 0) // proper array
				};
				history.push(entry);
			}

			superSpy.calls = {
				argsFor: function (index) {
					return history[index].arguments_;
				},
				thisFor: function (index) {
					return history[index].this_;
				},
				count: function () {
					return history.length;
				}
			};

			return superSpy;
		}

		it('installs component methods on EntitySelection', function () {
			var spyA = getSuperSpy();
			var spyB = getSuperSpy();

			function CoconutComponent() {
				this.type = 'CoconutComponent';
			}

			CoconutComponent.type = 'CoconutComponent';

			CoconutComponent.entitySelectionAPI = {
				a: spyA,
				b: spyB
			};

			CoconutComponent.prototype = Object.create(srcgooentitiescomponentsComponent_Componentjs.prototype);
			CoconutComponent.prototype.constructor = CoconutComponent;

			var world = new srcgooentitiesWorld_Worldjs();
			world.registerComponent(CoconutComponent);

			var entity1 = new srcgooentitiesEntity_Entityjs().setComponent(new CoconutComponent());
			var entity2 = new srcgooentitiesEntity_Entityjs();
			var entity3 = new srcgooentitiesEntity_Entityjs().setComponent(new CoconutComponent());

			var entitySelection = new srcgooentitiesEntitySelection_EntitySelectionjs(entity1, entity2, entity3);
			var result = entitySelection.a(123, 456);

			expect(spyA.calls.count()).toEqual(2);
			expect(spyA.calls.thisFor(0)).toEqual(entity1);
			expect(spyA.calls.thisFor(1)).toEqual(entity3);
			expect(spyA.calls.argsFor(0)).toEqual([123, 456]);
			expect(result).toBe(entitySelection);
		});
	});
});

describe('Default selectors', function () {
	it('gets a list of entities with a programmerComponent', function () {
		function ProgrammerComponent() {
			this.type = 'programmerComponent';
		}

		ProgrammerComponent.prototype = Object.create(srcgooentitiescomponentsComponent_Componentjs.prototype);
		ProgrammerComponent.constructor = ProgrammerComponent;

		var world = new srcgooentitiesWorld_Worldjs();

		var entity1 = world.createEntity().set(new ProgrammerComponent()).addToWorld();
		world.createEntity().addToWorld();
		var entity3 = world.createEntity().set(new ProgrammerComponent()).addToWorld();

		world.process();

		var selection1 = world.by.component('programmerComponent');
		expect(selection1.toArray()).toEqual([entity1, entity3]);

		var selection2 = world.by.component('ProgrammerComponent');
		expect(selection2.toArray()).toEqual([entity1, entity3]);
	});

	it('gets a list of entities that are tracked by the TransformSystem', function () {
		var world = new srcgooentitiesWorld_Worldjs();
		world.add(new srcgooentitiessystemsTransformSystem_TransformSystemjs());

		var entity1 = world.createEntity().addToWorld();
		new srcgooentitiesEntity_Entityjs(world).addToWorld();
		var entity3 = world.createEntity().addToWorld();

		world.process();

		var selection = world.by.system('TransformSystem');
		expect(selection.toArray()).toEqual([entity1, entity3]);
	});

	it('gets a list of entities that have a specific tag', function () {
		var world = new srcgooentitiesWorld_Worldjs();

		var entity1 = world.createEntity().setTag('t1').addToWorld();
		world.createEntity().setTag('t2').addToWorld();
		var entity3 = world.createEntity().setTag('t1').addToWorld();

		world.process();

		var selection = world.by.tag('t1');
		expect(selection.toArray()).toEqual([entity1, entity3]);
	});

	it('gets a list of entities that have a specific attribute', function () {
		var world = new srcgooentitiesWorld_Worldjs();

		var entity1 = world.createEntity().setAttribute('a1', 10).addToWorld();
		world.createEntity().setAttribute('a2', {}).addToWorld();
		var entity3 = world.createEntity().setAttribute('a1', '20').addToWorld();

		world.process();

		var selection = world.by.attribute('a1');
		expect(selection.toArray()).toEqual([entity1, entity3]);
	});
});
