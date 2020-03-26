"use strict";

var _Vector = require("../../../src/goo/math/Vector3");

var _Transform = require("../../../src/goo/math/Transform");

var _CustomMatchers = require("../../../test/unit/CustomMatchers");

/**
 * Checks whether Transform.invert works on a test vector.
 */
function checkInversion(transform) {
	var vec1 = new _Vector.Vector3(100, 200, 300);
	var vec2 = new _Vector.Vector3();
	var vec3 = new _Vector.Vector3();
	var inverted = transform.invert();
	transform.applyForward(vec1, vec2);
	inverted.applyForward(vec2, vec3);
	expect(vec3).toBeCloseToVector(vec1);
}

/**
 * Numerically checks whether a transform changes a vector.
 */
function expectNotIdentity(transform) {
	var vec1 = new _Vector.Vector3(100, 200, 300);
	var vec2 = new _Vector.Vector3();
	transform.applyForward(vec1, vec2);
	expect(vec1).not.toBeCloseToVector(vec2);
}

describe('Transform', function () {
	var t, v1, v2;

	//! AT: refactor this out of here; MathUtil should have something like this
	function rnd(n) {
		if (n) {
			return Math.random() * n;
		} else {
			return Math.random();
		}
	}

	beforeEach(function () {
		jasmine.addMatchers(_CustomMatchers.CustomMatchers);
		t = new _Transform.Transform();
		v1 = new _Vector.Vector3(10, 20, 30);
		v2 = new _Vector.Vector3(0, 0, 0);
	});

	it('is identity by default', function () {
		t.applyForward(v1, v2);
		expect(v2).toBeCloseToVector(v1);
	});

	it('can be scaled', function () {
		t.scale.x = 2;
		t.scale.y = 3;
		t.scale.z = 4;
		t.update();
		t.applyForward(v1, v2);
		expect(v2).toBeCloseToVector(new _Vector.Vector3(10 * 2, 20 * 3, 30 * 4));
	});

	it('rotation changes a vector', function () {
		t.setRotationXYZ(Math.PI / 2, 0, 0);
		t.update();
		expectNotIdentity(t);
	});

	it('rotates around X axis', function () {
		t.setRotationXYZ(Math.PI / 2, 0, 0);
		t.update();
		t.applyForward(v1, v2);
		expect(v2).toBeCloseToVector(new _Vector.Vector3(10, -30, 20));
	});

	it('can be inverted if identity', function () {
		checkInversion(t);
	});

	it('can be inverted if scaled', function () {
		t.scale.x = 2;
		t.scale.y = 3;
		t.scale.z = 4;
		t.update();
		checkInversion(t);
	});

	it('can be inverted if rotated', function () {
		t.setRotationXYZ(0.2, 0, 0);
		t.update();
		checkInversion(t);
	});

	it('combines correctly', function () {
		//! AT: really bad idea to use random numbers
		// if the test fails for some numbers once in a full moon you won't be able to reproduce it
		t.translation.setDirect(rnd(5), rnd(5), rnd(5));
		t.scale.setDirect(3, 3, 3);
		t.setRotationXYZ(rnd(5), rnd(5), rnd(5));
		t.update();
		var t2 = new _Transform.Transform();
		t2.translation.setDirect(rnd(5), rnd(5), rnd(5));
		t2.setRotationXYZ(rnd(5), rnd(5), rnd(5));
		t2.scale.setDirect(rnd(5), rnd(5), rnd(5));
		t2.update();
		var t3 = _Transform.Transform.combine(t, t2);
		t3.update();
		t.matrix.mul(t2.matrix);
		expect(t3.matrix).toBeCloseToMatrix(t.matrix);
	});

	describe('lookAt', function () {
		it('centers the lookAt point in the view', function () {
			var lookAt = new _Vector.Vector3(5, 0, -10);
			var up = new _Vector.Vector3(0, 1, 0);
			var distance = lookAt.length();
			t.lookAt(lookAt, up);
			t.update();
			t.invert().applyForwardVector(lookAt, v2);
			expect(v2).toBeCloseToVector(new _Vector.Vector3(0, 0, -distance));
		});

		it('defaults up parameter of lookAt to UNIT_Y', function () {
			var transform1 = new _Transform.Transform();
			var transform2 = new _Transform.Transform();

			transform1.lookAt(new _Vector.Vector3(1, 2, 3));
			transform2.lookAt(new _Vector.Vector3(1, 2, 3), _Vector.Vector3.UNIT_Y);

			transform1.update();
			transform2.update();

			expect(transform1.matrix.equals(transform2.matrix)).toBeTruthy();

			// --- check to see if other up vector can be set
			var transform1 = new _Transform.Transform();
			var transform2 = new _Transform.Transform();

			transform1.lookAt(new _Vector.Vector3(1, 2, 3));
			transform2.lookAt(new _Vector.Vector3(1, 2, 3), _Vector.Vector3.UNIT_Z);

			transform1.update();
			transform2.update();

			expect(transform1.matrix.equals(transform2.matrix)).toBeFalsy();
		});

		it('does nothing when trying to look at itself', function () {
			var transform = new _Transform.Transform();
			transform.translation.setDirect(11, 22, 33);
			transform.lookAt(new _Vector.Vector3(11, 22, 33));
			transform.update();

			var expected = new _Transform.Transform();
			expected.translation.setDirect(11, 22, 33);
			expected.update();

			expect(transform.rotation).toBeCloseToMatrix(expected.rotation);
			expect(transform.matrix).toBeCloseToMatrix(expected.matrix);
		});
	});

	describe('combine', function () {
		it('combines and updates the resulting transform', function () {
			var transform1 = new _Transform.Transform();
			transform1.translation.setDirect(1, 2, 3);

			var transform2 = new _Transform.Transform();
			transform2.translation.setDirect(11, 22, 33);

			var result = _Transform.Transform.combine(transform1, transform2);
			expect(result.translation.equals(new _Vector.Vector3(1, 2, 3).add(new _Vector.Vector3(11, 22, 33)))).toBeTruthy();

			expect(result.matrix[12]).toBeCloseTo(1 + 11);
			expect(result.matrix[13]).toBeCloseTo(2 + 22);
			expect(result.matrix[14]).toBeCloseTo(3 + 33);
		});
	});

	describe('multiply', function () {
		it('can multiply and keep scaling correct', function () {
			var transform1 = new _Transform.Transform();
			transform1.scale.setDirect(1, 2, 3);

			var transform2 = new _Transform.Transform();
			transform2.scale.setDirect(4, 5, 6);

			transform1.multiply(transform1, transform2);

			expect(transform1.scale).toBeCloseToVector(new _Vector.Vector3(1 * 4, 2 * 5, 3 * 6));
		});
	});

	describe('clone', function () {
		it('clones a transform', function () {
			var original = new _Transform.Transform();

			original.translation.setDirect(1, 2, 3);
			original.rotation.e11 = 123; // no setDirect for matrices
			original.scale.setDirect(4, 5, 6);

			original.matrix.e11 = 456;
			original.normalMatrix.e11 = 789;

			var clone = original.clone();

			expect(clone).not.toBe(original);

			// making sure nothing is shared
			expect(clone.matrix).not.toBe(original.matrix);
			expect(clone.normalMatrix).not.toBe(original.normalMatrix);

			expect(clone.translation).not.toBe(original.translation);
			expect(clone.rotation).not.toBe(original.rotation);
			expect(clone.scale).not.toBe(original.scale);

			expect(clone).toEqual(original);
		});
	});
});
