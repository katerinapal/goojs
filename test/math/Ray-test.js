define([
	'goo/math/Ray',
	'goo/math/Plane',
	'goo/math/Vector3'
], function(
	Ray,
	Plane,
	Vector3
	) {
	'use strict';

	describe('Ray', function () {
		describe('constructor', function () {
			it('creates a ray given no parameters', function () {
				var ray = new Ray();
				expect(ray.origin.equals(new Vector3())).toBeTruthy();
				expect(ray.direction.equals(Vector3.UNIT_Z)).toBeTruthy();
			});

			it('creates a ray given only the origin', function () {
				var origin = new Vector3(1, 2, 3);
				var ray = new Ray(origin);
				expect(ray.origin.equals(origin)).toBeTruthy();
				expect(ray.direction.equals(Vector3.UNIT_Z)).toBeTruthy();
			});

			it('creates a ray given the origin and direction', function () {
				var origin = new Vector3(1, 2, 3);
				var direction = new Vector3(123, 234, 345);
				var ray = new Ray(origin, direction);
				expect(ray.origin.equals(origin)).toBeTruthy();
				expect(ray.direction.equals(direction)).toBeTruthy();
			});
		});

		describe('intersects', function () {

		});

		describe('intersectsTriangle', function () {

		});

		describe('getDistanceToPrimitive', function () {

		});

		describe('intersectsPlane', function () {
			it('intersects a plane', function () {
				//! AT: split in 2
				var plane = new Plane(new Vector3(1, 0, 0), 4);
				var parallelRay = new Ray(new Vector3(0, 0, 0), new Vector3(0, 1, 0));
				var intersectingRay = new Ray(new Vector3(0, 0, 0), new Vector3(1, 0, 0));

				var intersectionPoint = new Vector3();

				expect(parallelRay.intersectsPlane(plane)).toBeFalsy();

				expect(intersectingRay.intersectsPlane(plane, intersectionPoint)).toBeTruthy();
				expect(intersectionPoint.equals(new Vector3(4, 0, 0))).toBeTruthy();
			});
		});

		describe('distanceSquared', function () {
			it('computes the squared distance from a ray to a point', function () {
				//! AT: split in 2
				var ray = new Ray(new Vector3(4, 0, 0), new Vector3(0, 0, 1));
				var point = new Vector3(1, 0, 10);
				var collinearPoint = new Vector3(4, 0, 20);

				var closestPoint = new Vector3();

				expect(ray.distanceSquared(point, closestPoint)).toBeCloseTo(Math.pow(3, 2));
				expect(closestPoint.equals(new Vector3(4, 0, 10))).toBeTruthy();

				expect(ray.distanceSquared(collinearPoint, closestPoint)).toBeCloseTo(Math.pow(0, 2));
				expect(closestPoint.equals(new Vector3(4, 0, 20))).toBeTruthy();
			});
		});
	});
});
