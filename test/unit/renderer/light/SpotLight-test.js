"use strict";

var _Vector = require("../../../../src/goo/math/Vector3");

var _SpotLight = require("../../../../src/goo/renderer/light/SpotLight");

var _CustomMatchers = require("../../../../test/unit/CustomMatchers");

describe('SpotLight', function () {
	beforeEach(function () {
		jasmine.addMatchers(_CustomMatchers.CustomMatchers);
	});

	it('gets the color from the first parameter passed to the constructor', function () {
		var color = new _Vector.Vector3(0.2, 0.3, 0.5);
		var light = new _SpotLight.SpotLight(color);

		expect(light.color).toBeCloseToVector(color);
		expect(light.color).not.toBe(color);
	});

	describe('copy', function () {
		it('can copy everything from another point light', function () {
			var original = new _SpotLight.SpotLight(new _Vector.Vector3(11, 22, 33));
			var copy = new _SpotLight.SpotLight(new _Vector.Vector3(44, 55, 66));
			copy.copy(original);

			expect(copy).toBeCloned(original);
		});
	});

	describe('clone', function () {
		it('can clone a point light', function () {
			var original = new _SpotLight.SpotLight(new _Vector.Vector3(11, 22, 33));
			var clone = original.clone();

			expect(clone).toBeCloned(original);
		});
	});
});