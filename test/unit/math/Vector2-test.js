import { Vector2 as srcgoomathVector2_Vector2js } from "../../../src/goo/math/Vector2";
import { CustomMatchers as testunitCustomMatchers_CustomMatchersjs } from "../../../test/unit/CustomMatchers";

describe('Vector2', function () {
	beforeEach(function () {
		jasmine.addMatchers(testunitCustomMatchers_CustomMatchersjs);
	});

	describe('constructor', function () {
		it('creates a zero vector when given no parameters', function () {
			expect(new srcgoomathVector2_Vector2js()).toBeCloseToVector(srcgoomathVector2_Vector2js.ZERO);
		});

		it('creates a vector when given 2 parameters', function () {
			var vector = new srcgoomathVector2_Vector2js(11, 22);
			var expected = new srcgoomathVector2_Vector2js();

			expected.x = 11;
			expected.y = 22;

			expect(vector).toBeCloseToVector(expected);
		});

		it('creates a vector when given an array', function () {
			var vector = new srcgoomathVector2_Vector2js([11, 22]);
			var expected = new srcgoomathVector2_Vector2js(11,22);

			expect(vector).toBeCloseToVector(expected);
		});

		it('creates a vector when given a vector', function () {
			var original = new srcgoomathVector2_Vector2js(1, 2);
			var vector = new srcgoomathVector2_Vector2js(original);
			var expected = new srcgoomathVector2_Vector2js(1, 2);

			expect(vector).toBeCloseToVector(expected);
		});
	});

	describe('indices', function () {
		it('can be accessed through indices (debug only)', function () {
			var a = new srcgoomathVector2_Vector2js(11, 22);

			expect(function () { a[0]; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
			expect(function () { a[1]; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
		});

		it('can be modified through indices (debug only)', function () {
			var a = new srcgoomathVector2_Vector2js();

			expect(function () { a[0] = 11; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
			expect(function () { a[1] = 22; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
		});
	});

	describe('aliases', function () {
		it('can be accessed through aliases', function () {
			var a = new srcgoomathVector2_Vector2js(11, 22);

			expect(a.x).toEqual(11);
			expect(a.y).toEqual(22);
			expect(a.u).toEqual(11);
			expect(a.v).toEqual(22);
		});

		it('can be modified through aliases', function () {
			var v1 = new srcgoomathVector2_Vector2js();
			v1.x = 11;
			v1.y = 22;
			expect(v1).toBeCloseToVector(new srcgoomathVector2_Vector2js(11, 22));

			var v2 = new srcgoomathVector2_Vector2js();
			v2.u = 22;
			v2.v = 33;
			expect(v2).toBeCloseToVector(new srcgoomathVector2_Vector2js(22, 33));
		});
	});

	describe('scale', function () {
		it('scales a vector', function () {
			var vector = new srcgoomathVector2_Vector2js(1, 2);
			vector.scale(123);
			expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(1 * 123, 2 * 123));
		});
	});

	describe('dot', function () {
		it('can calculate dot products', function () {
			var a = new srcgoomathVector2_Vector2js(1, 2);
			var b = new srcgoomathVector2_Vector2js(1, 2);

			expect(a.dot(b)).toEqual(5);
		});
	});

	describe('normalize', function () {
		it('can be normalized', function () {
			var a = new srcgoomathVector2_Vector2js();
			// rewrite with toBeCloseToVector
			a.setDirect(0, 0).normalize();
			expect(a.x).toBeCloseTo(0);
			expect(a.y).toBeCloseTo(0);

			a.setDirect(1, 1).normalize();
			expect(a.x).toBeCloseTo(1 / Math.sqrt(2));
			expect(a.y).toBeCloseTo(1 / Math.sqrt(2));

			a.setDirect(-2, -3).normalize();
			expect(a.x).toBeCloseTo(-2 / Math.sqrt(2 * 2 + 3 * 3));
			expect(a.y).toBeCloseTo(-3 / Math.sqrt(2 * 2 + 3 * 3));

			a.setDirect(12, 34).normalize();
			expect(a.x).toBeCloseTo(12 / Math.sqrt(12 * 12 + 34 * 34));
			expect(a.y).toBeCloseTo(34 / Math.sqrt(12 * 12 + 34 * 34));
		});
	});

	describe('reflect', function () {
		it('can reflect a vector', function () {
			var plane = new srcgoomathVector2_Vector2js(-1, 1).normalize(); // more like a vector
			var original = new srcgoomathVector2_Vector2js(1, 0);
			var reflection = original.clone().reflect(plane);

			expect(reflection).toBeCloseToVector(new srcgoomathVector2_Vector2js(0, 1));
		});
	});

	describe('copy', function () {
		it('can copy values from a vector', function () {
			var vector = new srcgoomathVector2_Vector2js(11, 22);
			vector.set(new srcgoomathVector2_Vector2js(55, 66));
			expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(55, 66));
		});
	});

	describe('clone', function () {
		it('clones a vector', function () {
			var original = new srcgoomathVector2_Vector2js(11, 22);
			var clone = original.clone();

			expect(original).toBeCloseToVector(clone);
			expect(original).not.toBe(clone);
		});
	});

	describe('setDirect', function () {
		it('can set a vector', function () {
			var vector = new srcgoomathVector2_Vector2js(11, 22);
			vector.setDirect(55, 66);
			expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(55, 66));
		});
	});

	describe('setArray', function () {
		it('can set a vector', function () {
			var vector = new srcgoomathVector2_Vector2js(11, 22);
			vector.setArray([55, 66]);
			expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(55, 66));
		});
	});

	describe('set', function () {
		it('can set a vector', function () {
			var vector = new srcgoomathVector2_Vector2js(11, 22);
			vector.set(new srcgoomathVector2_Vector2js(55, 66));
			expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(55, 66));
		});
	});

	describe('addDirect', function () {
		it('can add to a vector', function () {
			var vector = new srcgoomathVector2_Vector2js(11, 22);
			vector.addDirect(55, 66);
			expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(66, 88));
		});
	});

	describe('add', function () {
		it('can add to a vector', function () {
			var vector = new srcgoomathVector2_Vector2js(11, 22);
			vector.add(new srcgoomathVector2_Vector2js(55, 66));
			expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(66, 88));
		});
	});


	describe('subDirect', function () {
		it('can subtract from a vector', function () {
			var vector = new srcgoomathVector2_Vector2js(11, 22);
			vector.subDirect(55, 66);
			expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(11 - 55, 22 - 66));
		});
	});

	describe('sub', function () {
		it('can subtract from a vector', function () {
			var vector = new srcgoomathVector2_Vector2js(11, 22);
			vector.sub(new srcgoomathVector2_Vector2js(55, 66));
			expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(11 - 55, 22 - 66));
		});
	});


	describe('mulDirect', function () {
		it('can multiply with 2 numbers', function () {
			var vector = new srcgoomathVector2_Vector2js(11, 22);
			vector.mulDirect(55, 66);
			expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(11 * 55, 22 * 66));
		});
	});

	describe('mul', function () {
		it('can multiply with a vector', function () {
			var vector = new srcgoomathVector2_Vector2js(11, 22);
			vector.mul(new srcgoomathVector2_Vector2js(55, 66));
			expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(11 * 55, 22 * 66));
		});
	});


	describe('divDirect', function () {
		it('can multiply with 2 numbers', function () {
			var vector = new srcgoomathVector2_Vector2js(11, 22);
			vector.divDirect(55, 66);
			expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(11 / 55, 22 / 66));
		});
	});

	describe('div', function () {
		it('can multiply with a vector', function () {
			var vector = new srcgoomathVector2_Vector2js(11, 22);
			vector.div(new srcgoomathVector2_Vector2js(55, 66));
			expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(11 / 55, 22 / 66));
		});
	});

	describe('fromArray', function () {
		it('creates a Vector2 from an array', function () {
			expect(srcgoomathVector2_Vector2js.fromArray([11, 22]))
				.toBeCloseToVector(new srcgoomathVector2_Vector2js(11, 22));
		});
	});

	describe('fromAny', function () {
		it('creates a Vector2 from 2 numbers', function () {
			expect(srcgoomathVector2_Vector2js.fromAny(11, 22))
				.toBeCloseToVector(new srcgoomathVector2_Vector2js(11, 22));
		});

		it('creates a Vector2 from an array of 2 numbers', function () {
			expect(srcgoomathVector2_Vector2js.fromAny([11, 22]))
				.toBeCloseToVector(new srcgoomathVector2_Vector2js(11, 22));
		});

		it('creates a Vector2 from an { x, y } object', function () {
			expect(srcgoomathVector2_Vector2js.fromAny({ x: 11, y: 22 }))
				.toBeCloseToVector(new srcgoomathVector2_Vector2js(11, 22));
		});

		it('clones a Vector2', function () {
			var original = new srcgoomathVector2_Vector2js(11, 22);
			var clone = srcgoomathVector2_Vector2js.fromAny(original);

			expect(clone).toBeCloseToVector(original);
			expect(clone).not.toBe(original);
		});
	});

	describe('toArray', function () {
		it('converts to array', function () {
			expect(srcgoomathVector2_Vector2js.fromArray([1, 2]).toArray()).toEqual([1, 2]);
		});
	});

	describe('deprecated shim added 2015-10-07 (v1.0)', function () {
		describe('.data', function () {
			it('has working getters', function () {
				var v = new srcgoomathVector2_Vector2js(1, 2);
				expect(v.data[0]).toEqual(1);
				expect(v.data[1]).toEqual(2);
			});

			it('has working setters', function () {
				var v = new srcgoomathVector2_Vector2js();
				v.data[0] = 1;
				v.data[1] = 2;
				expect(v.x).toEqual(1);
				expect(v.y).toEqual(2);
			});

			it('distinguishes vectors', function () {
				var u = new srcgoomathVector2_Vector2js(1, 2);
				var v = new srcgoomathVector2_Vector2js(4, 5);
				expect(u.data[0]).toEqual(1);
				expect(v.data[0]).toEqual(4);
			});
		});

		describe('add', function () {
			it('can perform addition', function () {
				var a = new srcgoomathVector2_Vector2js(1, 2);
				var b = new srcgoomathVector2_Vector2js(1, 2);

				a.add(a);

				expect(a).toBeCloseToVector(new srcgoomathVector2_Vector2js(2, 4));
				expect(srcgoomathVector2_Vector2js.add(b, b)).toBeCloseToVector(new srcgoomathVector2_Vector2js(2, 4));

				expect(srcgoomathVector2_Vector2js.add(b, 1)).toBeCloseToVector(new srcgoomathVector2_Vector2js(2, 3));
				expect(srcgoomathVector2_Vector2js.add(1, b)).toBeCloseToVector(new srcgoomathVector2_Vector2js(2, 3));

				expect(srcgoomathVector2_Vector2js.add(b, [1, 2])).toBeCloseToVector(new srcgoomathVector2_Vector2js(2, 4));
				expect(srcgoomathVector2_Vector2js.add([1, 2], b)).toBeCloseToVector(new srcgoomathVector2_Vector2js(2, 4));
			});
		});

		describe('sub', function () {
			it('can perform subtraction', function () {
				var a = new srcgoomathVector2_Vector2js(1, 2);
				var b = new srcgoomathVector2_Vector2js(1, 2);

				a.sub(a);

				expect(a).toBeCloseToVector(new srcgoomathVector2_Vector2js(0, 0));
				expect(srcgoomathVector2_Vector2js.sub(b, b)).toBeCloseToVector(new srcgoomathVector2_Vector2js(0, 0));

				expect(srcgoomathVector2_Vector2js.sub(b, 1)).toBeCloseToVector(new srcgoomathVector2_Vector2js(0, 1));
				expect(srcgoomathVector2_Vector2js.sub(1, b)).toBeCloseToVector(new srcgoomathVector2_Vector2js(0, -1));

				expect(srcgoomathVector2_Vector2js.sub(b, [1, 2])).toBeCloseToVector(new srcgoomathVector2_Vector2js(0, 0));
				expect(srcgoomathVector2_Vector2js.sub([1, 2], b)).toBeCloseToVector(new srcgoomathVector2_Vector2js(0, 0));
			});
		});

		describe('mul', function () {
			it('can perform multiplication', function () {
				var a = new srcgoomathVector2_Vector2js(1, 2);
				var b = new srcgoomathVector2_Vector2js(1, 2);

				a.mul(a);

				expect(a).toBeCloseToVector(new srcgoomathVector2_Vector2js(1, 4));
				expect(srcgoomathVector2_Vector2js.mul(b, b)).toBeCloseToVector(new srcgoomathVector2_Vector2js(1, 4));

				expect(srcgoomathVector2_Vector2js.mul(b, 1)).toBeCloseToVector(new srcgoomathVector2_Vector2js(1, 2));
				expect(srcgoomathVector2_Vector2js.mul(1, b)).toBeCloseToVector(new srcgoomathVector2_Vector2js(1, 2));

				expect(srcgoomathVector2_Vector2js.mul(b, [1, 2])).toBeCloseToVector(new srcgoomathVector2_Vector2js(1, 4));
				expect(srcgoomathVector2_Vector2js.mul([1, 2], b)).toBeCloseToVector(new srcgoomathVector2_Vector2js(1, 4));
			});
		});

		describe('scale', function () {
			it('scales a vector', function () {
				var vector = new srcgoomathVector2_Vector2js(1, 2);
				vector.scale(123);
				expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(1 * 123, 2 * 123));
			});
		});

		describe('div', function () {
			it('can perform division', function () {
				var a = new srcgoomathVector2_Vector2js(1, 2);
				var b = new srcgoomathVector2_Vector2js(1, 2);

				a.div(a);

				expect(a).toBeCloseToVector(new srcgoomathVector2_Vector2js(1, 1));
				expect(srcgoomathVector2_Vector2js.div(b, b)).toBeCloseToVector(new srcgoomathVector2_Vector2js(1, 1));

				expect(srcgoomathVector2_Vector2js.div(b, 1)).toBeCloseToVector(new srcgoomathVector2_Vector2js(1, 2));
				expect(srcgoomathVector2_Vector2js.div(1, b)).toBeCloseToVector(new srcgoomathVector2_Vector2js(1, 1/2));

				expect(srcgoomathVector2_Vector2js.div(b, [1, 2])).toBeCloseToVector(new srcgoomathVector2_Vector2js(1, 1));
				expect(srcgoomathVector2_Vector2js.div([1, 2], b)).toBeCloseToVector(new srcgoomathVector2_Vector2js(1, 1));
			});
		});

		describe('dot', function () {
			it('can calculate dot products', function () {
				var a = new srcgoomathVector2_Vector2js(1, 2);
				var b = new srcgoomathVector2_Vector2js(1, 2);

				expect(a.dot(b)).toEqual(5);
				expect(srcgoomathVector2_Vector2js.dot(a, b)).toEqual(5);
			});

			it('returns garbage if supplied with garbage', function () {
				expect(srcgoomathVector2_Vector2js.dot([1, 2], [5])).toEqual(NaN);
			});
		});

		describe('dotVector', function () {
			it('can calculate dot products', function () {
				var a = new srcgoomathVector2_Vector2js(1, 2);
				var b = new srcgoomathVector2_Vector2js(1, 2);

				expect(a.dotVector(b)).toEqual(5);
			});
		});

		it('can be normalized', function () {
			var a = new srcgoomathVector2_Vector2js();

			a.set(0, 0).normalize();
			expect(a.x).toBeCloseTo(0);
			expect(a.y).toBeCloseTo(0);

			a.set(1, 1).normalize();
			expect(a.x).toBeCloseTo(1/Math.sqrt(2));
			expect(a.y).toBeCloseTo(1/Math.sqrt(2));

			a.set(-2, -3).normalize();
			expect(a.x).toBeCloseTo(-2/Math.sqrt(2*2+3*3));
			expect(a.y).toBeCloseTo(-3/Math.sqrt(2*2+3*3));

			a.set(12, 34).normalize();
			expect(a.x).toBeCloseTo(12/Math.sqrt(12*12+34*34));
			expect(a.y).toBeCloseTo(34/Math.sqrt(12*12+34*34));
		});

		describe('reflect', function () {
			it('can reflect a vector', function () {
				var plane = new srcgoomathVector2_Vector2js(-1, 1).normalize(); // more like a vector
				var original = new srcgoomathVector2_Vector2js(1, 0);
				var reflection = original.clone().reflect(plane);

				expect(reflection).toBeCloseToVector(new srcgoomathVector2_Vector2js(0, 1));
			});
		});

		describe('copy', function () {
			it('can copy values from a vector', function () {
				var vector = new srcgoomathVector2_Vector2js(11, 22);
				vector.setVector(new srcgoomathVector2_Vector2js(55, 66));
				expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(55, 66));
			});
		});

		describe('clone', function () {
			it('clones a vector', function () {
				var original = new srcgoomathVector2_Vector2js(11, 22);
				var clone = original.clone();

				expect(original).toBeCloseToVector(clone);
				expect(original).not.toBe(clone);
			});
		});

		describe('setDirect', function () {
			it('can set a vector', function () {
				var vector = new srcgoomathVector2_Vector2js(11, 22);
				vector.setDirect(55, 66);
				expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(55, 66));
			});
		});

		describe('setVector', function () {
			it('can set a vector', function () {
				var vector = new srcgoomathVector2_Vector2js(11, 22);
				vector.setVector(new srcgoomathVector2_Vector2js(55, 66));
				expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(55, 66));
			});
		});


		describe('addDirect', function () {
			it('can add to a vector', function () {
				var vector = new srcgoomathVector2_Vector2js(11, 22);
				vector.addDirect(55, 66);
				expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(66, 88));
			});
		});

		describe('addVector', function () {
			it('can add to a vector', function () {
				var vector = new srcgoomathVector2_Vector2js(11, 22);
				vector.addVector(new srcgoomathVector2_Vector2js(55, 66));
				expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(66, 88));
			});
		});


		describe('mulDirect', function () {
			it('can multiply with 2 numbers', function () {
				var vector = new srcgoomathVector2_Vector2js(11, 22);
				vector.mulDirect(55, 66);
				expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(11 * 55, 22 * 66));
			});
		});

		describe('mulVector', function () {
			it('can multiply with a vector', function () {
				var vector = new srcgoomathVector2_Vector2js(11, 22);
				vector.mulVector(new srcgoomathVector2_Vector2js(55, 66));
				expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(11 * 55, 22 * 66));
			});
		});


		describe('subDirect', function () {
			it('can subtract from a vector', function () {
				var vector = new srcgoomathVector2_Vector2js(11, 22);
				vector.subDirect(55, 66);
				expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(11 - 55, 22 - 66));
			});
		});

		describe('subVector', function () {
			it('can subtract from a vector', function () {
				var vector = new srcgoomathVector2_Vector2js(11, 22);
				vector.subVector(new srcgoomathVector2_Vector2js(55, 66));
				expect(vector).toBeCloseToVector(new srcgoomathVector2_Vector2js(11 - 55, 22 - 66));
			});
		});
	});
});
