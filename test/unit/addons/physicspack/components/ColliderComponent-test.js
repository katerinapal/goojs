import { SphereCollider as SphereColliderjs } from "../../../../../src/goo/addons/physicspack/colliders/SphereCollider";
import { Vector3 as Vector3js } from "../../../../../src/goo/math/Vector3";
import { World as World_Worldjs } from "../../../../../src/goo/entities/World";
import { TransformSystem as TransformSystemjs } from "../../../../../src/goo/entities/systems/TransformSystem";
import { PhysicsMaterial as PhysicsMaterial_PhysicsMaterialjs } from "../../../../../src/goo/addons/physicspack/PhysicsMaterial";
import { PhysicsSystem as PhysicsSystemjs } from "../../../../../src/goo/addons/physicspack/systems/PhysicsSystem";
import { ColliderSystem as ColliderSystemjs } from "../../../../../src/goo/addons/physicspack/systems/ColliderSystem";
import { ColliderComponent as ColliderComponentjs } from "../../../../../src/goo/addons/physicspack/components/ColliderComponent";

/* global CANNON */

describe('ColliderComponent', function () {
	var world, system;

	beforeEach(function () {
		world = new World_Worldjs();
		system = new PhysicsSystemjs({
			maxSubSteps: 1
		});
		system.setGravity(new Vector3js());
		world.setSystem(system);
		world.setSystem(new TransformSystemjs());
		world.setSystem(new ColliderSystemjs());
	});

	it('can update its world collider', function () {
		var colliderComponent = new ColliderComponentjs({
			collider: new SphereColliderjs({ radius: 1 })
		});
		var entity = world.createEntity(colliderComponent).addToWorld();

		entity.setTranslation(1, 2, 3);
		entity.setScale(1, 2, 3);

		colliderComponent.updateWorldCollider(true);

		expect(colliderComponent.worldCollider.radius).toBe(3);
	});

	it('instantiates as a static body without a rigid body component', function () {
		var material = new PhysicsMaterial_PhysicsMaterialjs({
			friction: 0.6,
			restitution: 0.7
		});
		var colliderComponent = new ColliderComponentjs({
			collider: new SphereColliderjs({ radius: 1 }),
			material: material
		});
		var entity = world.createEntity(colliderComponent).addToWorld();

		// Initialize
		colliderComponent.initialize();

		expect(colliderComponent.bodyEntity).toBeFalsy();
		expect(colliderComponent.cannonBody).toBeTruthy();
		expect(colliderComponent.cannonBody.shapes[0] instanceof CANNON.Sphere).toBeTruthy();
		expect(colliderComponent.cannonBody.shapes[0].material.friction).toBe(material.friction);
		expect(colliderComponent.cannonBody.shapes[0].material.restitution).toBe(material.restitution);
		expect(colliderComponent.cannonBody.type).toBe(CANNON.Body.STATIC);

		entity.removeFromWorld();

		// Cleanup
		colliderComponent.destroy();

		expect(colliderComponent.bodyEntity).toBeFalsy();
		expect(colliderComponent.cannonBody).toBeFalsy();
	});
});
