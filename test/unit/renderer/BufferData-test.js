var _BufferData = require('../../../src/goo/renderer/BufferData');

var CustomMatchers = require('../../../test/unit/CustomMatchers');

describe('BufferData', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	describe('copy', function () {
		it('can copy everything from another plane', function () {
			var original = new _BufferData.BufferData(new Uint8Array([11, 22, 33]), 'ArrayBuffer');
			var copy = new _BufferData.BufferData(new Uint8Array([44, 55, 66]), 'ElementArrayBuffer');
			copy.copy(original);

			expect(copy).toBeCloned(original);
		});
	});

	describe('clone', function () {
		it('can clone a plane', function () {
			var original = new _BufferData.BufferData(new Uint8Array([11, 22, 33]), 'ArrayBuffer');
			var clone = original.clone();

			expect(clone).toBeCloned(original);
		});
	});
});
