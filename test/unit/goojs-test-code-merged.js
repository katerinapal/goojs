var Matrix = require('../../src/goo/math/Matrix');
var MathUtils = require('../../src/goo/math/MathUtils');

function CustomMatchers(){}

var serializeArrayBuffer = function (array) {
	return '[' + Array.prototype.join.call(array, ', ') + ']';
};

var serializeVector = function (vector) {
	var ret = '(' + vector.x + ' ' + vector.y;

	if (vector.z !== undefined) { ret += ' ' + vector.z; }
	if (vector.w !== undefined) { ret += ' ' + vector.w; }

	return ret + ')';
};

// in this case NaN is equal to NaN
// you need matchers that check if a result is explicitly NaN
var arrayEq = function (array1, array2) {
	//if (array1.length !== array2.length) {
	//	return false;
	//}

	var keys = Object.keys(array1);
	for (var ki = 0; ki < keys.length; ki++) {
		var i = keys[ki];

		if (!(isNaN(array1[i]) && isNaN(array2[i]))) {
			if (!(Math.abs(array1[i] - array2[i]) <= MathUtils.EPSILON)) {
				return false;
			}
		}
	}

	return true;
};

CustomMatchers.toBeCloseToVector = function (util, customEqualityTesters) {
	return {
		compare: function (actual, expected) {
			var result = {};
			result.pass = arrayEq(actual, expected);

			if (result.pass) {
				result.message = 'Expected vectors to be different';
			} else {
				//if (!(actual instanceof Vector)) {
				//	result.message = 'Expected an instance of Vector';
				//} else if (actual.data.length !== expected.data.length) {
				//	result.message = 'Expected a vector of size ' + expected.data.length +
				//		' but got a vector of size ' + actual.data.length;
				//} else {
					//var expectedSerialized = serializeArrayBuffer(expected.data);
					//var actualSerialized = serializeArrayBuffer(actual.data);

				result.message = 'Expected vectors to be close; expected ' +
					serializeVector(expected) + ' but got ' + serializeVector(actual);
				//}
			}

			return result;
		}
	};
};

CustomMatchers.toBeCloseToMatrix = function (util, customEqualityTesters) {
	return {
		compare: function (actual, expected) {
			var result = {};
			result.pass = actual instanceof Matrix && arrayEq(actual.data, expected.data);

			if (result.pass) {
				result.message = 'Expected matrices to be different';
			} else {
				if (!(actual instanceof Matrix)) {
					result.message = 'Expected an instance of Matrix';
				} else if (actual.rows !== expected.rows || actual.cols !== expected.cols) {
					result.message = 'Expected a matrix of size (' + expected.rows + ', ' + expected.cols + ') '+
						'but got a matrix of size (' + actual.rows + ', ' + actual.cols + ')';
				} else {
					var expectedSerialized = serializeArrayBuffer(expected.data);
					var actualSerialized = serializeArrayBuffer(actual.data);

					result.message = 'Expected matrices to be close; expected ' + expectedSerialized +
						' but got ' + actualSerialized;
				}
			}

			return result;
		}
	};
};

CustomMatchers.toBeCloseToArray = function (util, customEqualityTesters) {
	return {
		compare: function (actual, expected) {
			var result = {};
			result.pass = actual instanceof Array && arrayEq(actual, expected);

			if (result.pass) {
				result.message = 'Expected arrays to be different';
			} else {
				if (!(actual instanceof Array)) {
					result.message = 'Expected an instance of Array';
				} else if (actual.length !== expected.length) {
					result.message = 'Expected an array of size ' + expected.length +
						' but got an array of size ' + actual.length;
				} else {
					var expectedSerialized = expected.join(', ');
					var actualSerialized = actual.join(', ');

					result.message = 'Expected arrays to be close; expected ' + expectedSerialized +
						' but got ' + actualSerialized;
				}
			}

			return result;
		}
	};
};

CustomMatchers.toBeCloned = function (util, customEqualityTesters) {
	// performs a deep equal check and verifies if all corresponding references are different
	function deepEquality(obj1, obj2, path, excluded) {
		if (obj1 instanceof Array) {
			if (obj1 === obj2) {
				return {
					type: 'same-reference',
					path: path
				};
			}

			for (var i = 0; i < obj1.length; i++) {
				var partialResult = deepEquality(obj1[i], obj2[i], path + '.' + i, excluded);
				if (partialResult) { return partialResult; }
			}
		} else if (typeof obj1 === 'object') {
			if (obj1 === null && obj2 === null) { return; }

			if (obj1 === obj2) {
				return {
					type: 'same-reference',
					path: path
				};
			}

			if (obj1.constructor !== obj2.constructor) {
				return {
					type: 'different-constructors',
					path: path
				};
			}

			var keys = Object.keys(obj1);
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				if (excluded.has(key)) { continue; }
				var partialResult = deepEquality(obj1[key], obj2[key], path + '.' + key, excluded);
				if (partialResult) { return partialResult; }
			}
		} else if (obj1 !== obj2) {
			return {
				type: 'different-value',
				path: path
			};
		}
	}

	return {
		compare: function (actual, expected) {
			var excluded, value;

			// optional parameters for custom matchers; not sure if best way but so far looks like the only way
			if (typeof expected === 'object' &&
				expected.hasOwnProperty('value') &&
				expected.hasOwnProperty('excluded')
				) {
				excluded = new Set();
				expected.excluded.forEach(function (element) {
					excluded.add(element);
				});
				value = expected.value;
			} else {
				excluded = new Set();
				value = expected;
			}

			var result = {};
			var equalityResult = deepEquality(value, actual, '', excluded);
			result.pass = !equalityResult;

			if (result.pass) {
				result.message = 'Expected objects to not be clones';
			} else {
				result.message = 'Expected objects to be clones; ' +
					equalityResult.type + ' on ' + equalityResult.path;
			}

			return result;
		}
	};
};

module.exports = CustomMatchers;

var Vector3 = require("../../src/goo/math/Vector3");
var World = require("../../src/goo/entities/World");
var LineRenderSystem = require("../../src/goo/addons/linerenderpack/LineRenderSystem");

describe('LineRenderSystem', function () {
	var world;
	var lineRenderSystem;

	beforeEach(function () {
		world = new World();
		lineRenderSystem = new LineRenderSystem(world);
	});

	it('can construct', function () {
		expect(lineRenderSystem).toBeDefined();
	});

	it('can drawLine', function () {
		//draw a red line between 0,0,0 and 1,1,1
		lineRenderSystem.drawLine(Vector3.ZERO, Vector3.ONE, lineRenderSystem.RED);

		expect(lineRenderSystem._lineRenderers.length).toBe(1);
	});

	it('can drawCross', function () {
		//draw a red cross at 0,0,0
		lineRenderSystem.drawCross(Vector3.ZERO, lineRenderSystem.RED);

		expect(lineRenderSystem._lineRenderers.length).toBe(1);
	});
});

var Vector3 = require("../../src/goo/math/Vector3");
var World = require("../../src/goo/entities/World");
var LineRenderer = require("../../src/goo/addons/linerenderpack/LineRenderer");

describe('LineRenderer', function () {
	var world;
	var lineRenderer;
	var redColor = new Vector3(1, 0, 0);

	beforeEach(function () {
		world = new World();
	});

	it('can construct', function () {
		lineRenderer = new LineRenderer(world);

		expect(lineRenderer).toBeDefined();
	});

	it('can add line', function () {
		lineRenderer = new LineRenderer(world);

		lineRenderer._addLine(Vector3.ZERO, Vector3.ONE, redColor);

		//expect _numRenderingLines to have incremented
		expect(lineRenderer._numRenderingLines).toBe(1);
	});

	it('can add to renderList', function () {
		lineRenderer = new LineRenderer(world);
		var renderList = [];

		lineRenderer._addLine(Vector3.ZERO, Vector3.ONE, redColor);

		lineRenderer._manageRenderList(renderList);

		//expect an element in the renderList array
		expect(renderList.length).toBe(1);
	});

	it('can remove from renderList', function () {
		lineRenderer = new LineRenderer(world);
		var renderList = [];

		lineRenderer._addLine(Vector3.ZERO, Vector3.ONE, redColor);

		//simulate two frames
		for (var i = 0; i < 2; i++) {
			lineRenderer._updateVertexData();
			lineRenderer._manageRenderList(renderList);
			lineRenderer._clear();
		}

		//expect no elements in the renderList array
		expect(renderList.length).toBe(0);
	});
});

var Vector3 = require("../../src/goo/math/Vector3");
var CustomMatchers = require("./CustomMatchers");
var World = require("../../src/goo/entities/World");
var TransformComponent = require("../../src/goo/entities/components/TransformComponent");
var ParticleSystemComponent = require("../../src/goo/addons/particlepack/components/ParticleSystemComponent");

describe('ParticleData', function () {
	var world;

	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
		world = new World();
		world.registerComponent(TransformComponent);
		world.registerComponent(ParticleSystemComponent);
	});

	it('can get world position', function () {
		var component = new ParticleSystemComponent();
		world.createEntity([0, 0, 0], component).addToWorld();
		var store = new Vector3();
		component.particles[0].getWorldPosition(store);
	});
});

var CustomMatchers = require("./CustomMatchers");
var LinearCurve = require("../../src/goo/addons/particlepack/curves/LinearCurve");
var MeshData = require("../../src/goo/renderer/MeshData");
var ParticleSystemComponent = require("../../src/goo/addons/particlepack/components/ParticleSystemComponent");
var Texture = require("../../src/goo/renderer/Texture");
var TransformComponent = require("../../src/goo/entities/components/TransformComponent");
var Vector3 = require("../../src/goo/math/Vector3");
var Vector3Curve = require("../../src/goo/addons/particlepack/curves/Vector3Curve");
var Vector4Curve = require("../../src/goo/addons/particlepack/curves/Vector4Curve");
var World = require("../../src/goo/entities/World");

describe('ParticleSystemComponent', function () {
	var world;

	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
		world = new World();
		world.registerComponent(TransformComponent);
		world.registerComponent(ParticleSystemComponent);
	});

	it('gets added to the entity via world.createEntity', function () {
		var component = new ParticleSystemComponent();
		var entity = world.createEntity([0, 0, 0], component).addToWorld();
		expect(entity.particleSystemComponent).toBe(component);
	});

	it('can clone', function () {
		var texture = new Texture();

		var component = new ParticleSystemComponent({
			maxParticles: 10,
			time: 1,
			gravity: new Vector3(1, 2, 3),
			seed: 123,
			shapeType: 'box',
			sphereRadius: 123,
			sphereEmitFromShell: true,
			randomDirection: true,
			coneEmitFrom: 'volume',
			boxExtents: new Vector3(1, 2, 3),
			coneRadius: 123,
			coneAngle: 123,
			coneLength: 123,
			preWarm: true,
			startColor: new LinearCurve({ k: 123, m: 123 }),
			colorOverLifetime: new Vector4Curve({
				x: new LinearCurve({ k: 123, m: 123 }),
				y: new LinearCurve({ k: 123, m: 123 }),
				z: new LinearCurve({ k: 123, m: 123 }),
				w: new LinearCurve({ k: 123, m: 123 })
			}),
			duration: 123,
			localSpace: false,
			startSpeed: new LinearCurve({ k: 123, m: 123 }),
			localVelocityOverLifetime: new Vector3Curve({
				x: new LinearCurve({ k: 123, m: 123 }),
				y: new LinearCurve({ k: 123, m: 123 }),
				z: new LinearCurve({ k: 123, m: 123 })
			}),
			worldVelocityOverLifetime: new Vector3Curve({
				x: new LinearCurve({ k: 123, m: 123 }),
				y: new LinearCurve({ k: 123, m: 123 }),
				z: new LinearCurve({ k: 123, m: 123 })
			}),
			emissionRate: new LinearCurve({ k: 123, m: 123 }),
			startLifetime: new LinearCurve({ k: 123, m: 123 }),
			renderQueue: 123,
			discardThreshold: 0.123,
			loop: true,
			blending: 'TransparencyBlending',
			depthWrite: false,
			depthTest: false,
			textureTilesX: 123,
			textureTilesY: 123,
			textureAnimationCycles: 123,
			startSize: new LinearCurve({ k: 123, m: 123 }),
			sortMode: ParticleSystemComponent.SORT_CAMERA_DISTANCE,
			mesh: new MeshData(),
			billboard: false,
			sizeOverLifetime: new LinearCurve({ k: 123, m: 123 }),
			startAngle: new LinearCurve({ k: 123, m: 123 }),
			rotationSpeedOverLifetime: new LinearCurve({ k: 123, m: 123 }),
			texture: texture,
			textureFrameOverLifetime: new LinearCurve({ k: 1, m: 0 })
		});

		var clone = component.clone();

		expect(clone.maxParticles).toBe(10);
		expect(clone.time).toBe(1);
		expect(clone.gravity).toEqual(new Vector3(1, 2, 3));
		expect(clone.seed).toEqual(123);
		expect(clone.shapeType).toBe('box');
		expect(clone.sphereRadius).toBe(123);
		expect(clone.sphereEmitFromShell).toBe(true);
		expect(clone.randomDirection).toBe(true);
		expect(clone.coneEmitFrom).toBe('volume');
		expect(clone.boxExtents).toEqual(new Vector3(1, 2, 3));
		expect(clone.coneRadius).toBe(123);
		expect(clone.coneAngle).toBe(123);
		expect(clone.coneLength).toBe(123);
		expect(clone.preWarm).toBe(true);
		expect(clone.startColor).toEqual(new LinearCurve({ k: 123, m: 123 }));
		expect(clone.colorOverLifetime).toEqual(new Vector4Curve({
			x: new LinearCurve({ k: 123, m: 123 }),
			y: new LinearCurve({ k: 123, m: 123 }),
			z: new LinearCurve({ k: 123, m: 123 }),
			w: new LinearCurve({ k: 123, m: 123 })
		}));
		expect(clone.duration).toBe(123);
		expect(clone.localSpace).toBe(false);
		expect(clone.startSpeed).toEqual(new LinearCurve({ k: 123, m: 123 }));
		expect(clone.localVelocityOverLifetime).toEqual(new Vector3Curve({
			x: new LinearCurve({ k: 123, m: 123 }),
			y: new LinearCurve({ k: 123, m: 123 }),
			z: new LinearCurve({ k: 123, m: 123 })
		}));
		expect(clone.worldVelocityOverLifetime).toEqual(new Vector3Curve({
			x: new LinearCurve({ k: 123, m: 123 }),
			y: new LinearCurve({ k: 123, m: 123 }),
			z: new LinearCurve({ k: 123, m: 123 })
		}));
		expect(clone.emissionRate).toEqual(new LinearCurve({ k: 123, m: 123 }));
		expect(clone.startLifetime).toEqual(new LinearCurve({ k: 123, m: 123 }));
		expect(clone.renderQueue).toBe(123);
		expect(clone.discardThreshold).toBe(0.123);
		expect(clone.loop).toBe(true);
		expect(clone.blending).toBe('TransparencyBlending');
		expect(clone.depthWrite).toBe(false);
		expect(clone.depthTest).toBe(false);
		expect(clone.textureTilesX).toBe(123);
		expect(clone.textureTilesY).toBe(123);
		expect(clone.textureAnimationCycles).toBe(123);
		expect(clone.startSize).toEqual(new LinearCurve({ k: 123, m: 123 }));
		expect(clone.sortMode).toEqual(ParticleSystemComponent.SORT_CAMERA_DISTANCE);
		expect(clone.mesh).toEqual(new MeshData());
		expect(clone.billboard).toBe(false);
		expect(clone.sizeOverLifetime).toEqual(new LinearCurve({ k: 123, m: 123 }));
		expect(clone.startAngle).toEqual(new LinearCurve({ k: 123, m: 123 }));
		expect(clone.rotationSpeedOverLifetime).toEqual(new LinearCurve({ k: 123, m: 123 }));
		expect(clone.texture).toEqual(texture);
		expect(clone.textureFrameOverLifetime).toEqual(new LinearCurve({ m: 0, k: 1 }));
	});

	it('can emit one', function () {
		var component = new ParticleSystemComponent({
			localSpace: false
		});
		world.createEntity([0, 0, 0], component).addToWorld();
		var position = new Vector3();
		var direction = new Vector3(0,1,0);
		component.emitOne(position, direction);

		expect(component.particles[0].startPosition).toEqual(position);
		expect(component.particles[0].startDirection).toEqual(direction);
	});

	it('can pause/resume', function () {
		var component = new ParticleSystemComponent();
		world.createEntity([0, 0, 0], component).addToWorld();
		expect(component.time).toBe(0);
		component.process(1);
		expect(component.time).toBe(1);
		component.pause();
		component.process(1);
		expect(component.time).toBe(1);
		component.resume();
		component.process(1);
		expect(component.time).toBe(2);
	});

	it('can stop/resume', function () {
		var component = new ParticleSystemComponent();
		world.createEntity([0, 0, 0], component).addToWorld();
		component.process(1);
		expect(component.time).toBe(1);
		component.stop();
		expect(component.time).toBe(0);
		component.process(1);
		expect(component.time).toBe(0);
		component.resume();
		component.process(1);
		expect(component.time).toBe(1);
	});
});


var ConstantCurve = require("../../src/goo/addons/particlepack/curves/ConstantCurve");

describe('ConstantCurve', function () {
	it('.getValueAt', function () {
		var set = new ConstantCurve({ value: 123 });
		expect(set.getValueAt(0)).toBe(123);
		expect(set.getValueAt(0.5)).toBe(123);
		expect(set.getValueAt(1)).toBe(123);
	});

	it('.getIntegralValueAt', function () {
		var set = new ConstantCurve({ value: 123 });
		expect(set.getIntegralValueAt(0)).toBe(0);
		expect(set.getIntegralValueAt(0.5)).toBe(123 * 0.5);
		expect(set.getIntegralValueAt(1)).toBe(123);
	});

	it('.toGLSL', function () {
		var set = new ConstantCurve({ value: 123 });
		expect(set.toGLSL('t')).toBe('123.0');
	});

	it('.integralToGLSL', function () {
		var set = new ConstantCurve({ value: 123 });
		expect(set.integralToGLSL('t')).toBe('(123.0*t)');
	});
});


var Curve = require("../../src/goo/addons/particlepack/curves/Curve");

describe('Curve', function () {
	it('.getValueAt', function () {
		var curve = new Curve();
		expect(curve.getValueAt(0)).toBe(0);
	});

	it('.toGLSL', function () {
		var curve = new Curve();
		expect(curve.toGLSL('t')).toBe('0.0');
	});
});

var ConstantCurve = require("../../src/goo/addons/particlepack/curves/ConstantCurve");
var LerpCurve = require("../../src/goo/addons/particlepack/curves/LerpCurve");

describe('LerpCurve', function () {
	it('.getValueAt', function () {
		var curve = new LerpCurve({
			curveA: new ConstantCurve({ value: 1 }),
			curveB: new ConstantCurve({ value: 2 })
		});

		expect(curve.getValueAt(0, 0.5)).toBe(1.5);
		expect(curve.getValueAt(0.5, 0.5)).toBe(1.5);
		expect(curve.getValueAt(1, 0.5)).toBe(1.5);
	});

	it('.getVec4IntegralValueAt', function () {
		var curve = new LerpCurve({
			curveA: new ConstantCurve({ value: 1 }),
			curveB: new ConstantCurve({ value: 2 })
		});

		expect(curve.getIntegralValueAt(0, 0.5)).toBe(0);
		expect(curve.getIntegralValueAt(0.5, 0.5)).toBe(0.75);
		expect(curve.getIntegralValueAt(1, 0.5)).toBe(1.5);
	});

	it('.toGLSL', function () {
		var curve = new LerpCurve({
			curveA: new ConstantCurve({ value: 1 }),
			curveB: new ConstantCurve({ value: 2 })
		});
		expect(curve.toGLSL('t', 'a')).toBe('mix(1.0,2.0,a)');
	});

	it('.integralToGLSL', function () {
		var curve = new LerpCurve({
			curveA: new ConstantCurve({ value: 1 }),
			curveB: new ConstantCurve({ value: 2 })
		});
		expect(curve.integralToGLSL('t','a')).toBe('mix((1.0*t),(2.0*t),a)');
	});
});


var LinearCurve = require("../../src/goo/addons/particlepack/curves/LinearCurve");

describe('LinearCurve', function () {
	it('.getValueAt', function () {
		var curve = new LinearCurve({
			k: 1,
			m: 0
		});
		expect(curve.getValueAt(0)).toBe(0);
		expect(curve.getValueAt(0.5)).toBe(0.5);
		expect(curve.getValueAt(1)).toBe(1);

		curve.k = 0.5;
		curve.m = 0.5;
		expect(curve.getValueAt(0)).toBe(0.5);
		expect(curve.getValueAt(1)).toBe(1);
	});

	it('.getIntegralValueAt', function () {
		var curve = new LinearCurve({
			k: 1,
			m: 0
		});
		expect(curve.getIntegralValueAt(0)).toBe(0);
		expect(curve.getIntegralValueAt(0.5)).toBe(0.125); // 0.5 * 0.5^2 + 0 * 0.5
		expect(curve.getIntegralValueAt(1)).toBe(0.5);

		curve.k = 0.5;
		curve.m = 0.5;
		expect(curve.getIntegralValueAt(0)).toBe(0);
		expect(curve.getIntegralValueAt(1)).toBe(0.75); // 0.5 * 1^2 + 0.5
	});

	it('.toGLSL', function () {
		var curve = new LinearCurve({
			k: 1,
			m: 0
		});
		expect(curve.toGLSL('t')).toBe('(1.0*t+0.0)');
	});

	it('.integralToGLSL', function () {
		var curve = new LinearCurve({
			k: 1,
			m: 0
		});
		expect(curve.integralToGLSL('t')).toBe('(1.0*t*t*0.5+0.0*t)');
	});
});


var PolyCurve = require("../../src/goo/addons/particlepack/curves/PolyCurve");
var Curve = require("../../src/goo/addons/particlepack/curves/Curve");
var LinearCurve = require("../../src/goo/addons/particlepack/curves/LinearCurve");

describe('PolyCurve', function () {
	it('can add a segment', function () {
		var set = new PolyCurve();
		var curve = new Curve();
		set.addSegment(curve);
		expect(set.segments.length).toBe(1);
	});

	it('.getValueAt', function () {

		it('can get a value from multiple curve types', function () {
			var set = new PolyCurve();
			var curve = new Curve();
			set.addSegment(curve);
			expect(set.getValueAt(0.5)).toBe(0);
		});

		it('can get a value from multiple curve types', function () {
			var set = new PolyCurve();
			set.addSegment(new Curve({ timeOffset: 0 }));
			set.addSegment(new LinearCurve({ timeOffset: 0.5, k: 1, m: 0 }));
			expect(set.getValueAt(0)).toBe(0);
			expect(set.getValueAt(1)).toBe(0.5);
		});
	});

	it('.getIntegralValueAt', function () {
		var set = new PolyCurve();
		var curve = new LinearCurve({ timeOffset: 0, k: 1, m: 0 });
		set.addSegment(curve);
		expect(set.getIntegralValueAt(0.5)).toBe(0.125);
	});

	it('.toGLSL', function () {
		var set = new PolyCurve();
		set.addSegment(new Curve({ timeOffset: 0 }));
		set.addSegment(new Curve({ timeOffset: 0.5 }));
		expect(set.toGLSL('t','lerp')).toBe('step(0.0,t)*step(-0.5,-t)*0.0+step(0.5,t)*step(-1.0,-t)*0.0');
	});

	it('.integralToGLSL', function () {
		var set = new PolyCurve();
		set.addSegment(new LinearCurve({ timeOffset: 0, k: 1, m: 0 }));
		expect(set.integralToGLSL('t','lerp')).toBe('(1.0*clamp(t,0.0,1.0)*clamp(t,0.0,1.0)*0.5+0.0*clamp(t,0.0,1.0))');
	});
});


var Vector3Curve = require("../../src/goo/addons/particlepack/curves/Vector3Curve");
var ConstantCurve = require("../../src/goo/addons/particlepack/curves/ConstantCurve");
var Vector3 = require("../../src/goo/math/Vector3");

describe('Vector3Curve', function () {
	it('.getVec3ValueAt', function () {
		var curve = new Vector3Curve({
			x: new ConstantCurve({ value: 1 }),
			y: new ConstantCurve({ value: 2 }),
			z: new ConstantCurve({ value: 3 })
		});
		var store0 = new Vector3();
		var store1 = new Vector3();
		var store2 = new Vector3();

		curve.getVec3ValueAt(0, 0, store0);
		curve.getVec3ValueAt(0.5, 0, store1);
		curve.getVec3ValueAt(1, 0, store2);

		expect(store0).toEqual(new Vector3(1, 2, 3));
		expect(store1).toEqual(new Vector3(1, 2, 3));
		expect(store2).toEqual(new Vector3(1, 2, 3));
	});

	it('.getVec3IntegralValueAt', function () {
		var curve = new Vector3Curve({
			x: new ConstantCurve({ value: 1 }),
			y: new ConstantCurve({ value: 2 }),
			z: new ConstantCurve({ value: 3 })
		});
		var store0 = new Vector3();
		var store1 = new Vector3();
		var store2 = new Vector3();

		curve.getVec3IntegralValueAt(0, 0, store0);
		curve.getVec3IntegralValueAt(0.5, 0, store1);
		curve.getVec3IntegralValueAt(1, 0, store2);

		expect(store0).toEqual(new Vector3(0, 0, 0));
		expect(store1).toEqual(new Vector3(0.5, 1, 1.5));
		expect(store2).toEqual(new Vector3(1, 2, 3));
	});

	it('.toGLSL', function () {
		var curve = new Vector3Curve({
			x: new ConstantCurve({ value: 1 }),
			y: new ConstantCurve({ value: 2 }),
			z: new ConstantCurve({ value: 3 })
		});
		expect(curve.toGLSL('t')).toBe('vec3(1.0,2.0,3.0)');
	});

	it('.integralToGLSL', function () {
		var curve = new Vector3Curve({
			x: new ConstantCurve({ value: 1 }),
			y: new ConstantCurve({ value: 2 }),
			z: new ConstantCurve({ value: 3 })
		});
		expect(curve.integralToGLSL('t')).toBe('vec3((1.0*t),(2.0*t),(3.0*t))');
	});
});


var Vector4Curve = require("../../src/goo/addons/particlepack/curves/Vector4Curve");
var ConstantCurve = require("../../src/goo/addons/particlepack/curves/ConstantCurve");
var Vector4 = require("../../src/goo/math/Vector4");

describe('Vector4Curve', function () {
	it('.getVec4ValueAt', function () {
		var curve = new Vector4Curve({
			x: new ConstantCurve({ value: 1 }),
			y: new ConstantCurve({ value: 2 }),
			z: new ConstantCurve({ value: 3 }),
			w: new ConstantCurve({ value: 4 })
		});
		var store0 = new Vector4();
		var store1 = new Vector4();
		var store2 = new Vector4();

		curve.getVec4ValueAt(0, 0, store0);
		curve.getVec4ValueAt(0.5, 0, store1);
		curve.getVec4ValueAt(1, 0, store2);

		expect(store0).toEqual(new Vector4(1, 2, 3, 4));
		expect(store1).toEqual(new Vector4(1, 2, 3, 4));
		expect(store2).toEqual(new Vector4(1, 2, 3, 4));
	});

	it('.getVec4IntegralValueAt', function () {
		var curve = new Vector4Curve({
			x: new ConstantCurve({ value: 1 }),
			y: new ConstantCurve({ value: 2 }),
			z: new ConstantCurve({ value: 3 }),
			w: new ConstantCurve({ value: 4 })
		});
		var store0 = new Vector4();
		var store1 = new Vector4();
		var store2 = new Vector4();

		curve.getVec4IntegralValueAt(0, 0, store0);
		curve.getVec4IntegralValueAt(0.5, 0, store1);
		curve.getVec4IntegralValueAt(1, 0, store2);

		expect(store0).toEqual(new Vector4(0, 0, 0, 0));
		expect(store1).toEqual(new Vector4(0.5, 1, 1.5, 2));
		expect(store2).toEqual(new Vector4(1, 2, 3, 4));
	});

	it('.toGLSL', function () {
		var curve = new Vector4Curve({
			x: new ConstantCurve({ value: 1 }),
			y: new ConstantCurve({ value: 2 }),
			z: new ConstantCurve({ value: 3 }),
			w: new ConstantCurve({ value: 4 })
		});
		expect(curve.toGLSL('t')).toBe('vec4(1.0,2.0,3.0,4.0)');
	});

	it('.integralToGLSL', function () {
		var curve = new Vector4Curve({
			x: new ConstantCurve({ value: 1 }),
			y: new ConstantCurve({ value: 2 }),
			z: new ConstantCurve({ value: 3 }),
			w: new ConstantCurve({ value: 4 })
		});
		expect(curve.integralToGLSL('t')).toBe('vec4((1.0*t),(2.0*t),(3.0*t),(4.0*t))');
	});
});


var PolyCurve = require("../../src/goo/addons/particlepack/curves/PolyCurve");
var Vector3Curve = require("../../src/goo/addons/particlepack/curves/Vector3Curve");
var Vector4Curve = require("../../src/goo/addons/particlepack/curves/Vector4Curve");
var ConstantCurve = require("../../src/goo/addons/particlepack/curves/ConstantCurve");
var ConstantCurve = require("../../src/goo/addons/particlepack/curves/ConstantCurve");
var ParticleSystemComponent = require("../../src/goo/addons/particlepack/components/ParticleSystemComponent");
var Vector3 = require("../../src/goo/math/Vector3");
var World = require("../../src/goo/entities/World");
var Configs = require("./loaders/Configs");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var _ = require("../../src/goo/util/ObjectUtil");

require("../../src/goo/addons/particlepack/handlers/ParticleSystemComponentHandler");

describe('ParticleSystemComponentHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: typeof(window) !== 'undefined' && window.__karma__ ? './' : 'loaders/res'
		});
	});

	it('loads an entity with a ParticleSystemComponent', function (done) {
		var config = Configs.entity(['transform', 'particleSystem']);

		function constantCurve(value){
			return [{
				type: 'constant',
				offset: 0,
				value: value
			}];
		}

		_.extend(config.components.particleSystem, {
			seed: 123,
			shapeType: 'sphere',
			sphereRadius: 123,
			sphereEmitFromShell: true,
			randomDirection: true,
			coneEmitFrom: 'volume',
			boxExtents: [1, 2, 3],
			coneRadius: 123,
			coneAngle: 12,
			coneLength: 123,
			startColor: [
				constantCurve(0),
				constantCurve(1),
				constantCurve(0),
				constantCurve(1)
			],
			colorOverLifetime: [
				constantCurve(1),
				constantCurve(0),
				constantCurve(0),
				constantCurve(1)
			],
			duration: 123,
			localSpace: true,
			startSpeed: constantCurve(123),
			localVelocityOverLifetime: [constantCurve(0),constantCurve(0),constantCurve(0)],
			worldVelocityOverLifetime: [constantCurve(0),constantCurve(0),constantCurve(0)],
			maxParticles: 123,
			emissionRate: constantCurve(123),
			startLifetime: constantCurve(123),
			renderQueue: 3123,
			discardThreshold: 0.6,
			loop: true,
			blending: 'TransparencyBlending',
			depthWrite: false,
			depthTest: false,
			textureTilesX: 12,
			textureTilesY: 34,
			textureFrameOverLifetime: constantCurve(0),
			textureAnimationCycles: 123,
			startSize: constantCurve(123),
			sortMode: 'camera_distance',
			billboard: false,
			sizeOverLifetime: constantCurve(1),
			startAngle: constantCurve(0),
			rotationSpeedOverLifetime: constantCurve(0)
			//textureRef: null
		});

		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			expect(entity.particleSystemComponent).toEqual(jasmine.any(ParticleSystemComponent));

			function newConstantPolyCurve(value){
				return new PolyCurve({ segments: [new ConstantCurve({ value: value })] });
			}
			function newVector4Curve(x,y,z,w){
				return new Vector4Curve({
					x: newConstantPolyCurve(x),
					y: newConstantPolyCurve(y),
					z: newConstantPolyCurve(z),
					w: newConstantPolyCurve(w)
				});
			}
			function newVector3Curve(x,y,z){
				return new Vector3Curve({
					x: newConstantPolyCurve(x),
					y: newConstantPolyCurve(y),
					z: newConstantPolyCurve(z)
				});
			}
			var c = entity.particleSystemComponent;
			expect(c.seed).toEqual(123);
			expect(c.shapeType).toEqual('sphere');
			expect(c.sphereRadius).toEqual(123);
			expect(c.sphereEmitFromShell).toEqual(true);
			expect(c.randomDirection).toEqual(true);
			expect(c.coneEmitFrom).toEqual('volume');
			expect(c.boxExtents).toEqual(new Vector3(1, 2, 3));
			expect(c.coneRadius).toEqual(123);
			expect(c.coneAngle.toFixed(4)).toEqual((12 * Math.PI / 180).toFixed(4));
			expect(c.coneLength).toEqual(123);
			expect(c.startColor).toEqual(newVector4Curve(0,1,0,1));
			expect(c.colorOverLifetime).toEqual(newVector4Curve(1,0,0,1));
			expect(c.duration).toEqual(123);
			expect(c.localSpace).toEqual(true);
			expect(c.startSpeed).toEqual(newConstantPolyCurve(123));
			expect(c.localVelocityOverLifetime).toEqual(newVector3Curve(0,0,0));
			expect(c.worldVelocityOverLifetime).toEqual(newVector3Curve(0,0,0));
			expect(c.maxParticles).toEqual(123);
			expect(c.emissionRate).toEqual(newConstantPolyCurve(123));
			expect(c.startLifetime).toEqual(newConstantPolyCurve(123));
			expect(c.renderQueue).toEqual(3123);
			expect(c.discardThreshold).toEqual(0.6);
			expect(c.loop).toEqual(true);
			expect(c.blending).toEqual('TransparencyBlending');
			expect(c.depthWrite).toEqual(false);
			expect(c.depthTest).toEqual(false);
			expect(c.textureTilesX).toEqual(12);
			expect(c.textureTilesY).toEqual(34);
			expect(c.textureAnimationCycles).toEqual(123);
			expect(c.textureFrameOverLifetime).toEqual(newConstantPolyCurve(0));
			expect(c.startSize).toEqual(newConstantPolyCurve(123));
			expect(c.sortMode).toEqual(ParticleSystemComponent.SORT_CAMERA_DISTANCE);
			expect(c.billboard).toEqual(false);
			expect(c.sizeOverLifetime).toEqual(newConstantPolyCurve(1));
			expect(c.startAngle).toEqual(newConstantPolyCurve(0));
			expect(c.rotationSpeedOverLifetime).toEqual(newConstantPolyCurve(0));

			done();
		});
	});
});


describe('BoxCollider', function () {

	var BoxCollider = require("../../src/goo/addons/physicspack/colliders/BoxCollider");
	var Vector3 = require("../../src/goo/math/Vector3");
	var Transform = require("../../src/goo/math/Transform");

	it('can clone', function () {
		var collider = new BoxCollider({
			halfExtents: new Vector3(1, 2, 3)
		});
		var clone = collider.clone();
		expect(collider).toEqual(clone);
	});

	it('can transform', function () {
		var collider = new BoxCollider({
			halfExtents: new Vector3(1, 2, 3)
		});
		var transform = new Transform();
		transform.scale.setDirect(1, 2, 3);
		collider.transform(transform, collider);
		expect(collider.halfExtents).toEqual(new Vector3(1, 4, 9));
	});
});

describe('CylinderCollider', function () {

	var CylinderCollider = require("../../src/goo/addons/physicspack/colliders/CylinderCollider");
	var Transform = require("../../src/goo/math/Transform");

	it('can clone', function () {
		var collider = new CylinderCollider({
			radius: 123,
			height: 456
		});
		var clone = collider.clone();
		expect(collider).toEqual(clone);
	});

	it('can transform', function () {
		var collider = new CylinderCollider({
			radius: 2,
			height: 3
		});
		var transform = new Transform();
		transform.scale.setDirect(1, 2, 3);
		collider.transform(transform, collider);
		expect(collider.radius).toEqual(4);
		expect(collider.height).toEqual(9);
	});
});


describe('MeshCollider', function () {

	var MeshCollider = require("../../src/goo/addons/physicspack/colliders/MeshCollider");
	var Vector3 = require("../../src/goo/math/Vector3");
	var Sphere = require("../../src/goo/shapes/Sphere");
	var Transform = require("../../src/goo/math/Transform");

	it('can clone', function () {
		var collider = new MeshCollider({
			meshData: new Sphere(10, 10, 1),
			scale: new Vector3(2, 3, 4)
		});
		var clone = collider.clone();
		expect(collider).toEqual(clone);
	});

	it('can transform', function () {
		var collider = new MeshCollider({
			meshData: new Sphere(10, 10, 1),
			scale: new Vector3(2, 3, 4)
		});
		var transform = new Transform();
		transform.scale.setDirect(1, 2, 3);
		collider.transform(transform, collider);
		expect(collider.scale).toEqual(new Vector3(2, 6, 12));
	});
});


describe('PlaneCollider', function () {

	var PlaneCollider = require("../../src/goo/addons/physicspack/colliders/PlaneCollider");
	var Transform = require("../../src/goo/math/Transform");

	it('can clone', function () {
		var collider = new PlaneCollider();
		var clone = collider.clone();
		expect(collider).toEqual(clone);
	});

	it('can transform', function () {
		var collider = new PlaneCollider();
		var collider2 = new PlaneCollider();
		var transform = new Transform();
		collider.transform(transform, collider2);
		expect(collider).toEqual(collider2);
	});
});


describe('SphereCollider', function () {

	var SphereCollider = require("../../src/goo/addons/physicspack/colliders/SphereCollider");
	var Transform = require("../../src/goo/math/Transform");

	it('can clone', function () {
		var collider = new SphereCollider({
			radius: 2
		});
		var clone = collider.clone();
		expect(collider).toEqual(clone);
	});

	it('can transform', function () {
		var collider = new SphereCollider({
			radius: 2
		});
		var transform = new Transform();
		transform.scale.setDirect(1, 2, 3);
		collider.transform(transform, collider);
		expect(collider.radius).toEqual(6);
	});
});


var SphereCollider = require("../../src/goo/addons/physicspack/colliders/SphereCollider");
var Vector3 = require("../../src/goo/math/Vector3");
var World = require("../../src/goo/entities/World");
var TransformSystem = require("../../src/goo/entities/systems/TransformSystem");
var PhysicsMaterial = require("../../src/goo/addons/physicspack/PhysicsMaterial");
var PhysicsSystem = require("../../src/goo/addons/physicspack/systems/PhysicsSystem");
var ColliderSystem = require("../../src/goo/addons/physicspack/systems/ColliderSystem");
var ColliderComponent = require("../../src/goo/addons/physicspack/components/ColliderComponent");

/* global CANNON */

describe('ColliderComponent', function () {
	var world, system;

	beforeEach(function () {
		world = new World();
		system = new PhysicsSystem({
			maxSubSteps: 1
		});
		system.setGravity(new Vector3());
		world.setSystem(system);
		world.setSystem(new TransformSystem());
		world.setSystem(new ColliderSystem());
	});

	it('can update its world collider', function () {
		var colliderComponent = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 })
		});
		var entity = world.createEntity(colliderComponent).addToWorld();

		entity.setTranslation(1, 2, 3);
		entity.setScale(1, 2, 3);

		colliderComponent.updateWorldCollider(true);

		expect(colliderComponent.worldCollider.radius).toBe(3);
	});

	it('instantiates as a static body without a rigid body component', function () {
		var material = new PhysicsMaterial({
			friction: 0.6,
			restitution: 0.7
		});
		var colliderComponent = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 }),
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


/* global CANNON */

describe('RigidBodyComponent', function () {

	var SphereCollider = require("../../src/goo/addons/physicspack/colliders/SphereCollider");
	var Vector3 = require("../../src/goo/math/Vector3");
	var Quaternion = require("../../src/goo/math/Quaternion");
	var World = require("../../src/goo/entities/World");
	var SystemBus = require("../../src/goo/entities/SystemBus");
	var PhysicsMaterial = require("../../src/goo/addons/physicspack/PhysicsMaterial");
	var PhysicsSystem = require("../../src/goo/addons/physicspack/systems/PhysicsSystem");
	var ColliderComponent = require("../../src/goo/addons/physicspack/components/ColliderComponent");
	var RigidBodyComponent = require("../../src/goo/addons/physicspack/components/RigidBodyComponent");
	var BallJoint = require("../../src/goo/addons/physicspack/joints/BallJoint");

	var world, system, rigidBodyComponent, colliderComponent, entity;

	beforeEach(function () {
		world = new World();
		system = new PhysicsSystem({
			maxSubSteps: 1
		});
		system.setGravity(new Vector3());
		world.setSystem(system);

		rigidBodyComponent = new RigidBodyComponent({ mass: 1 });
		colliderComponent = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 })
		});
		entity = world.createEntity(rigidBodyComponent, colliderComponent).addToWorld();
		rigidBodyComponent.initialize();
		world.process();
	});

	it('can set linearDamping', function () {
		rigidBodyComponent.linearDamping = 123;
		expect(rigidBodyComponent.cannonBody.linearDamping).toEqual(123);
	});

	it('can set angularDamping', function () {
		rigidBodyComponent.angularDamping = 123;
		expect(rigidBodyComponent.cannonBody.angularDamping).toEqual(123);
	});

	it('can set constraints', function () {
		rigidBodyComponent.constraints = RigidBodyComponent.FREEZE_NONE;
		expect(rigidBodyComponent.cannonBody.linearFactor).toEqual(new CANNON.Vec3(1, 1, 1));

		rigidBodyComponent.constraints = RigidBodyComponent.FREEZE_POSITION_X;
		expect(rigidBodyComponent.cannonBody.linearFactor).toEqual(new CANNON.Vec3(0, 1, 1));

		rigidBodyComponent.constraints = RigidBodyComponent.FREEZE_POSITION_Y;
		expect(rigidBodyComponent.cannonBody.linearFactor).toEqual(new CANNON.Vec3(1, 0, 1));

		rigidBodyComponent.constraints = RigidBodyComponent.FREEZE_POSITION_Z;
		expect(rigidBodyComponent.cannonBody.linearFactor).toEqual(new CANNON.Vec3(1, 1, 0));

		rigidBodyComponent.constraints = RigidBodyComponent.FREEZE_ROTATION_X;
		expect(rigidBodyComponent.cannonBody.angularFactor).toEqual(new CANNON.Vec3(0, 1, 1));

		rigidBodyComponent.constraints = RigidBodyComponent.FREEZE_ROTATION_Y;
		expect(rigidBodyComponent.cannonBody.angularFactor).toEqual(new CANNON.Vec3(1, 0, 1));

		rigidBodyComponent.constraints = RigidBodyComponent.FREEZE_ROTATION_Z;
		expect(rigidBodyComponent.cannonBody.angularFactor).toEqual(new CANNON.Vec3(1, 1, 0));

		rigidBodyComponent.constraints = RigidBodyComponent.FREEZE_POSITION;
		expect(rigidBodyComponent.cannonBody.linearFactor).toEqual(new CANNON.Vec3(0, 0, 0));

		rigidBodyComponent.constraints = RigidBodyComponent.FREEZE_ROTATION;
		expect(rigidBodyComponent.cannonBody.angularFactor).toEqual(new CANNON.Vec3(0, 0, 0));

		rigidBodyComponent.constraints = RigidBodyComponent.FREEZE_ALL;
		expect(rigidBodyComponent.cannonBody.linearFactor).toEqual(new CANNON.Vec3(0, 0, 0));
		expect(rigidBodyComponent.cannonBody.angularFactor).toEqual(new CANNON.Vec3(0, 0, 0));

	});

	it('can set transform from entity', function () {
		entity.setTranslation(1, 2, 3);
		entity.transformComponent.updateWorldTransform();
		rigidBodyComponent.setTransformFromEntity(entity);
		var position = new Vector3();
		rigidBodyComponent.getPosition(position);
		expect(rigidBodyComponent.cannonBody.position).toEqual(new CANNON.Vec3(1, 2, 3));
	});

	it('can applyForce', function () {
		rigidBodyComponent.cannonBody.position.set(1, 2, 3);
		rigidBodyComponent.applyForce(new Vector3(1, 2, 3));
		expect(rigidBodyComponent.cannonBody.force).toEqual(new CANNON.Vec3(1, 2, 3));
		expect(rigidBodyComponent.cannonBody.torque).toEqual(new CANNON.Vec3(0, 0, 0));
	});

	it('can applyForceWorld', function () {
		rigidBodyComponent.setPosition(new Vector3(1, 2, 3));
		rigidBodyComponent.setQuaternion(new Quaternion().fromAngleAxis(Math.PI / 4, new Vector3(1,0,0))); // Should not affect at all
		var worldForce = new Vector3(0, 1, 0);
		var worldPosition = new Vector3(2, 2, 3); // (1,0,0) relative to the body
		rigidBodyComponent.applyForceWorld(worldForce, worldPosition);
		expect(rigidBodyComponent.cannonBody.force).toEqual(new CANNON.Vec3(0, 1, 0));
		expect(rigidBodyComponent.cannonBody.torque).toEqual(new CANNON.Vec3(0, 0, 1)); // (1,0,0) x (0,1,0) is (0,0,1)
	});

	it('can applyForceLocal', function () {
		rigidBodyComponent.setPosition(new Vector3(1, 2, 3));
		var localForce = new Vector3(0, 1, 0);
		var localPosition = new Vector3(1, 0, 0);
		rigidBodyComponent.applyForceLocal(localForce, localPosition);
		expect(rigidBodyComponent.cannonBody.force).toEqual(new CANNON.Vec3(0, 1, 0));
		expect(rigidBodyComponent.cannonBody.torque).toEqual(new CANNON.Vec3(0, 0, 1)); // (1,0,0) x (0,1,0) is (0,0,1)
	});

	it('can set velocity', function () {
		rigidBodyComponent.setVelocity(new Vector3(1, 2, 3));
		expect(rigidBodyComponent.cannonBody.velocity).toEqual(new CANNON.Vec3(1, 2, 3));
	});

	it('can get velocity', function () {
		rigidBodyComponent.cannonBody.velocity.set(1, 2, 3);
		var velocity = new Vector3();
		rigidBodyComponent.getVelocity(velocity);
		expect(velocity).toEqual(new Vector3(1, 2, 3));
	});

	it('can set position', function () {
		rigidBodyComponent.setPosition(new Vector3(1, 2, 3));
		expect(rigidBodyComponent.cannonBody.position).toEqual(new CANNON.Vec3(1, 2, 3));
	});

	it('can set position', function () {
		rigidBodyComponent.setPosition(new Vector3(1, 2, 3));
		expect(rigidBodyComponent.cannonBody.position).toEqual(new CANNON.Vec3(1, 2, 3));
	});

	it('can set quaternion', function () {
		rigidBodyComponent.setQuaternion(new Quaternion(1, 2, 3, 4));
		expect(rigidBodyComponent.cannonBody.quaternion).toEqual(new CANNON.Quaternion(1, 2, 3, 4));
	});

	it('can get quaternion', function () {
		rigidBodyComponent.cannonBody.quaternion.set(1, 2, 3, 4);
		var quat = new Quaternion();
		rigidBodyComponent.getQuaternion(quat);
		expect(quat).toEqual(new Quaternion(1, 2, 3, 4));
	});

	it('can set kinematic', function () {
		rigidBodyComponent.isKinematic = true;
		world.process();
		expect(rigidBodyComponent.cannonBody.type).toEqual(CANNON.Body.KINEMATIC);
	});

	it('can destroy itself and rebuild', function () {
		rigidBodyComponent.destroy();
		expect(rigidBodyComponent.cannonBody).toBeFalsy();
		rigidBodyComponent.initialize();
		expect(rigidBodyComponent.cannonBody).toBeTruthy();
	});

	it('can add and remove a BallJoint', function () {
		var joint = new BallJoint({
			connectedEntity: entity // Self, just for testing!
		});

		rigidBodyComponent.addJoint(joint);
		rigidBodyComponent.initializeJoint(joint);
		expect(joint.cannonJoint).toBeTruthy();

		rigidBodyComponent.removeJoint(joint);
		rigidBodyComponent.destroyJoint(joint);

		expect(joint.cannonJoint).toBeFalsy();
	});

	it('emits initialized', function () {

		rigidBodyComponent = new RigidBodyComponent({ mass: 1 });
		colliderComponent = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 })
		});
		entity = world.createEntity(rigidBodyComponent, colliderComponent).addToWorld();

		var numEvents = 0;
		var listener = function (evt) {
			numEvents++;
			expect(evt.entity).toBe(entity);
		};
		SystemBus.addListener('goo.physics.initialized', listener);

		rigidBodyComponent.initialize();

		SystemBus.removeListener('goo.physics.initialized', listener);

		expect(numEvents).toBe(1);
		expect(rigidBodyComponent.cannonBody).toBeTruthy();
	});

	it('can clone', function () {
		rigidBodyComponent.angularDamping = 0.5;
		rigidBodyComponent.isKinematic = false;
		rigidBodyComponent.linearDamping = 0.5;
		rigidBodyComponent.mass = 2;
		rigidBodyComponent.restitution = 0.5;
		rigidBodyComponent.setAngularVelocity(new Vector3(4, 5, 6));
		rigidBodyComponent.setVelocity(new Vector3(1, 2, 3));
		rigidBodyComponent.sleepingThreshold = 0.5;
		rigidBodyComponent.sleepingTimeLimit = 3;

		var rigidBodyComponent2 = rigidBodyComponent.clone();

		expect(rigidBodyComponent2.angularDamping).toEqual(0.5);
		expect(rigidBodyComponent2.isKinematic).toEqual(false);
		expect(rigidBodyComponent2.linearDamping).toEqual(0.5);
		expect(rigidBodyComponent2.mass).toEqual(2);
		expect(rigidBodyComponent2.sleepingThreshold).toEqual(0.5);
		expect(rigidBodyComponent2.sleepingTimeLimit).toEqual(3);

		var angularVelocity = new Vector3();
		rigidBodyComponent2.getAngularVelocity(angularVelocity);
		expect(angularVelocity).toEqual(new Vector3(4, 5, 6));

		var velocity = new Vector3();
		rigidBodyComponent2.getVelocity(velocity);
		expect(velocity).toEqual(new Vector3(1, 2, 3));
	});

	it('can set sleeping parameters', function () {
		rigidBodyComponent.sleepingThreshold = 4;
		rigidBodyComponent.sleepingTimeLimit = 6;
		expect(rigidBodyComponent.cannonBody.sleepSpeedLimit).toEqual(4);
		expect(rigidBodyComponent.cannonBody.sleepTimeLimit).toEqual(6);
	});

	it('can set materials per collider', function () {
		var rigidBodyComponent = new RigidBodyComponent({ mass: 1 });
		var colliderComponent = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 }),
			material: new PhysicsMaterial({ friction: 0.7, restitution: 0.8 })
		});
		var entity = world.createEntity(rigidBodyComponent, colliderComponent).addToWorld();

		var colliderComponent2 = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 }),
			material: new PhysicsMaterial({ friction: 0.9, restitution: 1.0 })
		});
		var subEntity = world.createEntity(colliderComponent2).addToWorld();

		entity.attachChild(subEntity);

		rigidBodyComponent.initialize();

		expect(entity.rigidBodyComponent.cannonBody.shapes[0].material.friction).toBe(0.7);
		expect(entity.rigidBodyComponent.cannonBody.shapes[1].material.friction).toBe(0.9);

		entity.removeFromWorld();
		subEntity.removeFromWorld();
	});
});


var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var Vector3 = require("../../src/goo/math/Vector3");
var World = require("../../src/goo/entities/World");
var BoxCollider = require("../../src/goo/addons/physicspack/colliders/BoxCollider");
var PlaneCollider = require("../../src/goo/addons/physicspack/colliders/PlaneCollider");
var CylinderCollider = require("../../src/goo/addons/physicspack/colliders/CylinderCollider");
var SphereCollider = require("../../src/goo/addons/physicspack/colliders/SphereCollider");
var ColliderComponent = require("../../src/goo/addons/physicspack/components/ColliderComponent");
var Configs = require("./loaders/Configs");

require("../../src/goo/addons/physicspack/handlers/ColliderComponentHandler");

describe('ColliderComponentHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads an entity with collider component', function (done) {
		var config = Configs.entity(['collider']);

		config.components.collider.isTrigger = true;
		config.components.collider.friction = 0.5;
		config.components.collider.restitution = 0.6;

		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			expect(entity.colliderComponent).toEqual(jasmine.any(ColliderComponent));
			expect(entity.colliderComponent.isTrigger).toBe(true);
			expect(entity.colliderComponent.material.friction).toBe(0.5);
			expect(entity.colliderComponent.material.restitution).toBe(0.6);
			done();
		});
	});

	it('loads an entity with with a BoxCollider', function (done) {
		var config = Configs.entity();
		config.components.collider = Configs.component.collider('Box');
		config.components.collider.shapeOptions.halfExtents = [1, 2, 3];
		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			expect(entity.colliderComponent).toEqual(jasmine.any(ColliderComponent));
			expect(entity.colliderComponent.collider).toEqual(jasmine.any(BoxCollider));
			expect(entity.colliderComponent.collider.halfExtents).toEqual(new Vector3(1, 2, 3));
			done();
		});
	});

	it('loads an entity with with a PlaneCollider', function (done) {
		var config = Configs.entity();
		config.components.collider = Configs.component.collider('Plane');
		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			expect(entity.colliderComponent).toEqual(jasmine.any(ColliderComponent));
			expect(entity.colliderComponent.collider).toEqual(jasmine.any(PlaneCollider));
			done();
		});
	});

	it('loads an entity with with a CylinderCollider', function (done) {
		var config = Configs.entity();
		config.components.collider = Configs.component.collider('Cylinder');
		config.components.collider.shapeOptions.height = 2;
		config.components.collider.shapeOptions.radius = 3;
		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			expect(entity.colliderComponent).toEqual(jasmine.any(ColliderComponent));
			expect(entity.colliderComponent.collider).toEqual(jasmine.any(CylinderCollider));
			expect(entity.colliderComponent.collider.height).toEqual(2);
			expect(entity.colliderComponent.collider.radius).toEqual(3);
			done();
		});
	});

	it('manages to update between collider types', function (done) {
		var component;
		var config = Configs.entity();
		var sphereConfig = Configs.component.collider('Sphere');
		var boxConfig = Configs.component.collider('Box');
		config.components.collider = sphereConfig;
		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			component = entity.colliderComponent;
			expect(component.collider).toEqual(jasmine.any(SphereCollider));
			expect(component.worldCollider).toEqual(jasmine.any(SphereCollider));
			config.components.collider = boxConfig;
			return loader.update(config.id, config);
		}).then(function (entity) {
			expect(entity.colliderComponent).toBe(component);
			expect(entity.colliderComponent.collider).toEqual(jasmine.any(BoxCollider));
			expect(entity.colliderComponent.worldCollider).toEqual(jasmine.any(BoxCollider));
			done();
		});
	});
});


var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var Vector3 = require("../../src/goo/math/Vector3");
var World = require("../../src/goo/entities/World");
var RigidBodyComponent = require("../../src/goo/addons/physicspack/components/RigidBodyComponent");
var Configs = require("./loaders/Configs");

require("../../src/goo/addons/physicspack/handlers/RigidBodyComponentHandler");

describe('RigidBodyComponentHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads an entity with rigidBody component', function (done) {
		var config = Configs.entity(['rigidBody']);

		config.components.rigidBody.mass = 3;
		config.components.rigidBody.velocity = [1, 2, 3];
		config.components.rigidBody.angularVelocity = [4, 5, 6];

		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			expect(entity.rigidBodyComponent).toEqual(jasmine.any(RigidBodyComponent));

			var velocity = new Vector3();
			entity.rigidBodyComponent.getVelocity(velocity);
			expect(velocity).toEqual(new Vector3(1, 2, 3));

			var angularVelocity = new Vector3();
			entity.rigidBodyComponent.getAngularVelocity(angularVelocity);
			expect(angularVelocity).toEqual(new Vector3(4, 5, 6));

			expect(entity.rigidBodyComponent.mass).toBe(3);

			done();
		});
	});
});


describe('PhysicsDebugRenderSystem', function () {

	var BoxCollider = require("../../src/goo/addons/physicspack/colliders/BoxCollider");
	var SphereCollider = require("../../src/goo/addons/physicspack/colliders/SphereCollider");
	var CylinderCollider = require("../../src/goo/addons/physicspack/colliders/CylinderCollider");
	var PlaneCollider = require("../../src/goo/addons/physicspack/colliders/PlaneCollider");
	var MeshCollider = require("../../src/goo/addons/physicspack/colliders/MeshCollider");
	var PhysicsDebugRenderSystem = require("../../src/goo/addons/physicspack/systems/PhysicsDebugRenderSystem");
	var ColliderSystem = require("../../src/goo/addons/physicspack/systems/ColliderSystem");
	var PhysicsSystem = require("../../src/goo/addons/physicspack/systems/PhysicsSystem");
	var Sphere = require("../../src/goo/shapes/Sphere");
	var World = require("../../src/goo/entities/World");
	var MeshData = require("../../src/goo/renderer/MeshData");

	var world, system;

	beforeEach(function () {
		world = new World();
		system = new PhysicsDebugRenderSystem();
		world.setSystem(system);
		world.setSystem(new ColliderSystem());
		world.setSystem(new PhysicsSystem());
	});

	afterEach(function () {
		world.clearSystem('PhysicsSystem');
	});

	it('can clear', function () {
		system.renderList.push(system.renderablePool._create());
		system.clear();
		expect(system.renderablePool._objects.length).toBe(1);
		expect(system.renderList.length).toBe(0);
	});

	it('can cleanup', function () {
		system.renderList.push(system.renderablePool._create());
		system.cleanup();
		expect(system.renderablePool._objects.length).toBe(1);
		expect(system.renderList.length).toBe(0);
	});

	it('can get mesh data from collider', function () {
		var boxCollider = new BoxCollider();
		var sphereCollider = new SphereCollider();
		var cylinderCollider = new CylinderCollider();
		var planeCollider = new PlaneCollider();
		var meshCollider = new MeshCollider({ meshData: new Sphere() });

		expect(system.getMeshData(boxCollider)).toEqual(jasmine.any(MeshData));
		expect(system.getMeshData(sphereCollider)).toEqual(jasmine.any(MeshData));
		expect(system.getMeshData(cylinderCollider)).toEqual(jasmine.any(MeshData));
		expect(system.getMeshData(planeCollider)).toEqual(jasmine.any(MeshData));
		expect(system.getMeshData(meshCollider)).toEqual(jasmine.any(MeshData));
	});
});


var RigidBodyComponent = require("../../src/goo/addons/physicspack/components/RigidBodyComponent");
var ColliderComponent = require("../../src/goo/addons/physicspack/components/ColliderComponent");
var RaycastResult = require("../../src/goo/addons/physicspack/RaycastResult");
var SphereCollider = require("../../src/goo/addons/physicspack/colliders/SphereCollider");
var PhysicsSystem = require("../../src/goo/addons/physicspack/systems/PhysicsSystem");
var Vector3 = require("../../src/goo/math/Vector3");
var World = require("../../src/goo/entities/World");
var SystemBus = require("../../src/goo/entities/SystemBus");
var CustomMatchers = require("./CustomMatchers");

describe('PhysicsSystem', function () {
	var world, system;

	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
		world = new World();
		system = new PhysicsSystem({
			maxSubSteps: 1
		});
		system.setGravity(new Vector3());
		world.setSystem(system);
	});

	afterEach(function () {
		world.clearSystem('PhysicsSystem');
	});

	it('can raycast closest', function () {
		var start = new Vector3(0, 0, -10);
		var direction = new Vector3(0, 0, 1);
		var distance = 20;

		var rbcA = new RigidBodyComponent({ mass: 1 });
		var rbcB = new RigidBodyComponent({ mass: 1 });
		var ccA = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 })
		});
		var ccB = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 })
		});
		var entityA = world.createEntity(rbcA, ccA).addToWorld();
		var entityB = world.createEntity(rbcB, ccB).addToWorld();
		entityA.setTranslation(0, 0, 3);
		entityB.setTranslation(0, 0, -3);

		rbcA.initialize(); // Needed to initialize bodies
		rbcB.initialize();

		var result = new RaycastResult();
		system.raycastClosest(start, direction, distance, {}, result);
		expect(result.normal).toBeCloseToVector(new Vector3(0, 0, -1));
		expect(result.entity).toBe(entityB);
		expect(result.distance).toBeCloseTo(6);

		// Now swap so that entityA is closer
		start.setDirect(0, 0, 10);
		direction.setDirect(0, 0, -1);

		result = new RaycastResult();
		system.raycastClosest(start, direction, distance, {}, result);
		expect(result.entity).toBe(entityA);
		expect(result.normal).toBeCloseToVector(new Vector3(0, 0, 1));
		expect(result.distance).toBeCloseTo(6);
	});

	it('can raycast any', function () {
		var start = new Vector3(0, 0, -10);
		var direction = new Vector3(0, 0, 1);
		var distance = 20;

		var rbcA = new RigidBodyComponent({ mass: 1 });
		var rbcB = new RigidBodyComponent({ mass: 1 });
		var ccA = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 })
		});
		var ccB = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 })
		});
		var entityA = world.createEntity(rbcA, ccA).addToWorld();
		var entityB = world.createEntity(rbcB, ccB).addToWorld();
		entityA.setTranslation(0, 0, 3);
		entityB.setTranslation(0, 0, -3);

		rbcA.initialize(); // Needed to initialize bodies
		rbcB.initialize();

		var result = new RaycastResult();
		system.raycastAny(start, direction, distance, {}, result);
		expect(result.entity).toBeTruthy();
		expect(result.normal).toBeCloseToVector(new Vector3(0, 0, -1));
	});

	it('can raycast all', function () {
		var start = new Vector3(0, 0, -10);
		var direction = new Vector3(0, 0, 1);
		var distance = 20;

		var rbcA = new RigidBodyComponent({ mass: 1 });
		var rbcB = new RigidBodyComponent({ mass: 1 });
		var ccA = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 })
		});
		var ccB = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 })
		});
		var entityA = world.createEntity(rbcA, ccA).addToWorld();
		var entityB = world.createEntity(rbcB, ccB).addToWorld();
		entityA.setTranslation(0, 0, 3);
		entityB.setTranslation(0, 0, -3);

		rbcA.initialize(); // Needed to initialize bodies
		rbcB.initialize();

		var numHits = 0;
		system.raycastAll(start, direction, distance, { skipBackfaces: false }, function (/*result*/) {
			numHits++;
		});
		expect(numHits).toBe(4);

		numHits = 0;
		system.raycastAll(start, direction, distance, {}, function (/*result*/) {
			numHits++;
			return false; // Abort traversal
		});
		expect(numHits).toBe(1);
	});

	it('can use collision groups', function () {
		var start = new Vector3(0, 0, -10);
		var direction = new Vector3(0, 0, 1);
		var distance = 20;

		var rbc = new RigidBodyComponent({ mass: 1 });
		var cc = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 })
		});
		var entity = world.createEntity(rbc, cc).addToWorld();
		entity.setTranslation(0, 0, 3);

		rbc.initialize(); // Needed to initialize body

		var result = new RaycastResult();
		system.raycastAny(start, direction, distance, { collisionGroup: -1 }, result);
		expect(result.entity).toBeTruthy();

		result = new RaycastResult();
		system.raycastAny(start, direction, distance, { collisionGroup: 2 }, result);
		expect(result.entity).toBeFalsy();
	});

	it('can filter away backfaces', function () {
		var start = new Vector3(0, 0, -10);
		var direction = new Vector3(0, 0, 1);
		var distance = 20;

		var rbc = new RigidBodyComponent({ mass: 1 });
		var cc = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 })
		});
		world.createEntity(rbc, cc).addToWorld();

		rbc.initialize(); // Needed to initialize body

		var numHits = 0;
		system.raycastAll(start, direction, distance, { skipBackfaces: true }, function (result) {
			expect(result.normal).toBeCloseToVector(new Vector3(0, 0, -1));
			numHits++;
		});
		expect(numHits).toBe(1);

		numHits = 0;
		system.raycastAll(start, direction, distance, { skipBackfaces: false }, function () {
			numHits++;
		});
		expect(numHits).toBe(2);
	});

	it('can raycast with optional parameters', function () {
		var start = new Vector3(0, 0, -10);
		var direction = new Vector3(0, 0, 1);
		var distance = 20;
		var options = {};
		var result = new RaycastResult();

		expect(system.raycastAll(start, direction, distance, options, function () {})).toBe(false);
		expect(system.raycastAll(start, direction, distance, function () {})).toBe(false);

		expect(system.raycastAny(start, direction, distance, options, result)).toBe(false);
		expect(system.raycastAny(start, direction, distance, result)).toBe(false);
		expect(system.raycastAny(start, direction, distance)).toBe(false);

		expect(system.raycastClosest(start, direction, distance, options, result)).toBe(false);
		expect(system.raycastClosest(start, direction, distance, result)).toBe(false);
		expect(system.raycastClosest(start, direction, distance)).toBe(false);
	});

	it('emits contact events', function () {
		function sortEntitiesByName(a, b) {
			if (a.name === b.name) {
				return 0;
			}
			return a.name > b.name ? 1 : -1;
		}

		var rbcA = new RigidBodyComponent({ mass: 1 });
		var rbcB = new RigidBodyComponent({ mass: 1 });
		var ccA = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 })
		});
		var ccB = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 })
		});
		var entityA = world.createEntity(rbcA, ccA).addToWorld();
		var entityB = world.createEntity(rbcB, ccB).addToWorld();
		var entities = [entityA, entityB].sort(sortEntitiesByName);
		entityA.setTranslation(0, 0, 3);
		entityB.setTranslation(0, 0, -3);

		var numBeginContact = 0;
		var numDuringContact = 0;
		var numEndContact = 0;

		var listeners = {
			'goo.physics.beginContact': function (evt) {
				expect([evt.entityA, evt.entityB].sort(sortEntitiesByName)).toEqual(entities);
				numBeginContact++;
			},
			'goo.physics.duringContact': function (evt) {
				expect([evt.entityA, evt.entityB].sort(sortEntitiesByName)).toEqual(entities);
				numDuringContact++;
			},
			'goo.physics.endContact': function (evt) {
				expect([evt.entityA, evt.entityB].sort(sortEntitiesByName)).toEqual(entities);
				numEndContact++;
			}
		};
		for (var key in listeners) {
			SystemBus.addListener(key, listeners[key]);
		}

		rbcA.initialize(); // Needed to initialize bodies
		rbcB.initialize();

		world.fixedUpdate();

		expect(numBeginContact).toEqual(0);
		expect(numDuringContact).toEqual(0);
		expect(numEndContact).toEqual(0);

		rbcA.setPosition(new Vector3(0, 0, 0.1));
		rbcB.setPosition(new Vector3(0, 0, -0.1));

		world.fixedUpdate();

		expect(numBeginContact).toEqual(1);
		expect(numDuringContact).toEqual(1);
		expect(numEndContact).toEqual(0);

		world.fixedUpdate();

		expect(numBeginContact).toEqual(1);
		expect(numDuringContact).toEqual(2);
		expect(numEndContact).toEqual(0);

		rbcA.setPosition(new Vector3(0, 0, 3));
		rbcB.setPosition(new Vector3(0, 0, -3));

		world.fixedUpdate();

		expect(numBeginContact).toEqual(1);
		expect(numDuringContact).toEqual(2);
		expect(numEndContact).toEqual(1);

		for (var key in listeners) {
			SystemBus.removeListener(key, listeners[key]);
		}
	});

	describe('trigger and contact events', function () {
		var numTriggerEnter = 0;
		var numTriggerStay = 0;
		var numTriggerExit = 0;
		var numBeginContact = 0;
		var numDuringContact = 0;
		var numEndContact = 0;

		var listeners = {
			'goo.physics.triggerEnter': function () {
				numTriggerEnter++;
			},
			'goo.physics.triggerStay': function () {
				numTriggerStay++;
			},
			'goo.physics.triggerExit': function () {
				numTriggerExit++;
			},
			'goo.physics.beginContact': function () {
				numBeginContact++;
			},
			'goo.physics.duringContact': function () {
				numDuringContact++;
			},
			'goo.physics.endContact': function () {
				numEndContact++;
			}
		};

		beforeEach(function () {
			numTriggerEnter = 0;
			numTriggerStay = 0;
			numTriggerExit = 0;
			numBeginContact = 0;
			numDuringContact = 0;
			numEndContact = 0;

			for (var key in listeners) {
				SystemBus.addListener(key, listeners[key]);
			}
		});

		afterEach(function () {
			for (var key in listeners) {
				SystemBus.removeListener(key, listeners[key]);
			}
		});

		function createStaticCollider(x) {
			var ccA = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			world.createEntity(ccA, [x || 0, 0, 0]).addToWorld();
			ccA.initialize();
		}

		function createStaticTriggerCollider(x) {
			var ccA = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 }),
				isTrigger: true
			});
			world.createEntity(ccA, [x || 0, 0, 0]).addToWorld();
			ccA.initialize();
		}

		function createRigidBodyTriggerCollider() {
			var rbcA = new RigidBodyComponent({ mass: 1 });
			var ccA = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 }),
				isTrigger: true
			});
			world.createEntity(rbcA, ccA).addToWorld();
			rbcA.initialize();
		}

		function createRigidBodyCollider(x) {
			var rbcA = new RigidBodyComponent({ mass: 1 });
			var ccA = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			world.createEntity(rbcA, ccA, [x || 0, 0, 0]).addToWorld();
			rbcA.initialize();
		}

		function createKinematicRigidBodyCollider() {
			var rbcA = new RigidBodyComponent({ mass: 1, isKinematic: true });
			var ccA = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 })
			});
			world.createEntity(rbcA, ccA).addToWorld();
			rbcA.initialize();
		}

		function createKinematicRigidBodyTriggerCollider() {
			var rbcA = new RigidBodyComponent({ mass: 1, isKinematic: true });
			var ccA = new ColliderComponent({
				collider: new SphereCollider({ radius: 1 }),
				isTrigger: true
			});
			world.createEntity(rbcA, ccA).addToWorld();
			rbcA.initialize();
		}

		describe('Static Collider vs...', function () {
			it('Static Collider', function () {
				createStaticCollider();
				createStaticCollider();

				world.fixedUpdate();

				expect(numTriggerEnter).toEqual(0);
				expect(numTriggerStay).toEqual(0);
				expect(numTriggerExit).toEqual(0);
				expect(numBeginContact).toEqual(0);
				expect(numDuringContact).toEqual(0);
				expect(numEndContact).toEqual(0);
			});

			it('Rigid Body Collider', function () {
				createStaticCollider(0);
				createRigidBodyCollider(0.1);

				world.fixedUpdate();

				expect(numTriggerEnter).toEqual(0);
				expect(numTriggerStay).toEqual(0);
				expect(numTriggerExit).toEqual(0);
				expect(numBeginContact).toEqual(1);
				expect(numDuringContact).toEqual(1);
				expect(numEndContact).toEqual(0);
			});

			it('Kinematic Rigid Body Collider', function () {
				createStaticCollider();
				createKinematicRigidBodyCollider();

				world.fixedUpdate();

				expect(numTriggerEnter).toEqual(0);
				expect(numTriggerStay).toEqual(0);
				expect(numTriggerExit).toEqual(0);
				expect(numBeginContact).toEqual(0);
				expect(numDuringContact).toEqual(0);
				expect(numEndContact).toEqual(0);
			});

			it('Static Trigger Collider', function () {
				createStaticCollider();
				createStaticTriggerCollider();

				world.fixedUpdate();

				expect(numTriggerEnter).toEqual(0);
				expect(numTriggerStay).toEqual(0);
				expect(numTriggerExit).toEqual(0);
				expect(numBeginContact).toEqual(0);
				expect(numDuringContact).toEqual(0);
				expect(numEndContact).toEqual(0);
			});

			it('Rigidbody Trigger Collider', function () {
				createStaticCollider();
				createRigidBodyTriggerCollider();

				world.fixedUpdate();

				expect(numTriggerEnter).toEqual(1);
				expect(numTriggerStay).toEqual(1);
				expect(numTriggerExit).toEqual(0);
				expect(numBeginContact).toEqual(0);
				expect(numDuringContact).toEqual(0);
				expect(numEndContact).toEqual(0);
			});

			it('Rigidbody Trigger Collider', function () {
				createStaticCollider();
				createKinematicRigidBodyTriggerCollider();

				world.fixedUpdate();

				expect(numTriggerEnter).toEqual(1);
				expect(numTriggerStay).toEqual(1);
				expect(numTriggerExit).toEqual(0);
				expect(numBeginContact).toEqual(0);
				expect(numDuringContact).toEqual(0);
				expect(numEndContact).toEqual(0);
			});
		});

		describe('Rigid Body Collider vs...', function () {
			it('Rigid Body Collider', function () {
				createRigidBodyCollider();
				createRigidBodyCollider();

				world.fixedUpdate();

				expect(numTriggerEnter).toEqual(0);
				expect(numTriggerStay).toEqual(0);
				expect(numTriggerExit).toEqual(0);
				expect(numBeginContact).toEqual(1);
				expect(numDuringContact).toEqual(1);
				expect(numEndContact).toEqual(0);
			});

			it('Kinematic Rigid Body Collider', function () {
				createRigidBodyCollider();
				createKinematicRigidBodyCollider();

				world.fixedUpdate();

				expect(numTriggerEnter).toEqual(0);
				expect(numTriggerStay).toEqual(0);
				expect(numTriggerExit).toEqual(0);
				expect(numBeginContact).toEqual(1);
				expect(numDuringContact).toEqual(1);
				expect(numEndContact).toEqual(0);
			});

			it('Static Trigger Collider', function () {
				createRigidBodyCollider();
				createStaticTriggerCollider();

				world.fixedUpdate();

				expect(numTriggerEnter).toEqual(1);
				expect(numTriggerStay).toEqual(1);
				expect(numTriggerExit).toEqual(0);
				expect(numBeginContact).toEqual(0);
				expect(numDuringContact).toEqual(0);
				expect(numEndContact).toEqual(0);
			});

			it('Rigid Body Trigger Collider', function () {
				createRigidBodyCollider();
				createRigidBodyTriggerCollider();

				world.fixedUpdate();

				expect(numTriggerEnter).toEqual(1);
				expect(numTriggerStay).toEqual(1);
				expect(numTriggerExit).toEqual(0);
				expect(numBeginContact).toEqual(0);
				expect(numDuringContact).toEqual(0);
				expect(numEndContact).toEqual(0);
			});

			it('Kinematic Rigid Body Trigger Collider', function () {
				createRigidBodyCollider();
				createKinematicRigidBodyTriggerCollider();

				world.fixedUpdate();

				expect(numTriggerEnter).toEqual(1);
				expect(numTriggerStay).toEqual(1);
				expect(numTriggerExit).toEqual(0);
				expect(numBeginContact).toEqual(0);
				expect(numDuringContact).toEqual(0);
				expect(numEndContact).toEqual(0);
			});
		});


		describe('Kinematic Rigid Body Collider vs...', function () {

			it('Kinematic Rigid Body Collider', function () {
				createKinematicRigidBodyCollider();
				createKinematicRigidBodyCollider();

				world.fixedUpdate();

				expect(numTriggerEnter).toEqual(0);
				expect(numTriggerStay).toEqual(0);
				expect(numTriggerExit).toEqual(0);
				expect(numBeginContact).toEqual(0);
				expect(numDuringContact).toEqual(0);
				expect(numEndContact).toEqual(0);
			});

			it('Static Trigger Collider', function () {
				createKinematicRigidBodyCollider();
				createStaticTriggerCollider();

				world.fixedUpdate();

				expect(numTriggerEnter).toEqual(1);
				expect(numTriggerStay).toEqual(1);
				expect(numTriggerExit).toEqual(0);
				expect(numBeginContact).toEqual(0);
				expect(numDuringContact).toEqual(0);
				expect(numEndContact).toEqual(0);
			});

			it('Rigid Body Trigger Collider', function () {
				createKinematicRigidBodyCollider();
				createRigidBodyTriggerCollider();

				world.fixedUpdate();

				expect(numTriggerEnter).toEqual(1);
				expect(numTriggerStay).toEqual(1);
				expect(numTriggerExit).toEqual(0);
				expect(numBeginContact).toEqual(0);
				expect(numDuringContact).toEqual(0);
				expect(numEndContact).toEqual(0);
			});

			it('Kinematic Rigid Body Trigger Collider', function () {
				createKinematicRigidBodyCollider();
				createKinematicRigidBodyTriggerCollider();

				world.fixedUpdate();

				expect(numTriggerEnter).toEqual(1);
				expect(numTriggerStay).toEqual(1);
				expect(numTriggerExit).toEqual(0);
				expect(numBeginContact).toEqual(0);
				expect(numDuringContact).toEqual(0);
				expect(numEndContact).toEqual(0);
			});
		});

		describe('Static Trigger Collider vs...', function () {

			it('Static Trigger Collider', function () {
				createStaticTriggerCollider();
				createStaticTriggerCollider();

				world.fixedUpdate();

				expect(numTriggerEnter).toEqual(0);
				expect(numTriggerStay).toEqual(0);
				expect(numTriggerExit).toEqual(0);
				expect(numBeginContact).toEqual(0);
				expect(numDuringContact).toEqual(0);
				expect(numEndContact).toEqual(0);
			});

			it('Rigid Body Trigger Collider', function () {
				createStaticTriggerCollider();
				createRigidBodyTriggerCollider();

				world.fixedUpdate();

				expect(numTriggerEnter).toEqual(1);
				expect(numTriggerStay).toEqual(1);
				expect(numTriggerExit).toEqual(0);
				expect(numBeginContact).toEqual(0);
				expect(numDuringContact).toEqual(0);
				expect(numEndContact).toEqual(0);
			});

			it('Kinematic Rigid Body Trigger Collider', function () {
				createStaticTriggerCollider();
				createKinematicRigidBodyTriggerCollider();

				world.fixedUpdate();

				expect(numTriggerEnter).toEqual(1);
				expect(numTriggerStay).toEqual(1);
				expect(numTriggerExit).toEqual(0);
				expect(numBeginContact).toEqual(0);
				expect(numDuringContact).toEqual(0);
				expect(numEndContact).toEqual(0);
			});
		});

		describe('Rigid Body Trigger Collider vs...', function () {

			it('Rigid Body Trigger Collider', function () {
				createRigidBodyTriggerCollider();
				createRigidBodyTriggerCollider();

				world.fixedUpdate();

				expect(numTriggerEnter).toEqual(1);
				expect(numTriggerStay).toEqual(1);
				expect(numTriggerExit).toEqual(0);
				expect(numBeginContact).toEqual(0);
				expect(numDuringContact).toEqual(0);
				expect(numEndContact).toEqual(0);
			});

			it('Kinematic Rigid Body Trigger Collider', function () {
				createRigidBodyTriggerCollider();
				createKinematicRigidBodyTriggerCollider();

				world.fixedUpdate();

				expect(numTriggerEnter).toEqual(1);
				expect(numTriggerStay).toEqual(1);
				expect(numTriggerExit).toEqual(0);
				expect(numBeginContact).toEqual(0);
				expect(numDuringContact).toEqual(0);
				expect(numEndContact).toEqual(0);
			});
		});

		describe('Kinematic Rigid Body Trigger Collider vs...', function () {

			it('Kinematic Rigid Body Trigger Collider', function () {
				createKinematicRigidBodyTriggerCollider();
				createKinematicRigidBodyTriggerCollider();

				world.fixedUpdate();

				expect(numTriggerEnter).toEqual(1);
				expect(numTriggerStay).toEqual(1);
				expect(numTriggerExit).toEqual(0);
				expect(numBeginContact).toEqual(0);
				expect(numDuringContact).toEqual(0);
				expect(numEndContact).toEqual(0);
			});
		});
	});

	it('emits substep events', function () {
		var substeps = 0;

		var rbcA = new RigidBodyComponent({ mass: 1 });
		var ccA = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 })
		});
		world.createEntity(rbcA, ccA, [0, 0, 0]).addToWorld();
		rbcA.initialize();

		var listeners = {
			'goo.physics.substep': function () {
				substeps++;
			}
		};
		for (var key in listeners) {
			SystemBus.addListener(key, listeners[key]);
		}

		world.fixedUpdate();

		expect(substeps).toEqual(1);

		for (var key in listeners) {
			SystemBus.removeListener(key, listeners[key]);
		}
	});

	it('filters collisions', function () {
		var numBeginContact = 0;
		var listeners = {
			'goo.physics.beginContact': function () {
				numBeginContact++;
			}
		};
		for (var key in listeners) {
			SystemBus.addListener(key, listeners[key]);
		}

		var rbcA = new RigidBodyComponent({ mass: 1 });
		var rbcB = new RigidBodyComponent({ mass: 1 });
		var ccA = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 })
		});
		var ccB = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 })
		});
		var entityA = world.createEntity(rbcA, ccA).addToWorld();
		var entityB = world.createEntity(rbcB, ccB).addToWorld();
		entityA.setTranslation(0, 0, 0.1);
		entityB.setTranslation(0, 0, -0.1);

		rbcA.initialize();
		rbcB.initialize();
		world.fixedUpdate();

		expect(numBeginContact).toEqual(1);

		rbcA.collisionMask = 0; // none
		rbcB.collisionMask = 0;

		world.fixedUpdate(); // Needed to initialize bodies

		expect(numBeginContact).toEqual(1);

		for (var key in listeners) {
			SystemBus.removeListener(key, listeners[key]);
		}
	});

	it('can pause and play', function () {
		system.pause();
		expect(system.passive).toBeTruthy();
		system.play();
		expect(system.passive).toBeFalsy();
	});

	it('can set and get gravity', function () {
		system.setGravity(new Vector3(1, 2, 3));
		var gravity = new Vector3();
		system.getGravity(gravity);
		expect(gravity).toEqual(new Vector3(1, 2, 3));
	});

	//! AT: what is this supposed to test?
	it('can stop and play', function () {
		//! AT: bad variable names
		var rbcA = new RigidBodyComponent({ mass: 1 });
		var ccA = new ColliderComponent({
			collider: new SphereCollider({ radius: 1 })
		});
		world.createEntity(rbcA, ccA).addToWorld();

		world.fixedUpdate();

		system.stop();

		world.fixedUpdate();

		system.play();
		world.fixedUpdate();
	});
});


describe('Pool', function () {

	var Pool = require("../../src/goo/addons/physicspack/util/Pool");
	var Vector3 = require("../../src/goo/math/Vector3");

	function createPool() {
		return new Pool({
			create: function () { return new Vector3(); },
			init: Vector3.prototype.setDirect,
			destroy: function (vector) { vector.setDirect(0, 0, 0); } // just for testing
		});
	}

	it('can resize', function () {
		var pool = createPool();

		pool.resize(10);

		expect(pool._objects.length).toEqual(10);
	});

	it('can get', function () {
		var pool = createPool();

		var vector = pool.get(1, 2, 3);

		expect(vector).toEqual(new Vector3(1, 2, 3));
	});

	it('can release', function () {
		var pool = createPool();
		var vector = pool.get(1, 2, 3);

		expect(pool._objects.length).toEqual(0);

		pool.release(vector);

		expect(pool._objects.length).toEqual(1);
		expect(vector).toEqual(new Vector3(0, 0, 0));
	});

	it('can create', function () {
		var pool = createPool();

		var vector = pool._create();

		expect(vector).toEqual(new Vector3());
		expect(pool._objects.length).toEqual(0);
	});

	it('can destroy', function () {
		var pool = createPool();
		var vector = pool._create(1, 2, 3);

		pool._destroy(vector);

		expect(vector).toEqual(new Vector3(0, 0, 0));
		expect(pool._objects.length).toEqual(0);
	});
});






































var World = require("../../src/goo/entities/World");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var AnimationClip = require("../../src/goo/animationpack/clip/AnimationClip");
var Configs = require("./loaders/Configs");

require("../../src/goo/animationpack/handlers/AnimationHandlers");

describe('AnimationClipHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads a clip', function (done) {
		var config = Configs.clip();
		loader.preload(Configs.get());
		loader.load(config.id).then(function (clip) {
			expect(clip).toEqual(jasmine.any(AnimationClip));
			done();
		});
	});
});

var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var World = require("../../src/goo/entities/World");
var Configs = require("./loaders/Configs");
var AnimationComponent = require("../../src/goo/animationpack/components/AnimationComponent");
var AnimationLayer = require("../../src/goo/animationpack/layer/AnimationLayer");
var SkeletonPose = require("../../src/goo/animationpack/SkeletonPose");

require("../../src/goo/animationpack/handlers/AnimationHandlers");

describe('AnimationComponentHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads an entity with animation component', function (done) {
		var config = Configs.entity(['animation']);
		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			expect(entity.animationComponent).toEqual(jasmine.any(AnimationComponent));
			done();
		});
	});

	it('loads component with layers and skeletonpose', function (done) {
		var config = Configs.entity(['animation']);
		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			var component = entity.animationComponent;
			expect(component._skeletonPose).toEqual(jasmine.any(SkeletonPose));
			expect(component.layers[0]).toEqual(jasmine.any(AnimationLayer));
			done();
		});
	});
});

var World = require("../../src/goo/entities/World");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var SteadyState = require("../../src/goo/animationpack/state/SteadyState");
var AnimationLayer = require("../../src/goo/animationpack/layer/AnimationLayer");
var Configs = require("./loaders/Configs");

require("../../src/goo/animationpack/handlers/AnimationHandlers");

describe('AnimationLayersHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads a collection of animation layers', function (done) {
		var layersConfig = Configs.animation();
		loader.preload(Configs.get());
		loader.load(layersConfig.id).then(function (layers) {
			expect(layers.length).toBe(Object.keys(layersConfig.layers).length);

			var layer = layers[0];
			expect(layer).toEqual(jasmine.any(AnimationLayer));
			expect(layer._currentState).toEqual(jasmine.any(SteadyState));
			done();
		});
	});

	it('sorts animation layers correctly', function (done) {
		var layersConfig = Configs.animation();
		loader.preload(Configs.get());
		loader.load(layersConfig.id).then(function (layers) {
			for (var i = 0; i < layers.length; i++) {
				expect(layersConfig.layers[layers[i].id].sortValue).toBe(i);
			}
			done();
		});
	});
});

var World = require("../../src/goo/entities/World");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var SteadyState = require("../../src/goo/animationpack/state/SteadyState");
var ClipSource = require("../../src/goo/animationpack/blendtree/ClipSource");
var AnimationClip = require("../../src/goo/animationpack/clip/AnimationClip");
var Configs = require("./loaders/Configs");

require("../../src/goo/animationpack/handlers/AnimationHandlers");

describe('AnimationStateHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads an animation state', function (done) {
		var stateConfig = Configs.animstate();
		loader.preload(Configs.get());
		loader.load(stateConfig.id).then(function (state) {
			expect(state).toEqual(jasmine.any(SteadyState));
			expect(state._sourceTree).toEqual(jasmine.any(ClipSource));
			expect(state._sourceTree._clip).toEqual(jasmine.any(AnimationClip));
			done();
		});
	});
});

var World = require("../../src/goo/entities/World");
var SkeletonPose = require("../../src/goo/animationpack/SkeletonPose");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var Configs = require("./loaders/Configs");

require("../../src/goo/animationpack/handlers/AnimationHandlers");

describe('SkeletonHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads a skeleton', function (done) {
		var config = Configs.skeleton();
		loader.preload(Configs.get());
		loader.load(config.id).then(function (skeleton) {
			expect(skeleton).toEqual(jasmine.any(SkeletonPose));
			expect(skeleton._skeleton._joints.length).toBe(Object.keys(config.joints).length);
			done();
		});
	});

	it('order joints correctly', function (done) {
		var config = Configs.skeleton();
		loader.preload(Configs.get());
		loader.load(config.id).then(function (skeleton) {
			var joints = skeleton._skeleton._joints;
			var ordered = joints.every(function (joint, idx) {
				if (idx === 0) { return true; }
				return joint._index > joints[idx-1]._index;
			});
			expect(ordered).toBeTruthy();
			expect(skeleton).toEqual(jasmine.any(SkeletonPose));
			expect(skeleton._skeleton._joints.length).toBe(Object.keys(config.joints).length);
			done();
		});
	});
});































var Bus = require("../../src/goo/entities/Bus");

describe('Bus', function () {
	var bus;

	beforeEach(function () {
		bus = new Bus();
	});

	it('can add a listener, emit and capture a message', function () {
		var listener = jasmine.createSpy('listener');

		bus.addListener('main', listener);
		bus.emit('main', 123);

		expect(listener).toHaveBeenCalledWith(123, 'main', bus);
	});

	it('can add multiple listeners to same channel', function () {
		var listener1 = jasmine.createSpy('listener1');
		var listener2 = jasmine.createSpy('listener2');

		bus.addListener('main', listener1);
		bus.addListener('main', listener2);
		bus.emit('main', 123);

		expect(listener1).toHaveBeenCalledWith(123, 'main', bus);
		expect(listener2).toHaveBeenCalledWith(123, 'main', bus);
	});

	it('cannot add the same listener to a channel', function () {
		var channel = 'main';
		var listener = jasmine.createSpy('listener');

		bus.addListener(channel, listener);
		bus.addListener(channel, listener);

		expect(bus.trie.children.get(channel).listeners.length).toBe(1);
	});

	it('can send to multiple channels', function () {
		var listener1 = jasmine.createSpy('listener1');
		var listener2 = jasmine.createSpy('listener2');
		var listener3 = jasmine.createSpy('listener3');

		bus.addListener('first', listener1);
		bus.addListener('second', listener2);
		bus.addListener('third', listener3);
		bus.emit(['first', 'third'], 123);

		expect(listener1).toHaveBeenCalledWith(123, 'first', bus);
		expect(listener2).not.toHaveBeenCalled();
		expect(listener3).toHaveBeenCalledWith(123, 'third', bus);
	});

	it('can send to superchannels', function () {
		var listener1 = jasmine.createSpy('listener1');
		var listener2 = jasmine.createSpy('listener2');
		var listener3 = jasmine.createSpy('listener3');

		bus.addListener('main.first', listener1);
		bus.addListener('main', listener2);
		bus.addListener('second', listener3);
		bus.emit('main', 123);

		expect(listener1).toHaveBeenCalledWith(123, 'main', bus);
		expect(listener2).toHaveBeenCalledWith(123, 'main', bus);
		expect(listener3).not.toHaveBeenCalled();
	});

	it('can send to subchannels', function () {
		var listener1 = jasmine.createSpy('listener1');
		var listener2 = jasmine.createSpy('listener2');
		var listener3 = jasmine.createSpy('listener3');

		bus.addListener('main.first.second', listener1);
		bus.addListener('main.first', listener2);
		bus.addListener('third', listener3);
		bus.emit('main.first.second', 123);

		expect(listener1).toHaveBeenCalledWith(123, 'main.first.second', bus);
		expect(listener2).not.toHaveBeenCalled();
		expect(listener3).not.toHaveBeenCalled();
	});

	it('can remove a listener from a channel', function () {
		var listener1 = jasmine.createSpy('listener1');
		var listener2 = jasmine.createSpy('listener2');
		var listener3 = jasmine.createSpy('listener3');

		bus.addListener('first', listener1);
		bus.addListener('second', listener2);
		bus.addListener('third', listener3);

		bus.removeListener('second', listener2);

		bus.emit('first', 123);
		bus.emit('second', 321);

		expect(listener1).toHaveBeenCalledWith(123, 'first', bus);
		expect(listener2).not.toHaveBeenCalled();
		expect(listener3).not.toHaveBeenCalled();
	});

	it('can remove a listener from a channel only', function () {
		var listener1 = jasmine.createSpy('listener1');
		var listener2 = jasmine.createSpy('listener2');
		var listener3 = jasmine.createSpy('listener3');
		var listener4 = jasmine.createSpy('listener4');

		bus.addListener('first', listener1);
		bus.addListener('first.second', listener2);
		bus.addListener('first.second.third', listener3);
		bus.addListener('fourth', listener4);

		bus.removeListener('first.second', listener2);

		bus.emit('first', 123);
		bus.emit('first.second', 234);
		bus.emit('first.second.third', 345);
		bus.emit('fourth', 456);

		expect(listener1).toHaveBeenCalledWith(123, 'first', bus);
		expect(listener2).not.toHaveBeenCalled();
		expect(listener3).toHaveBeenCalledWith(345, 'first.second.third', bus);
		expect(listener4).toHaveBeenCalledWith(456, 'fourth', bus);
	});

	it('can remove all listeners from a channel', function () {
		var listener1 = jasmine.createSpy('listener1');
		var listener2 = jasmine.createSpy('listener2');
		var listener3 = jasmine.createSpy('listener3');

		bus.addListener('first', listener1);
		bus.addListener('first', listener2);
		bus.addListener('second', listener3);

		bus.removeAllOnChannel('first');

		bus.emit('first', 123);
		bus.emit('second', 321);

		expect(listener1).not.toHaveBeenCalled();
		expect(listener2).not.toHaveBeenCalled();
		expect(listener3).toHaveBeenCalledWith(321, 'second', bus);
	});

	it('can remove all listeners from a channel only', function () {
		var listener1 = jasmine.createSpy('listener1');
		var listener2 = jasmine.createSpy('listener2');
		var listener3 = jasmine.createSpy('listener3');
		var listener4 = jasmine.createSpy('listener4');
		var listener5 = jasmine.createSpy('listener5');

		bus.addListener('first', listener1);
		bus.addListener('first.second', listener2);
		bus.addListener('first.second', listener3);
		bus.addListener('first.second.third', listener4);
		bus.addListener('fourth', listener5);

		bus.removeAllOnChannel('first.second');

		bus.emit('first', 123);
		bus.emit('first.second', 234);
		bus.emit('first.second.third', 345);
		bus.emit('fourth', 456);

		expect(listener1).toHaveBeenCalledWith(123, 'first', bus);
		expect(listener2).not.toHaveBeenCalled();
		expect(listener3).not.toHaveBeenCalled();
		expect(listener4).toHaveBeenCalledWith(345, 'first.second.third', bus);
		expect(listener5).toHaveBeenCalledWith(456, 'fourth', bus);
	});

	it('can remove a listener from all channels', function () {
		var listener1 = jasmine.createSpy('listener1');
		var listener2 = jasmine.createSpy('listener2');

		bus.addListener('first', listener1);
		bus.addListener('second', listener1);
		bus.addListener('third', listener2);

		bus.removeListenerFromAllChannels(listener1);

		bus.emit('first', 123);
		bus.emit('third', 321);

		expect(listener1).not.toHaveBeenCalled();
		expect(listener2).toHaveBeenCalledWith(321, 'third', bus);
	});

	describe('removeChannelAndChildren', function () {
		it('can remove a channel and its children', function () {
			var listener1 = jasmine.createSpy('listener1');
			var listener2 = jasmine.createSpy('listener2');
			var listener3 = jasmine.createSpy('listener3');
			var listener4 = jasmine.createSpy('listener4');
			var listener5 = jasmine.createSpy('listener5');

			bus.addListener('first', listener1);
			bus.addListener('first.second', listener2);
			bus.addListener('first.second', listener3);
			bus.addListener('first.second.third', listener4);
			bus.addListener('fourth', listener5);

			bus.removeChannelAndChildren('first.second');

			bus.emit('first', 123);
			bus.emit('first.second', 234);
			bus.emit('first.second.third', 345);
			bus.emit('fourth', 456);

			expect(listener1).toHaveBeenCalledWith(123, 'first', bus);
			expect(listener2).not.toHaveBeenCalled();
			expect(listener3).not.toHaveBeenCalled();
			expect(listener4).not.toHaveBeenCalled();
			expect(listener5).toHaveBeenCalledWith(456, 'fourth', bus);
		});

		it('removes the channel even if it\'s a top level channel', function () {
			var listener1 = jasmine.createSpy('listener1');
			var listener2 = jasmine.createSpy('listener2');

			bus.addListener('first', listener1);
			bus.addListener('first.second', listener2);

			bus.removeChannelAndChildren('first');

			bus.emit('first', 123);
			bus.emit('first.second', 234);

			expect(listener1).not.toHaveBeenCalled();
			expect(listener2).not.toHaveBeenCalled();
		});
	});

	describe('emit', function () {
		it('does not store the last message by default', function () {
			bus.emit('main', 123);

			var listener = jasmine.createSpy('listener');
			bus.addListener('main', listener);

			expect(listener).not.toHaveBeenCalled();
		});

		it('stores the last message when told to', function () {
			bus.emit('main', 123, true);

			var listener = jasmine.createSpy('listener');
			bus.addListener('main', listener, true);

			expect(listener).toHaveBeenCalledWith(123, 'main', bus);
		});

		it('returns itself', function () {
			expect(bus.emit('main')).toBe(bus);
		});

		it('correctly emits to channels as they are removed (before the current position)', function () {
			var spy1 = jasmine.createSpy('spy1');
			var rem2 = function () { bus.removeListener('main', spy1); };
			var spy3 = jasmine.createSpy('spy5');

			bus.addListener('main', spy1);
			bus.addListener('main', rem2);
			bus.addListener('main', spy3);

			bus.emit('main');

			expect(spy1).toHaveBeenCalled(); // rem2 executes after
			expect(spy3).toHaveBeenCalled();
		});

		it('correctly emits to channels as they are removed (after the current position)', function () {
			var spy1 = jasmine.createSpy('spy1');
			var rem2 = function () { bus.removeListener('main', spy3); };
			var spy3 = jasmine.createSpy('spy3');

			bus.addListener('main', spy1);
			bus.addListener('main', rem2);
			bus.addListener('main', spy3);

			bus.emit('main');

			expect(spy1).toHaveBeenCalled();
			expect(spy3).not.toHaveBeenCalled(); // rem3 executed before
		});
	});

	describe('getLastMessageOn', function () {
		it('retrieves the last message sent on a channel', function () {
			bus.emit('main', 123, true);

			expect(bus.getLastMessageOn('main')).toEqual(123);
		});

		it('retrieves the last message sent on a channel when sending multiple data', function () {
			bus.emit('main', 123, true);
			bus.emit('main', 456, true);

			expect(bus.getLastMessageOn('main')).toEqual(456);
		});

		it('retrieves nothing if there was no stored data on a channel', function () {
			bus.emit('main', 123);

			expect(bus.getLastMessageOn('main')).toBeUndefined();
		});
	});

	describe('addListener', function () {
		it('does not retrieve the last message by default', function () {
			bus.emit('main', 123, true);

			var listener = jasmine.createSpy('listener');
			bus.addListener('main', listener);

			expect(listener).not.toHaveBeenCalled();
		});

		it('returns itself', function () {
			expect(bus.addListener('main', function () {})).toBe(bus);
		});
	});

	describe('removeListener', function () {
		it('returns itself', function () {
			var listener = function () {};
			bus.addListener('main', listener);
			expect(bus.removeListener('main', listener)).toBe(bus);
		});
	});

	describe('removeAllOnChannel', function () {
		it('returns itself', function () {
			expect(bus.removeAllOnChannel('main')).toBe(bus);
		});
	});

	describe('removeChannelAndChildren', function () {
		it('returns itself', function () {
			expect(bus.removeChannelAndChildren('main')).toBe(bus);
		});
	});

	describe('removeListenerFromAllChannels', function () {
		it('returns itself', function () {
			expect(bus.removeListenerFromAllChannels('main', function () {})).toBe(bus);
		});
	});

	describe('clear', function () {
		it('clears the system bus of any channels or listeners', function () {
			bus.addListener('main', function (/*data*/) {});
			bus.addListener('main.second', function (/*data*/) {});
			bus.clear();
			var newBus = new Bus();
			bus._emitOnEachChildChannel = newBus._emitOnEachChildChannel = null; // this function is the only thing that differ in the following test
			expect(bus).toEqual(newBus);
		});
	});
});


var Entity = require("../../src/goo/entities/Entity");
var World = require("../../src/goo/entities/World");
var TransformComponent = require("../../src/goo/entities/components/TransformComponent");
var MeshDataComponent = require("../../src/goo/entities/components/MeshDataComponent");
var MeshRendererComponent = require("../../src/goo/entities/components/MeshRendererComponent");
var CameraComponent = require("../../src/goo/entities/components/CameraComponent");
var LightComponent = require("../../src/goo/entities/components/LightComponent");
var ScriptComponent = require("../../src/goo/entities/components/ScriptComponent");
var Component = require("../../src/goo/entities/components/Component");
var ScriptSystem = require("../../src/goo/entities/systems/ScriptSystem");
var Box = require("../../src/goo/shapes/Box");
var Camera = require("../../src/goo/renderer/Camera");
var PointLight = require("../../src/goo/renderer/light/PointLight");
var ShaderLib = require("../../src/goo/renderer/shaders/ShaderLib");
var Material = require("../../src/goo/renderer/Material");

describe('Entity', function () {
	var world;

	beforeEach(function () {
		world = new World();
		Entity.entityCount = 0;

		world.registerComponent(TransformComponent);
		world.registerComponent(MeshDataComponent);
		world.registerComponent(MeshRendererComponent);
		world.registerComponent(CameraComponent);
		world.registerComponent(LightComponent);
		world.registerComponent(ScriptComponent);

		//
		world.gooRunner = {
			renderer: {
				domElement: null,
				viewportWidth: null,
				viewportHeight: null
			}
		};
		world.add(new ScriptSystem(world));
	});

	it('addToWorld', function () {
		var entity1 = world.createEntity();
		var entity2 = world.createEntity();
		entity1.addToWorld();
		entity2.addToWorld();
		world.process();
		expect(world.entityManager.containsEntity(entity1)).toBe(true);
		expect(world.entityManager.containsEntity(entity2)).toBe(true);
	});

	it('addToWorld recursive', function () {
		var entity1 = world.createEntity();
		var entity2 = world.createEntity();
		var entity3 = world.createEntity();
		entity1.transformComponent.attachChild(entity2.transformComponent);
		entity2.transformComponent.attachChild(entity3.transformComponent);
		entity1.addToWorld();
		world.process();
		expect(world.entityManager.containsEntity(entity1)).toBe(true);
		expect(world.entityManager.containsEntity(entity2)).toBe(true);
		expect(world.entityManager.containsEntity(entity3)).toBe(true);
	});

	it('addToWorld non-recursive', function () {
		var entity1 = world.createEntity();
		var entity2 = world.createEntity();
		var entity3 = world.createEntity();
		entity1.transformComponent.attachChild(entity2.transformComponent);
		entity2.transformComponent.attachChild(entity3.transformComponent);
		entity1.addToWorld(false);
		world.process();
		expect(world.entityManager.containsEntity(entity1)).toBe(true);
		expect(world.entityManager.containsEntity(entity2)).toBe(false);
		expect(world.entityManager.containsEntity(entity3)).toBe(false);
	});

	it('removeFromWorld', function () {
		var entity1 = world.createEntity();
		var entity2 = world.createEntity();
		entity1.addToWorld();
		entity2.addToWorld();
		world.process();
		entity1.removeFromWorld();
		world.process();
		expect(world.entityManager.containsEntity(entity1)).toBe(false);
		expect(world.entityManager.containsEntity(entity2)).toBe(true);
	});

	it('removeFromWorld recursive', function () {
		var entity1 = world.createEntity();
		var entity2 = world.createEntity();
		var entity3 = world.createEntity();
		entity1.transformComponent.attachChild(entity2.transformComponent);
		entity2.transformComponent.attachChild(entity3.transformComponent);
		entity1.addToWorld();
		world.process();
		expect(world.entityManager.containsEntity(entity1)).toBe(true);
		expect(world.entityManager.containsEntity(entity2)).toBe(true);
		expect(world.entityManager.containsEntity(entity3)).toBe(true);
		entity2.removeFromWorld();
		world.process();
		expect(world.entityManager.containsEntity(entity1)).toBe(true);
		expect(world.entityManager.containsEntity(entity2)).toBe(false);
		expect(world.entityManager.containsEntity(entity3)).toBe(false);

		expect(entity1.transformComponent.children.length).toBe(0);
		expect(entity2.transformComponent.parent).toBeNull();
		expect(entity3.transformComponent.parent).toBe(entity2.transformComponent);
	});

	it('removeFromWorld non-recursive', function () {
		var entity1 = world.createEntity();
		var entity2 = world.createEntity();
		var entity3 = world.createEntity();
		entity1.transformComponent.attachChild(entity2.transformComponent);
		entity2.transformComponent.attachChild(entity3.transformComponent);
		entity1.addToWorld();
		world.process();
		expect(world.entityManager.containsEntity(entity1)).toBe(true);
		expect(world.entityManager.containsEntity(entity2)).toBe(true);
		expect(world.entityManager.containsEntity(entity3)).toBe(true);
		entity2.removeFromWorld(false);
		world.process();
		expect(world.entityManager.containsEntity(entity1)).toBe(true);
		expect(world.entityManager.containsEntity(entity2)).toBe(false);
		expect(world.entityManager.containsEntity(entity3)).toBe(true);

		expect(entity1.transformComponent.children.length).toBe(0);
		expect(entity2.transformComponent.parent).toBeNull();
		expect(entity2.transformComponent.children.length).toBe(0);
		expect(entity3.transformComponent.parent).toBeNull();
	});

	it('toString', function () {
		var entity1 = world.createEntity();
		var entity2 = world.createEntity('myEnt');
		var entity3 = world.createEntity();
		expect(entity1.toString()).toBe('Entity_0');
		expect(entity2.toString()).toBe('myEnt');
		expect(entity3.toString()).toBe('Entity_2');
	});

	it('all entities should have TransformComponent', function () {
		var entity = world.createEntity();
		expect(entity.transformComponent !== undefined).toBe(true);
	});

	it('setComponent', function () {
		var entity = world.createEntity();
		entity.setComponent(new MeshDataComponent());
		expect(entity.meshDataComponent !== undefined).toBe(true);
	});

	it('cannot add the same component twice', function () {
		var entity = world.createEntity();
		var component = new MeshDataComponent();
		entity.setComponent(component);
		entity.setComponent(component);
		expect(entity._components.length).toBe(2);
	});

	it('cannot add more than one component of the same type to the same entity', function () {
		var entity = world.createEntity();
		entity.setComponent(new MeshDataComponent());
		entity.setComponent(new MeshDataComponent());
		expect(entity._components.length).toBe(2);
	});

	it('discards the second added component of the same type', function () {
		var entity = world.createEntity();
		var component1 = new MeshDataComponent();
		var component2 = new MeshDataComponent();
		entity.setComponent(component1);
		entity.setComponent(component2);
		var gotComponent = entity.getComponent('MeshDataComponent');
		expect(gotComponent).toBe(component1);
	});

	it('getComponent', function () {
		var entity = world.createEntity();
		var mdc = new MeshDataComponent();
		entity.setComponent(mdc);
		expect(entity.getComponent('meshDataComponent')).toBe(mdc);
		expect(entity.getComponent('MeshDataComponent')).toBe(mdc);
		expect(entity.getComponent('TransformComponent') !== undefined).toBe(true);
	});

	it('hasComponent', function () {
		var entity = world.createEntity();
		entity.setComponent(new MeshDataComponent());
		expect(entity.hasComponent('alabalaportocala')).toBe(false);
		expect(entity.hasComponent('TransformComponent')).toBe(true);
		expect(entity.hasComponent('MeshDataComponent')).toBe(true);
	});

	it('clears a component', function () {
		var entity = world.createEntity();
		entity.setComponent(new MeshDataComponent());
		entity.setComponent(new MeshRendererComponent());
		world.process();
		entity.clearComponent('MeshRendererComponent');
		world.process();
		expect(entity.hasComponent('MeshDataComponent')).toBe(true);
		expect(entity.hasComponent('MeshRendererComponent')).toBe(false);
	});

	it('installs the api of a component', function () {
		var entity = world.createEntity();
		entity.setComponent(new TransformComponent());
		expect(entity.setTranslation).toBeTruthy();
	});

	it('removes the api of a component', function () {
		var entity = world.createEntity();
		entity.clearComponent('TransformComponent');
		expect(entity.setTranslation).toBeFalsy();
	});

	it('does not override existing methods on install', function () {
		var a = 0;
		function FishComponent() {
			Component.apply(this, arguments);
			this.type = 'FishComponent';
			this.api = {
				swim: function () { a += 123; }
			};
		}
		FishComponent.prototype = Object.create(Component.prototype);


		var b = 0;
		function BananaComponent() {
			Component.apply(this, arguments);
			this.type = 'BananaComponent';
			this.api = {
				swim: function () { b += 234; }
			};
		}
		BananaComponent.prototype = Object.create(Component.prototype);


		var entity = new Entity(world);

		entity.setComponent(new FishComponent());

		expect(function () {
			entity.setComponent(new BananaComponent());
		}).toThrow(new Error("Could not install method swim of BananaComponent as it is already taken"));

		entity.swim();

		expect(a).toEqual(123);
		expect(b).toEqual(0);
	});

	it('does not remove what it did not manage to install', function () {
		var a = 0;
		function FishComponent() {
			Component.apply(this, arguments);
			this.type = 'FishComponent';
			this.api = {
				swim: function () { a += 123; }
			};
		}
		FishComponent.prototype = Object.create(Component.prototype);


		var b = 0;
		function BananaComponent() {
			Component.apply(this, arguments);
			this.type = 'BananaComponent';
			this.api = {
				swim: function () { b += 234; }
			};
		}
		BananaComponent.prototype = Object.create(Component.prototype);


		var entity = new Entity(world);

		entity.setComponent(new FishComponent());

		expect(function () {
			entity.setComponent(new BananaComponent());
		}).toThrow(new Error("Could not install method swim of BananaComponent as it is already taken"));

		entity.clearComponent('BananaComponent');

		expect(entity.swim).toBeTruthy();

		entity.swim();

		expect(a).toEqual(123);
	});

	//! AT: these should stay in their respective component test files
	it('returns itself after calling set()', function () {
		var entity = new Entity(world);
		var translation = [1, 2, 3];
		var sameEntity = entity.set(translation);

		expect(sameEntity).toEqual(entity);
	});

	it('sets a TransformComponent', function () {
		var entity = new Entity(world);
		var transformComponent = new TransformComponent();
		entity.set(transformComponent);

		expect(entity.transformComponent).toBe(transformComponent);
	});

	// ---
	it('sets a MeshDataComponent when trying to add a mesh', function () {
		var entity = new Entity(world);
		var meshData = new Box();
		entity.set(meshData);

		expect(entity.meshDataComponent).toBeTruthy();
		expect(entity.meshDataComponent.meshData).toEqual(meshData);
	});

	it('sets a MeshRendererComponent when trying to add a material', function () {
		var entity = new Entity(world);
		var material = new Material(ShaderLib.simple);
		entity.set(material);

		expect(entity.meshRendererComponent).toBeTruthy();
		expect(entity.meshRendererComponent.materials).toEqual([material]);
	});

	it('sets a CameraComponent when trying to add a camera', function () {
		var entity = new Entity(world);
		var camera = new Camera();
		entity.set(camera);

		expect(entity.cameraComponent).toBeTruthy();
		expect(entity.cameraComponent.camera).toBe(camera);
	});

	it('sets a LightComponent when trying to add a light', function () {
		var entity = new Entity(world);
		var light = new PointLight();
		entity.set(light);

		expect(entity.lightComponent).toBeTruthy();
		expect(entity.lightComponent.light).toBe(light);
	});

	it('sets a ScriptComponent when trying to some functions / objects with a run function', function () {
		var entity = new Entity(world);
		var script1 = { run: function () { } };
		var script2 = function () { };

		entity.set(script1, script2);

		expect(entity.scriptComponent).toBeTruthy();
		expect(entity.scriptComponent.scripts).toEqual([script1, { run: script2 }]);
	});

	/*
	//! AT: disputed
	it('cannot clear a transform component', function () {
		var entity = world.createEntity();
		entity.setComponent(new MeshDataComponent());
		world.process();
		entity.clearComponent('transformComponent');
		world.process();
		expect(entity.hasComponent('MeshDataComponent')).toBe(true);
		expect(entity.hasComponent('TransformComponent')).toBe(true);
	});
	*/

	it('can add components on a world-less entity', function () {
		var entity = new Entity();
		entity.setComponent(new CameraComponent());
		expect(entity.cameraComponent).toBeTruthy();
	});

	it('can remove components on a world-less entity', function () {
		var entity = new Entity();
		entity.setComponent(new CameraComponent());
		entity.clearComponent('CameraComponent');
		expect(entity.cameraComponent).toBeFalsy();
	});

	it("can pass a 'primitive engine object' to .set of a world-less entity", function () {
		var entity = new Entity();
		entity.set([1, 2, 3]);
		// if we get here at least it doesn't blow up (like it used to)
		expect(true).toBeTruthy();

		//! AT: this should work too but requires a lot of changes
		// registered components should stay somewhere else than in worlds
		//expect(entity.cameraComponent).toBeTruthy();
	});

	describe('tags', function () {
		it('sets a tag on an entity', function () {
			var entity = new Entity();
			entity.setTag('t1');
			expect(entity.hasTag('t1')).toBeTruthy();
			expect(entity.hasTag('t2')).toBeFalsy();
		});

		it('clears a tag on an entity', function () {
			var entity = new Entity();
			entity.setTag('t1').setTag('t3');
			entity.clearTag('t1').clearTag('t2');
			expect(entity.hasTag('t1')).toBeFalsy();
			expect(entity.hasTag('t2')).toBeFalsy();
			expect(entity.hasTag('t3')).toBeTruthy();
		});
	});

	describe('attributes', function () {
		it('sets an attribute on an entity', function () {
			var entity = new Entity();
			entity.setAttribute('a1', 123);

			expect(entity.hasAttribute('a1')).toBeTruthy();
			expect(entity.getAttribute('a1')).toEqual(123);

			expect(entity.hasAttribute('a2')).toBeFalsy();
			expect(entity.getAttribute('a2')).toBeUndefined();
		});

		it('clears an attribute on an entity', function () {
			var entity = new Entity();
			entity.setAttribute('a1', 123).setAttribute('a3', 'asd');
			entity.clearAttribute('a1').clearAttribute('a2');

			expect(entity.hasAttribute('a1')).toBeFalsy();
			expect(entity.getAttribute('a1')).toBeUndefined();

			expect(entity.hasAttribute('a2')).toBeFalsy();
			expect(entity.getAttribute('a2')).toBeUndefined();

			expect(entity.hasAttribute('a3')).toBeTruthy();
			expect(entity.getAttribute('a3')).toEqual('asd');
		});
	});
});


var EntitySelection = require("../../src/goo/entities/EntitySelection");
var World = require("../../src/goo/entities/World");
var TransformComponent = require("../../src/goo/entities/components/TransformComponent");

describe('EntitySelection', function () {
	var world;

	function someEntity() {
		return world.createEntity();
	}

	function someEntities(n) {
		var entities = [];
		for (var i = 0; i < n; i++) {
			entities.push(someEntity());
		}
		return entities;
	}

	beforeEach(function () {
		world = new World();
		world.registerComponent(TransformComponent);
	});

	describe('constructor', function () {
//			it('constructs an empty selection if given no parameters', function () {
//
//			});
	});

	describe('children', function () {
		it('returns itself when applied to an empty selection', function () {
			var selection = new EntitySelection();
			selection.children(someEntity());
			expect(selection).toEqual(selection);
			expect(selection).toBe(selection);
		});

		it('gets a selection of child entities of a one entity selection', function () {
			var parent = world.createEntity();
			var child1 = world.createEntity();
			var child2 = world.createEntity();

			parent.attachChild(child1);
			parent.attachChild(child2);

			var selection = new EntitySelection(parent);

			var children = selection.children();

			expect(children.contains(parent)).toBeFalsy();
			expect(children.contains(child1)).toBeTruthy();
			expect(children.contains(child2)).toBeTruthy();
		});

		it('gets a selection of child entities of a multiple entity selection', function () {
			var parent1 = world.createEntity();
			var parent2 = world.createEntity();
			var parent3 = world.createEntity();
			var child11 = world.createEntity();
			var child12 = world.createEntity();
			var child31 = world.createEntity();

			parent1.attachChild(child11);
			parent1.attachChild(child12);
			parent3.attachChild(child31);

			var selection = new EntitySelection(parent1, parent2, parent3);

			var children = selection.children();

			expect(children.contains(parent1)).toBeFalsy();
			expect(children.contains(parent2)).toBeFalsy();
			expect(children.contains(parent3)).toBeFalsy();
			expect(children.contains(child11)).toBeTruthy();
			expect(children.contains(child12)).toBeTruthy();
			expect(children.contains(child31)).toBeTruthy();
		});
	});

	describe('parent', function () {
		it('returns itself when applied to an empty selection', function () {
			var selection = new EntitySelection();
			selection.parent(someEntity());
			expect(selection).toEqual(selection);
			expect(selection).toBe(selection);
		});

		it('does not allow duplicates entities when getting parents', function () {
			var parent = world.createEntity();
			var child1 = world.createEntity();
			var child2 = world.createEntity();

			parent.attachChild(child1);
			parent.attachChild(child2);

			var selection = new EntitySelection(child1, child2);

			var parents = selection.parent();

			expect(parents.contains(parent)).toBeTruthy();
			expect(parents.size()).toEqual(1);
		});

		it('gets a list of parent entities of a multiple entity selection', function () {
			var parent1 = world.createEntity();
			var parent2 = world.createEntity();
			var parent3 = world.createEntity();
			var child11 = world.createEntity();
			var child12 = world.createEntity();
			var child31 = world.createEntity();

			parent1.attachChild(child11);
			parent1.attachChild(child12);
			parent3.attachChild(child31);

			var selection = new EntitySelection(child11, child12, child31);

			var parents = selection.parent();

			expect(parents.contains(parent1)).toBeTruthy();
			expect(parents.contains(parent2)).toBeFalsy();
			expect(parents.contains(parent3)).toBeTruthy();
			expect(parents.contains(child11)).toBeFalsy();
			expect(parents.contains(child12)).toBeFalsy();
			expect(parents.contains(child31)).toBeFalsy();
		});
	});

	describe('and', function () {
		it('returns itself when applied to an empty selection', function () {
			var selection = new EntitySelection();
			selection.and(someEntity());
			expect(selection).toEqual(selection);
			expect(selection).toBe(selection);
		});

		it('concatenates two selections with common elements', function () {
			var entities = someEntities(7);
			var array1 = [entities[0], entities[1], entities[2], entities[3], entities[4]];
			var array2 = [entities[2], entities[3], entities[4], entities[5], entities[6]];

			var selection = new EntitySelection(array1);
			selection.and(array2);

			array1.forEach(function (entity) {
				expect(selection.contains(entity)).toBeTruthy();
			});

			array2.forEach(function (entity) {
				expect(selection.contains(entity)).toBeTruthy();
			});

			expect(selection.size()).toEqual(7);
		});
	});

	describe('intersects', function () {
		it('returns itself when applied to an empty selection', function () {
			var selection = new EntitySelection();
			selection.intersects(someEntity());
			expect(selection).toEqual(selection);
			expect(selection).toBe(selection);
		});

		it('intersects two selection with common entities', function () {
			var entities = someEntities(7);
			var array1 = [entities[0], entities[1], entities[2], entities[3], entities[4]];
			var array2 = [entities[2], entities[3], entities[4], entities[5], entities[6]];

			var selection = new EntitySelection(array1);
			selection.intersects(array2);

			expect(selection.contains(entities[2])).toBeTruthy();
			expect(selection.contains(entities[3])).toBeTruthy();
			expect(selection.contains(entities[4])).toBeTruthy();

			expect(selection.size()).toEqual(3);
		});
	});

	describe('without', function () {
		it('returns itself when applied to an empty selection', function () {
			var selection = new EntitySelection();
			selection.without(someEntity());
			expect(selection).toEqual(selection);
			expect(selection).toBe(selection);
		});

		it('subtracts a collection from another', function () {
			var entities = someEntities(7);
			var array1 = [entities[0], entities[1], entities[2], entities[3], entities[4]];
			var array2 = [entities[2], entities[3], entities[4], entities[5], entities[6]];

			var selection = new EntitySelection(array1);
			selection.without(array2);

			expect(selection.contains(entities[0])).toBeTruthy();
			expect(selection.contains(entities[1])).toBeTruthy();

			expect(selection.size()).toEqual(2);
		});
	});

	describe('andSelf', function () {
		it('returns itself when applied to an empty selection', function () {
			var selection = new EntitySelection();
			selection.andSelf();
			expect(selection).toEqual(selection);
			expect(selection).toBe(selection);
		});

		it('returns itself when applied to an selection that has only one stack entry', function () {
			var selection = new EntitySelection(someEntities(5));
			selection.andSelf();
			expect(selection).toEqual(selection);
			expect(selection).toBe(selection);
		});

		it('add the previous selection to the current one', function () {
			var entities = someEntities(5);
			var children = [];

			var selection = new EntitySelection(entities);
			// attach some children
			selection.each(function (entity) {
				var child = someEntity();
				children.push(child);
				entity.attachChild(child);
			});

			// get those children // very artificial test
			selection.children();

			selection.andSelf();

			entities.forEach(function (entity) {
				expect(selection.contains(entity)).toBeTruthy();
				expect(selection.contains(entity.children().first())).toBeTruthy();
			});

			expect(selection.size()).toEqual(entities.length * 2);
		});
	});
});


var EntityUtils = require("../../src/goo/entities/EntityUtils");
var Entity = require("../../src/goo/entities/Entity");
var World = require("../../src/goo/entities/World");
var TransformComponent = require("../../src/goo/entities/components/TransformComponent");
var MeshDataComponent = require("../../src/goo/entities/components/MeshDataComponent");
var MeshRendererComponent = require("../../src/goo/entities/components/MeshRendererComponent");
var TransformSystem = require("../../src/goo/entities/systems/TransformSystem");
var Box = require("../../src/goo/shapes/Box");

describe('EntityUtils', function () {
	var world;
	var meshData = new Box();

	beforeEach(function () {
		world = new World();
		world.registerComponent(TransformComponent);
		world.registerComponent(MeshDataComponent);
		world.add(new TransformSystem());
		Entity.entityCount = 0;
	});

	it('can get the root entity', function () {
		var e1 = world.createEntity();
		var e2 = world.createEntity();
		e1.transformComponent.attachChild(e2.transformComponent);
		var e3 = world.createEntity();
		e2.transformComponent.attachChild(e3.transformComponent);
		world.process();

		expect(EntityUtils.getRoot(e1)).toBe(e1);
		expect(EntityUtils.getRoot(e2)).toBe(e1);
		expect(EntityUtils.getRoot(e3)).toBe(e1);
	});

	it('can get the total bounding box', function () {
		var e1 = world.createEntity(meshData, new MeshRendererComponent());
		var e2 = world.createEntity(meshData, new MeshRendererComponent(), [10, 10, 10]);
		e1.transformComponent.attachChild(e2.transformComponent);
		var e3 = world.createEntity(meshData, new MeshRendererComponent(), [10, 10, 10]);
		e2.transformComponent.attachChild(e3.transformComponent);
		world.process();
		var es = [e1, e2, e3, e1, e2, e3];
		for (var i = 0; i<es.length; i++) {
			var e = es[i];
			e.transformComponent.updateTransform();
			e.transformComponent.updateWorldTransform();
			e.meshDataComponent.computeBoundFromPoints();
			e.meshRendererComponent.updateBounds(e.meshDataComponent.modelBound, e.transformComponent.worldTransform);
		}
		var bb = EntityUtils.getTotalBoundingBox(e1);
		expect(bb.xExtent).toBe(10.5);
		expect(bb.yExtent).toBe(10.5);
		expect(bb.zExtent).toBe(10.5);
	});
});




var Selection = require("../../src/goo/entities/Selection");

describe('Selection', function () {
	function someObject() {
		return {};
	}

	function someObjects(n) {
		var objects = [];
		for (var i = 0; i < n; i++) {
			objects.push(someObject());
		}
		return objects;
	}

	describe('constructor', function () {
		it('constructs an empty selection if given no parameters', function () {
			var selection = new Selection();

			expect(selection).toEqual(Selection.EMPTY);
		});

		it('constructs a selection from an object', function () {
			var obj1 = someObject();
			var obj2 = someObject();
			var selection = new Selection(obj1);

			//! AT: cannot use jasmine's .toContain as it checks for equivalence and not equality
			expect(selection.contains(obj1)).toBeTruthy();
			expect(selection.contains(obj2)).toBeFalsy();
		});

		it('constructs a selection from a bunch of a objects', function () {
			var obj1 = someObject();
			var obj2 = someObject();
			var obj3 = someObject();
			var selection = new Selection(obj1, obj2);

			expect(selection.contains(obj1)).toBeTruthy();
			expect(selection.contains(obj2)).toBeTruthy();
			expect(selection.contains(obj3)).toBeFalsy();
		});

		it('constructs a selection from an array of objects', function () {
			var obj1 = someObject();
			var obj2 = someObject();
			var obj3 = someObject();
			var selection = new Selection([obj1, obj2]);

			expect(selection.contains(obj1)).toBeTruthy();
			expect(selection.contains(obj2)).toBeTruthy();
			expect(selection.contains(obj3)).toBeFalsy();
		});

		it('constructs a selection from another selection', function () {
			var obj1 = someObject();
			var obj2 = someObject();
			var obj3 = someObject();
			var selection1 = new Selection([obj1, obj2]);
			var selection2 = new Selection(selection1);

			expect(selection2.contains(obj1)).toBeTruthy();
			expect(selection2.contains(obj2)).toBeTruthy();
			expect(selection2.contains(obj3)).toBeFalsy();
		});
	});

	describe('contains', function () {
		it('returns false when applied to an empty selection', function () {
			var selection = new Selection();
			expect(selection.contains(123)).toBeFalsy();
		});
	});

	describe('each', function () {
		it('iterates over every element', function () {
			var array = [11, 22, 33];
			var selection = new Selection(array);
			var sum = 0;

			selection.each(function (element) {
				sum += element;
			});

			expect(sum).toBeCloseTo(array.reduce(function (prev, cur) { return prev + cur; }, 0));
		});

		it('iterates over every element until some condition is met', function () {
			var array = [11, 22, 33, 44, 55];
			var selection = new Selection(array);
			var sum = 0;

			selection.each(function (element) {
				if (element > 33) { return false; }
				sum += element;
			});

			expect(sum).toBeCloseTo(array.slice(0, 3).reduce(function (prev, cur) { return prev + cur; }, 0));
			expect(selection.toArray()).toEqual(array);
		});
	});

	describe('filter', function () {
		it('returns itself when applied to an empty selection', function () {
			var selection = new Selection();
			selection.filter(function () { return true; });
			expect(selection).toEqual(selection);
			expect(selection).toBe(selection);
		});

		it('filters out elements', function () {
			var array = [11, 22, 33, 44, 55];
			var selection = new Selection(array);

			var predicate = function (element) { return element % 2 === 0; };
			selection.filter(predicate);

			expect(selection.toArray()).toEqual(array.filter(predicate));
		});
	});

	describe('map', function () {
		it('returns itself when applied to an empty selection', function () {
			var selection = new Selection();
			selection.map(function () { return 1; });
			expect(selection).toEqual(selection);
			expect(selection).toBe(selection);
		});

		it('gets a new selection by applying a function over every element of the previous selection', function () {
			var array = [11, 22, 33, 44, 55];
			var selection = new Selection(array);

			var fun = function (element) { return element * 10; };
			selection.map(fun);

			expect(selection.toArray()).toEqual(array.map(fun));
		});
	});

	describe('reduce', function () {
		it('returns itself when applied to an empty selection', function () {
			var selection = new Selection();
			selection.reduce(function () { return 1; });
			expect(selection).toEqual(selection);
			expect(selection).toBe(selection);
		});

		it('reduces the elements in a selection', function () {
			var array = [11, 22, 33, 44, 55];
			var selection = new Selection(array);

			var fun = function (prev, cur) { return prev + cur; };
			selection.reduce(fun, 123);

			expect(selection.toArray()).toEqual([array.reduce(fun, 123)]);
		});
	});

	describe('and', function () {
		it('returns itself when applied to an empty selection', function () {
			var selection = new Selection();
			selection.and(someObject());
			expect(selection).toEqual(selection);
			expect(selection).toBe(selection);
		});

		it('concatenates two selection with common elements', function () {
			var array1 = [11, 22, 33, 44, 55];
			var array2 = [33, 44, 55, 66, 77];

			var selection = new Selection(array1);
			selection.and(array2);

			array1.forEach(function (element) {
				expect(selection.contains(element)).toBeTruthy();
			});

			array2.forEach(function (element) {
				expect(selection.contains(element)).toBeTruthy();
			});

			expect(selection.size()).toEqual(7);
		});
	});

	describe('intersects', function () {
		it('returns itself when applied to an empty selection', function () {
			var selection = new Selection();
			selection.intersects(someObject());
			expect(selection).toEqual(selection);
			expect(selection).toBe(selection);
		});

		it('intersects two selections with common elements', function () {
			var array1 = [11, 22, 33, 44, 55];
			var array2 = [33, 44, 55, 66, 77];

			var selection = new Selection(array1);
			selection.intersects(array2);

			expect(selection.contains(33)).toBeTruthy();
			expect(selection.contains(44)).toBeTruthy();
			expect(selection.contains(55)).toBeTruthy();

			expect(selection.size()).toEqual(3);
		});
	});

	describe('without', function () {
		it('returns itself when applied to an empty selection', function () {
			var selection = new Selection();
			selection.without(someObject());
			expect(selection).toEqual(selection);
			expect(selection).toBe(selection);
		});

		it('subtracts a collection from another', function () {
			var array1 = [11, 22, 33, 44, 55];
			var array2 = [33, 44, 55, 66, 77];

			var selection = new Selection(array1);
			selection.without(array2);

			expect(selection.contains(11)).toBeTruthy();
			expect(selection.contains(22)).toBeTruthy();

			expect(selection.size()).toEqual(2);
		});
	});

	describe('andSelf', function () {
		it('returns itself when applied to an empty selection', function () {
			var selection = new Selection();
			selection.andSelf();
			expect(selection).toEqual(selection);
			expect(selection).toBe(selection);
		});

		it('returns itself when applied to an selection that has only one stack entry', function () {
			var selection = new Selection(someObjects(5));
			selection.andSelf();
			expect(selection).toEqual(selection);
			expect(selection).toBe(selection);
		});

		it('add the previous selection to the current one', function () {
			var array = [11, 22, 33, 44, 55];

			var selection = new Selection(array);
			selection.map(function (element) { return element * 10; });
			selection.andSelf();

			array.forEach(function (element) {
				expect(selection.contains(element)).toBeTruthy();
				expect(selection.contains(element * 10)).toBeTruthy();
			});

			expect(selection.size()).toEqual(array.length * 2);
		});
	});

	describe('end', function () {
		it('returns itself when applied to an empty selection', function () {
			var selection = new Selection();
			selection.end();
			expect(selection).toEqual(selection);
			expect(selection).toBe(selection);
		});

		it('revert back to a previous selection', function () {
			var array = [11, 22, 33, 44, 55];

			var selection = new Selection(array);
			selection.map(function (element) { return element * 10; });
			selection.end();

			array.forEach(function (element) {
				expect(selection.contains(element)).toBeTruthy();
			});

			expect(selection.size()).toEqual(array.length);
		});
	});

	describe('toArray', function () {
		it('converts a selection to an array', function () {
			var array = [11, 22, 33, 44, 55];

			var selection = new Selection(array);

			expect(selection.toArray()).toEqual(array);
		});

		it('converts an empty selection to an empty array', function () {
			var selection = new Selection();

			expect(selection.toArray()).toEqual([]);
		});
	});

	describe('get', function () {
		it('gets the whole array when called with no arguments', function () {
			var array = [11, 22, 33, 44, 55];

			var selection = new Selection(array);

			expect(selection.get()).toEqual(array);
		});

		it('gets an element at a specific position', function () {
			var array = [11, 22, 33, 44, 55];

			var selection = new Selection(array);

			expect(selection.get(1)).toEqual(22);
		});

		it('gets an element at a specific position when called with a negative index', function () {
			var array = [11, 22, 33, 44, 55];

			var selection = new Selection(array);

			expect(selection.get(-1)).toEqual(55);
		});
	});
});




var Manager = require("../../src/goo/entities/managers/Manager");
var Entity = require("../../src/goo/entities/Entity");
var System = require("../../src/goo/entities/systems/System");
var World = require("../../src/goo/entities/World");
var TransformComponent = require("../../src/goo/entities/components/TransformComponent");
var MeshDataComponent = require("../../src/goo/entities/components/MeshDataComponent");
var MeshRendererComponent = require("../../src/goo/entities/components/MeshRendererComponent");
var CameraComponent = require("../../src/goo/entities/components/CameraComponent");
var LightComponent = require("../../src/goo/entities/components/LightComponent");
var ScriptComponent = require("../../src/goo/entities/components/ScriptComponent");
var Component = require("../../src/goo/entities/components/Component");
var ScriptSystem = require("../../src/goo/entities/systems/ScriptSystem");
var TransformSystem = require("../../src/goo/entities/systems/TransformSystem");
var Box = require("../../src/goo/shapes/Box");
var Camera = require("../../src/goo/renderer/Camera");
var PointLight = require("../../src/goo/renderer/light/PointLight");
var ShaderLib = require("../../src/goo/renderer/shaders/ShaderLib");
var Material = require("../../src/goo/renderer/Material");
var EntitySelection = require("../../src/goo/entities/EntitySelection");

describe('World with Systems', function () {

	var world;

	beforeEach(function () {
		world = new World();
	});

	it('cannot add the same system twice', function () {
		var systemA = new System('A', []);

		world.setSystem(systemA);
		world.setSystem(systemA);

		expect(world._systems).toEqual([systemA]);
	});

	it('adds a system with default priority to the world', function () {
		var systemA = new System('A', []);
		var systemB = new System('B', []);

		world.setSystem(systemA);
		world.setSystem(systemB);

		expect(world._systems).toEqual([systemA, systemB]);
	});

	it ('adds a system with high priority to the world', function () {
		var systemA = new System('A', []);
		var systemB = new System('B', []);
		var systemC = new System('A', []);
		systemC.priority = -1;

		world.setSystem(systemA);
		world.setSystem(systemB);
		world.setSystem(systemC);

		expect(world._systems).toEqual([systemC, systemA, systemB]);
	});

	it('adds a system with low priority to the world', function () {
		var world = new World();

		var systemA = new System('A', []);
		var systemB = new System('B', []);
		var systemC = new System('C', []);
		systemC.priority = 5;

		world.setSystem(systemA);
		world.setSystem(systemB);
		world.setSystem(systemC);

		expect(world._systems).toEqual([systemA, systemB, systemC]);
	});

	it('adds a system with medium priority to the world', function () {
		var systemA = new System('A', []);
		systemA.priority = 3;
		var systemB = new System('B', []);
		systemB.priority = 1;
		var systemC = new System('C', []);
		systemC.priority = 2;

		world.setSystem(systemA);
		world.setSystem(systemB);
		world.setSystem(systemC);

		expect(world._systems).toEqual([systemB, systemC, systemA]);
	});

	it('removes a system', function () {
		var systemA = new System('A', []);
		systemA.priority = 3;
		var systemB = new System('B', []);
		systemB.priority = 1;

		world.setSystem(systemA);
		world.setSystem(systemB);

		world.clearSystem('A');

		expect(world._systems).toEqual([systemB]);
	});

	it('calls the cleanup function of a system when removing it from the world', function () {
		var systemA = new System('A', []);
		spyOn(systemA, 'cleanup').and.callThrough();

		world.setSystem(systemA);

		world.clearSystem('A');

		expect(systemA.cleanup).toHaveBeenCalled();
	});

	it('tries to add existing entities to a late added system', function () {
		function SystemA() {
			System.call(this, 'SystemA', ['ComponentA']);
		}

		SystemA.prototype = Object.create(System.prototype);
		var systemA = new SystemA();
		spyOn(systemA, '_check').and.callThrough();

		// ---
		function ComponentA() {
			Component.apply(this, arguments);
			this.type = 'ComponentA';
		}

		ComponentA.prototype = Object.create(Component.prototype);

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
		world = new World();
		world.registerComponent(TransformComponent);
		world.registerComponent(MeshDataComponent);
		world.registerComponent(MeshRendererComponent);
		world.registerComponent(CameraComponent);
		world.registerComponent(LightComponent);
		world.registerComponent(ScriptComponent);
	});

	// Cucumber system
	function CucumberSystem() {
		System.call(this, 'CucumberSystem', ['CucumberComponent']);
	}
	CucumberSystem.prototype = Object.create(System.prototype);
	CucumberSystem.prototype.inserted = function () {};
	CucumberSystem.prototype.deleted = function () {};
	CucumberSystem.prototype.addedComponent = function () {};
	CucumberSystem.prototype.removedComponent = function () {};

	// Cucumber component
	function CucumberComponent() {
		Component.apply(this, arguments);
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

	CucumberComponent.prototype = Object.create(Component.prototype);

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
		world.add(new ScriptSystem(world));

		var camera = new Camera();
		var meshData = new Box();
		var material = new Material(ShaderLib.simple);
		var light = new PointLight();
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
		var entity = new Entity(world);

		world.add(entity);
		world.process();
		expect(world.getEntities()).toContain(entity);
	});

	it('adds a system using the \'add\' function', function () {
		var system = new TransformSystem();

		world.add(system);
		expect(world._systems).toContain(system);
	});

	it('adds a manager using the \'add\' function', function () {
		function FishManager() {
			Manager.call(this);
		}
		FishManager.prototype = Object.create(Manager.prototype);

		var manager = new FishManager();

		world.add(manager);
		expect(world._managers).toContain(manager);
	});

	it('registers a component using the \'add\' function', function () {
		var component = new TransformComponent();

		world.add(component);
		expect(world._components).toContain(component);
	});

	// api installing
	it('installs the api of a manager', function () {
		var world = new World();
		expect(world.by.id).toBeTruthy();
		expect(world.by.name).toBeTruthy();
	});

	it('does not override existing methods on install', function () {
		var a = 0;
		function FishManager() {
			Manager.call(this);
			this.type = 'FishManager';
			this.api = {
				color: function () { a += 123; }
			};
		}
		FishManager.prototype = Object.create(Manager.prototype);


		var b = 0;
		function BananaManager() {
			this.type = 'BananaManager';
			this.api = {
				color: function () { b += 234; }
			};
		}
		BananaManager.prototype = Object.create(Manager.prototype);


		var world = new World();

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

			CoconutComponent.prototype = Object.create(Component.prototype);
			CoconutComponent.prototype.constructor = CoconutComponent;

			var world = new World();
			world.registerComponent(CoconutComponent);

			var entity1 = new Entity().setComponent(new CoconutComponent());
			var entity2 = new Entity();
			var entity3 = new Entity().setComponent(new CoconutComponent());

			var entitySelection = new EntitySelection(entity1, entity2, entity3);
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

		ProgrammerComponent.prototype = Object.create(Component.prototype);
		ProgrammerComponent.constructor = ProgrammerComponent;

		var world = new World();

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
		var world = new World();
		world.add(new TransformSystem());

		var entity1 = world.createEntity().addToWorld();
		new Entity(world).addToWorld();
		var entity3 = world.createEntity().addToWorld();

		world.process();

		var selection = world.by.system('TransformSystem');
		expect(selection.toArray()).toEqual([entity1, entity3]);
	});

	it('gets a list of entities that have a specific tag', function () {
		var world = new World();

		var entity1 = world.createEntity().setTag('t1').addToWorld();
		world.createEntity().setTag('t2').addToWorld();
		var entity3 = world.createEntity().setTag('t1').addToWorld();

		world.process();

		var selection = world.by.tag('t1');
		expect(selection.toArray()).toEqual([entity1, entity3]);
	});

	it('gets a list of entities that have a specific attribute', function () {
		var world = new World();

		var entity1 = world.createEntity().setAttribute('a1', 10).addToWorld();
		world.createEntity().setAttribute('a2', {}).addToWorld();
		var entity3 = world.createEntity().setAttribute('a1', '20').addToWorld();

		world.process();

		var selection = world.by.attribute('a1');
		expect(selection.toArray()).toEqual([entity1, entity3]);
	});
});


var Entity = require("../../src/goo/entities/Entity");
var World = require("../../src/goo/entities/World");
var SystemBus = require("../../src/goo/entities/SystemBus");
var Camera = require("../../src/goo/renderer/Camera");
var CameraComponent = require("../../src/goo/entities/components/CameraComponent");
var CustomMatchers = require("./CustomMatchers");

describe('CameraComponent', function () {
	var world;

	beforeEach(function () {
		world = new World();
		world.registerComponent(CameraComponent);
		jasmine.addMatchers(CustomMatchers);
	});

	it('attaches .setAsMainCamera to the host entity', function () {
		var camera = new Camera();
		var cameraComponent = new CameraComponent(camera);
		var entity = new Entity(world);

		entity.setComponent(cameraComponent);
		expect(entity.setAsMainCamera).toBeDefined();
	});

	describe('.setAsMainCamera', function () {
		it('sets the main camera', function () {
			var camera = new Camera();
			var cameraComponent = new CameraComponent(camera);
			var entity = new Entity(world);

			entity.setComponent(cameraComponent);

			var listener = jasmine.createSpy('camera-listener');
			SystemBus.addListener('goo.setCurrentCamera', listener);
			entity.setAsMainCamera();
			expect(listener).toHaveBeenCalledWith(
				{
					camera: camera,
					entity: entity
				},
				'goo.setCurrentCamera',
				SystemBus
			);
		});

		it('returns the calling entity', function () {
			var cameraComponent = new CameraComponent(new Camera());
			var entity = new Entity(world);

			entity.setComponent(cameraComponent);
			expect(entity.setAsMainCamera()).toBe(entity);
		});
	});

	describe('copy', function () {
		it('can copy everything from another camera component', function () {
			var original = new CameraComponent(new Camera(50, 2, 2, 2000));
			var copy = new CameraComponent(new Camera(50, 2, 2, 2000));
			copy.copy(original);

			expect(copy).toBeCloned(original);
		});
	});

	describe('clone', function () {
		it('can clone a camera component', function () {
			var original = new CameraComponent(new Camera(50, 2, 2, 2000));
			var clone = original.clone();

			expect(clone).toBeCloned(original);
		});
	});
});














var World = require("../../src/goo/entities/World");
var Entity = require("../../src/goo/entities/Entity");
var ShaderLib = require("../../src/goo/renderer/shaders/ShaderLib");
var Material = require("../../src/goo/renderer/Material");
var MeshRendererComponent = require("../../src/goo/entities/components/MeshRendererComponent");

describe('MeshRendererComponent', function () {
	var world;

	beforeEach(function () {
		world = new World();
		world.registerComponent(MeshRendererComponent);
	});

	describe('.applyOnEntity', function () {
		it('sets a MeshRendererComponent when trying to add a Material', function () {
			var entity = new Entity(world);
			var material = new Material(ShaderLib.simpleColored, '');
			entity.set(material);

			expect(entity.meshRendererComponent).toBeTruthy();
			expect(entity.meshRendererComponent.materials).toEqual([material]);
		});

		it('adds a material to an entity which already has a MeshRendererComponent', function () {
			var entity = new Entity(world);
			var meshRendererComponent = new MeshRendererComponent();
			entity.set(meshRendererComponent);

			var material = new Material(ShaderLib.simpleColored, '');
			entity.set(material);

			expect(entity.meshRendererComponent).toBe(meshRendererComponent);
			expect(entity.meshRendererComponent.materials).toEqual([material]);
		});
	});

	describe('on-entity api', function () {
		var meshRendererComponent, entity;

		beforeEach(function () {
			meshRendererComponent = new MeshRendererComponent(ShaderLib.simpleLit);
			entity = new Entity().set(meshRendererComponent);
		});

		it('changes the diffuse color when given 3 numbers', function () {
			entity.setDiffuse(0.11, 0.22, 0.33);

			var diffuse = meshRendererComponent.materials[0].uniforms.materialDiffuse;
			expect(diffuse[0]).toBeCloseTo(0.11);
			expect(diffuse[1]).toBeCloseTo(0.22);
			expect(diffuse[2]).toBeCloseTo(0.33);
			expect(diffuse[3]).toBeCloseTo(1);
		});

		it('changes the diffuse color when given 4 numbers', function () {
			entity.setDiffuse(0.55, 0.66, 0.77, 0.88);

			var diffuse = meshRendererComponent.materials[0].uniforms.materialDiffuse;
			expect(diffuse[0]).toBeCloseTo(0.55);
			expect(diffuse[1]).toBeCloseTo(0.66);
			expect(diffuse[2]).toBeCloseTo(0.77);
			expect(diffuse[3]).toBeCloseTo(0.88);
		});

		it('changes the diffuse color when given a 3 element array', function () {
			entity.setDiffuse([0.11, 0.22, 0.33]);

			var diffuse = meshRendererComponent.materials[0].uniforms.materialDiffuse;
			expect(diffuse[0]).toBeCloseTo(0.11);
			expect(diffuse[1]).toBeCloseTo(0.22);
			expect(diffuse[2]).toBeCloseTo(0.33);
			expect(diffuse[3]).toBeCloseTo(1);
		});

		it('changes the diffuse color when given a 4 element array', function () {
			entity.setDiffuse([0.55, 0.66, 0.77, 0.88]);

			var diffuse = meshRendererComponent.materials[0].uniforms.materialDiffuse;
			expect(diffuse[0]).toBeCloseTo(0.55);
			expect(diffuse[1]).toBeCloseTo(0.66);
			expect(diffuse[2]).toBeCloseTo(0.77);
			expect(diffuse[3]).toBeCloseTo(0.88);
		});

		it('changes the diffuse color when given a { r, g, b } object', function () {
			entity.setDiffuse({ r: 0.11, g: 0.22, b: 0.33 });

			var diffuse = meshRendererComponent.materials[0].uniforms.materialDiffuse;
			expect(diffuse[0]).toBeCloseTo(0.11);
			expect(diffuse[1]).toBeCloseTo(0.22);
			expect(diffuse[2]).toBeCloseTo(0.33);
			expect(diffuse[3]).toBeCloseTo(1);
		});

		it('changes the diffuse color when given a { r, g, b, a } object', function () {
			entity.setDiffuse({ r: 0.11, g: 0.22, b: 0.33, a: 0.44 });

			var diffuse = meshRendererComponent.materials[0].uniforms.materialDiffuse;
			expect(diffuse[0]).toBeCloseTo(0.11);
			expect(diffuse[1]).toBeCloseTo(0.22);
			expect(diffuse[2]).toBeCloseTo(0.33);
			expect(diffuse[3]).toBeCloseTo(0.44);
		});

		it('gets the diffuse color', function () {
			meshRendererComponent.materials[0].uniforms.materialDiffuse = [1, 2, 3, 4];
			expect(entity.getDiffuse()).toBe(meshRendererComponent.materials[0].uniforms.materialDiffuse);
		});
	});

	describe('constructor', function () {
		it('creates a MeshRendererComponent from nothing', function () {
			var meshRendererComponent = new MeshRendererComponent();
			expect(meshRendererComponent.materials).toEqual([]);
		});

		it('creates a MeshRendererComponent from a material', function () {
			var material = new Material();
			var meshRendererComponent = new MeshRendererComponent(material);
			expect(meshRendererComponent.materials).toEqual([material]);
		});

		it('creates a MeshRendererComponent from an array of materials', function () {
			var materials = [new Material('asd'), new Material('dsa')];
			var meshRendererComponent = new MeshRendererComponent(materials);
			expect(meshRendererComponent.materials).toEqual(materials);
		});
	});
});

var MovementComponent = require("../../src/goo/entities/components/MovementComponent");
var Vector3 = require("../../src/goo/math/Vector3");

describe('MovementComponent', function () {
	describe('Test velocity deltas', function () {
		var spatialMovementComponent;

		beforeEach(function () {
			spatialMovementComponent = new MovementComponent();
		});

		it('adds velocity once', function () {
			var velocity = new Vector3(0, 1, 0);
			spatialMovementComponent.addVelocity(velocity);
			expect(spatialMovementComponent.getVelocity()).toEqual(velocity);
		});

		it('adds velocity some times', function () {
			var velocity = new Vector3(0, 1, 0);
			spatialMovementComponent.addVelocity(velocity);
			spatialMovementComponent.addVelocity(velocity);
			expect(spatialMovementComponent.getVelocity()).toEqual(velocity.scale(2));
			velocity.setDirect(1, 0, 0);
			spatialMovementComponent.addVelocity(velocity);
			spatialMovementComponent.addVelocity(velocity);
			expect(spatialMovementComponent.getVelocity()).toEqual(new Vector3(2, 2, 0));
			velocity.setDirect(-1, 0, 1);
			spatialMovementComponent.addVelocity(velocity);
			spatialMovementComponent.addVelocity(velocity);
			expect(spatialMovementComponent.getVelocity()).toEqual(new Vector3(0, 2, 2));
		});

		it('sets velocity', function () {
			var velocity = new Vector3(0, 1, 0);
			spatialMovementComponent.setVelocity(velocity);
			expect(spatialMovementComponent.getVelocity()).toEqual(velocity);

			velocity = new Vector3(3, 0, 0);
			spatialMovementComponent.setVelocity(velocity);
			expect(spatialMovementComponent.getVelocity()).toEqual(velocity);
		});

		it('adds rotational  velocity once', function () {
			var velocity = new Vector3(0, 1, 0);
			spatialMovementComponent.addRotationVelocity(velocity);
			expect(spatialMovementComponent.getRotationVelocity()).toEqual(velocity);
		});

		it('adds rotational velocity some times', function () {
			var velocity = new Vector3(0, 1, 0);
			spatialMovementComponent.addRotationVelocity(velocity);
			spatialMovementComponent.addRotationVelocity(velocity);
			expect(spatialMovementComponent.getRotationVelocity()).toEqual(velocity.scale(2));
			velocity.setDirect(1, 0, 0);
			spatialMovementComponent.addRotationVelocity(velocity);
			spatialMovementComponent.addRotationVelocity(velocity);
			expect(spatialMovementComponent.getRotationVelocity()).toEqual(new Vector3(2, 2, 0));
			velocity.setDirect(-1, 0, 1);
			spatialMovementComponent.addRotationVelocity(velocity);
			spatialMovementComponent.addRotationVelocity(velocity);
			expect(spatialMovementComponent.getRotationVelocity()).toEqual(new Vector3(0, 2, 2));
		});

		it('sets velocity', function () {
			var velocity = new Vector3(0, 1, 0);
			spatialMovementComponent.setRotationVelocity(velocity);
			expect(spatialMovementComponent.getRotationVelocity()).toEqual(velocity);
			velocity = new Vector3(3, 0, 0);
			spatialMovementComponent.setRotationVelocity(velocity);
			expect(spatialMovementComponent.getRotationVelocity()).toEqual(velocity);
		});
	});
});






var ProximitySystem = require("../../src/goo/fsmpack/proximity/ProximitySystem");
var ProximityComponent = require("../../src/goo/fsmpack/proximity/ProximityComponent");
var World = require("../../src/goo/entities/World");

describe('ProximityComponent', function () {
	var world, proximitySystem;

	beforeEach(function () {
		world = new World();
		proximitySystem = new ProximitySystem();
		world.add(proximitySystem);
	});

	it('it adds a proximity component', function () {
		var proximityComponent = new ProximityComponent('Green');

		var entity = world.createEntity(proximityComponent).addToWorld();
		world.process();

		expect(proximitySystem.getFor('Green')).toEqual([entity]);
	});

	it('it removes a proximity component', function () {
		var proximityComponent = new ProximityComponent('Blue');

		var entity = world.createEntity(proximityComponent).addToWorld();
		world.process();
		entity.clearComponent('proximityComponent');
		world.process();

		expect(proximitySystem.getFor('Blue')).toEqual([]);
	});
});


var ScriptSystem = require("../../src/goo/entities/systems/ScriptSystem");
var ScriptComponent = require("../../src/goo/entities/components/ScriptComponent");
var World = require("../../src/goo/entities/World");

describe('ScriptComponent', function () {
	var world;

	beforeEach(function () {
		world = new World();
		world.gooRunner = {
			renderer: {
				domElement: null,
				viewportWidth: null,
				viewportHeight: null
			}
		};
		world.add(new ScriptSystem(world));
	});

	it('it calls setup on all scripts when removing the component', function () {
		var a = 0, b = 0;

		var scriptComponent = new ScriptComponent([{
			setup: function () { a += 123; },
			run: function () {}
		}, {
			setup: function () { b += 234; },
			run: function () {}
		}]);

		world.createEntity(scriptComponent).addToWorld();
		world.process();

		expect(a).toEqual(123);
		expect(b).toEqual(234);
	});

	it('it calls cleanup on all scripts when removing the component', function () {
		var a = 0, b = 0;

		var scriptComponent = new ScriptComponent([{
			run: function () {},
			cleanup: function () { a += 123; }
		}, {
			run: function () {},
			cleanup: function () { b += 234; }
		}]);

		var entity = world.createEntity(scriptComponent).addToWorld();
		world.process();
		entity.clearComponent('scriptComponent');
		world.process();

		expect(a).toEqual(123);
		expect(b).toEqual(234);
	});
});






var Vector3 = require("../../src/goo/math/Vector3");
var Matrix3 = require("../../src/goo/math/Matrix3");
var Transform = require("../../src/goo/math/Transform");
var TransformSystem = require("../../src/goo/entities/systems/TransformSystem");
var TransformComponent = require("../../src/goo/entities/components/TransformComponent");
var MeshRendererComponent = require("../../src/goo/entities/components/MeshRendererComponent");
var HtmlComponent = require("../../src/goo/entities/components/HtmlComponent");
var LightComponent = require("../../src/goo/entities/components/LightComponent");
var Entity = require("../../src/goo/entities/Entity");
var EntitySelection = require("../../src/goo/entities/EntitySelection");
var World = require("../../src/goo/entities/World");
var CustomMatchers = require("./CustomMatchers");

describe('TransformComponent', function () {
	var world;

	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
		world = new World();
		world.registerComponent(TransformComponent);
	});

	it('can attach a child component via the transformComponent', function () {
		var parentEntity = world.createEntity();
		var childEntity = world.createEntity();
		parentEntity.addToWorld();
		childEntity.addToWorld();
		parentEntity.transformComponent.attachChild(childEntity.transformComponent);
		world.process();

		expect(parentEntity.transformComponent.children).toContain(childEntity.transformComponent);
		expect(childEntity.transformComponent.parent).toBe(parentEntity.transformComponent);
	});

	it('correctly removes parent reference of child on its removal from the world', function () {
		var parentEntity = world.createEntity();
		var childEntity = world.createEntity();
		parentEntity.addToWorld();
		childEntity.addToWorld();
		parentEntity.transformComponent.attachChild(childEntity.transformComponent);
		world.process();
		childEntity.removeFromWorld();
		world.process();
		expect(parentEntity.transformComponent.children).not.toContain(childEntity.transformComponent);
		expect(childEntity.transformComponent.parent).toBeNull();
	});

	it('correctly removes child reference of parent on its removal from the world (in non-recursive mode)', function () {
		var parentEntity = world.createEntity();
		var childEntity = world.createEntity();
		parentEntity.addToWorld();
		childEntity.addToWorld();
		parentEntity.transformComponent.attachChild(childEntity.transformComponent);
		world.process();
		parentEntity.removeFromWorld(false);
		world.process();
		expect(childEntity.transformComponent.parent).toBeNull();
		expect(parentEntity.transformComponent.children).not.toContain(childEntity.transformComponent);
	});

	it('can set, add and get rotation', function () {
		var transformComponent = new TransformComponent();
		transformComponent.setRotation(0.2, 0.4, 0.6); // keep these values under PI / 2
		transformComponent.addRotation(0.0, 0.0, 0.5);
		expect(transformComponent.getRotation()).toBeCloseToVector(new Vector3(0.2, 0.4, 0.6 + 0.5));
	});

	it('can set, add and get rotation with array', function () {
		var transformComponent = new TransformComponent();
		transformComponent.setRotation([0.2, 0.4, 0.6]); // keep these values under PI / 2
		transformComponent.addRotation([0.0, 0.0, 0.5]);
		expect(transformComponent.getRotation()).toBeCloseToVector(new Vector3(0.2, 0.4, 0.6 + 0.5));
	});

	it('can set translation', function () {
		var tc = new TransformComponent();
		var translation;

		tc.setTranslation(1, 2, 3);
		translation = tc.getTranslation();
		expect(translation).toEqual(new Vector3(1, 2, 3));

		tc.setTranslation([4, 5, 6]);
		translation = tc.getTranslation();
		expect(translation).toEqual(new Vector3(4, 5, 6));

		tc.setTranslation(7, 8, 9);
		translation = tc.getTranslation();
		expect(translation).toEqual(new Vector3(7, 8, 9));
	});

	it('can get world translation', function () {
		var parent = new TransformComponent();
		var child = new TransformComponent();
		parent.attachChild(child);
		var translation;

		parent.setTranslation(1, 0, 0);
		child.setTranslation(1, 2, 3);
		translation = child.getWorldTranslation();
		expect(translation).toEqual(new Vector3(2, 2, 3));
	});

	it('can add translation', function () {
		var tc = new TransformComponent();
		var translation;

		tc.setTranslation(1, 2, 3);
		tc.addTranslation(0, 0, 1);
		translation = tc.getTranslation();
		expect(translation).toEqual(new Vector3(1, 2, 4));

		tc.setTranslation([1, 2, 3]);
		tc.addTranslation([0, 0, 1]);
		translation = tc.getTranslation();
		expect(translation).toEqual(new Vector3(1, 2, 4));

		tc.setTranslation(new Vector3(1, 2, 3));
		tc.addTranslation(new Vector3(0, 0, 1));
		translation = tc.getTranslation();
		expect(translation).toEqual(new Vector3(1, 2, 4));
	});

	it('can set scale', function () {
		var tc = new TransformComponent();
		var scale;

		tc.setScale(1, 2, 3);
		scale = tc.getScale();
		expect(scale).toEqual(new Vector3(1, 2, 3));

		tc.setScale([4, 5, 6]);
		scale = tc.getScale();
		expect(scale).toEqual(new Vector3(4, 5, 6));

		tc.setScale(7, 8, 9);
		scale = tc.getScale();
		expect(scale).toEqual(new Vector3(7, 8, 9));
	});

	it('can get world scale', function () {
		var parent = new TransformComponent();
		var child = new TransformComponent();
		parent.attachChild(child);
		var scale;

		parent.setScale(2, 1, 1);
		child.setScale(1, 2, 3);
		scale = child.getWorldScale();
		expect(scale).toEqual(new Vector3(2, 2, 3));
	});

	it('can set rotation matrix', function () {
		var tc = new TransformComponent();
		var matrix;

		tc.setRotationMatrix(new Matrix3([1, 2, 3, 4, 5, 6, 7, 8, 9]));
		matrix = tc.getRotationMatrix();
		expect(matrix).toEqual(new Matrix3([1, 2, 3, 4, 5, 6, 7, 8, 9]));
	});

	it('can get world rotation matrix', function () {
		var tc = new TransformComponent();
		var matrix;

		tc.setRotationMatrix(new Matrix3([1, 2, 3, 4, 5, 6, 7, 8, 9]));
		matrix = tc.getWorldRotationMatrix();
		expect(matrix).toEqual(new Matrix3([1, 2, 3, 4, 5, 6, 7, 8, 9]));
	});

	it('can move', function () {
		var tc = new TransformComponent();
		tc.lookAt(new Vector3(1, 0, 0)); // look along the positive x axis
		tc.move(0, 0, -10); // this moves forward in a right handed coordinate system.
		// in our case this will move us 10 unity in the direction of the positive x axis.
		var translation = tc.getTranslation();
		expect(translation).toBeCloseToVector(new Vector3(10, 0, 0));
		tc.move(new Vector3(0, 0, 1));
		expect(translation).toBeCloseToVector(new Vector3(9, 0, 0));
	});

	it('can lookAt entity', function () {
		var entity1 = world.createEntity();
		entity1.move(3, 7, -10);
		var t1 = entity1.getTranslation();

		var entity2 = world.createEntity();
		entity2.lookAt(entity1);
		entity2.move(0, 0, -t1.length());
		var t2 = entity2.getTranslation();

		expect(t1).toBeCloseToVector(t2);
	});

	it('handles attaching itself to an entity', function () {
		var transformComponent = new TransformComponent();
		var entity = new Entity(world);

		entity.setComponent(transformComponent);
		expect(transformComponent.entity).toBe(entity);
	});

	// should it ever be detached? since it's enforced and there are so many dependencies probably not
	it('handles detaching itself from an entity', function () {
		var transformComponent = new TransformComponent();
		var entity = new Entity(world);

		entity.setComponent(transformComponent);
		entity.clearComponent('transformComponent');
		expect(transformComponent.entity).toBeFalsy();
	});

	it('returns the host entity when calling setTranslation on it', function () {
		var entity = world.createEntity();
		entity.setComponent(new TransformComponent());

		expect(entity.setTranslation(new Vector3(1, 2, 3))).toBe(entity);
	});

	it('handles getTranslation on host the same way as on itself', function () {
		var entity = world.createEntity();
		entity.setComponent(new TransformComponent());
		expect(entity.getTranslation()).toBe(entity.transformComponent.getTranslation());
	});

	it('returns the host entity when calling any transform related method on it', function () {
		var entity = world.createEntity();
		entity.setComponent(new TransformComponent());

		expect(entity.setTranslation(new Vector3(1, 2, 3))).toBe(entity);
		expect(entity.setScale(new Vector3(1, 2, 3))).toBe(entity);
		expect(entity.setRotation(new Vector3(1, 2, 3))).toBe(entity);
		expect(entity.lookAt(new Vector3(1, 2, 3))).toBe(entity);
	});

	it('returns the parent host entity when calling attachChild/detachChild on it', function () {
		var parent = world.createEntity();
		var child = world.createEntity();

		expect(parent.attachChild(child)).toBe(parent);
		expect(parent.detachChild(child)).toBe(parent);
	});

	it('calls TransformComponent.attachChild from the injected "pair" method', function () {
		var parent = world.createEntity();
		var child = world.createEntity();

		parent.attachChild(child);

		expect(parent.transformComponent.children).toEqual([child.transformComponent]);
		expect(child.transformComponent.parent).toEqual(parent.transformComponent);
	});

	it('calls TransformComponent.detachChild from the injected "pair" method', function () {
		var parent = world.createEntity();
		var child = world.createEntity();

		parent.attachChild(child);
		parent.detachChild(child);

		expect(parent.transformComponent.children).toEqual([]);
		expect(child.transformComponent.parent).toBeFalsy();
	});

	describe('called from EntitySelection', function () {
		it('sets the translation of some entities', function () {
			var entity1 = new Entity(world).setComponent(new TransformComponent());
			var entity2 = new Entity(world).setComponent(new TransformComponent());

			new EntitySelection(entity1, entity2).setTranslation(1, 2, 3);

			expect(entity1.transformComponent.transform.translation).toBeCloseToVector(new Vector3(1, 2, 3));
			expect(entity2.transformComponent.transform.translation).toBeCloseToVector(new Vector3(1, 2, 3));
		});

		it('translates some entities', function () {
			var entity1 = new Entity(world).setComponent(new TransformComponent());
			var entity2 = new Entity(world).setComponent(new TransformComponent());

			entity1.setTranslation(11, 22, 33);
			entity2.setTranslation(44, 55, 66);

			new EntitySelection(entity1, entity2).addTranslation(1, 2, 3);

			expect(entity1.transformComponent.transform.translation)
			.toBeCloseToVector(new Vector3(11 + 1, 22 + 2, 33 + 3));

			expect(entity2.transformComponent.transform.translation)
			.toBeCloseToVector(new Vector3(44 + 1, 55 + 2, 66 + 3));
		});

		it('hides some entities', function () {
			var entity = new Entity(world).setComponent(new TransformComponent());
			new EntitySelection(entity).hide();
			expect(entity._hidden).toBeTruthy();
		});
	});

	describe('.applyOnEntity', function () {
		it('sets a TransformComponent when trying to add a 3 element array', function () {
			var entity = new Entity(world);
			var translation = [1, 2, 3];
			entity.set(translation);

			expect(entity.transformComponent).toBeTruthy();
			expect(entity.transformComponent.transform.translation).toBeCloseToVector(new Vector3(1, 2, 3));
		});

		it('modifies the TransformComponent if it already exists when trying to add a 3 element array', function () {
			var entity = new Entity(world);
			var transformComponent = new TransformComponent();
			var transformSystem = new TransformSystem();

			entity.set(transformComponent);
			transformSystem.process([entity]);

			var translation = [1, 2, 3];
			entity.set(translation);

			expect(entity.transformComponent).toBe(transformComponent);
			expect(entity.transformComponent.transform.translation).toBeCloseToVector(new Vector3(1, 2, 3));
		});

		it('sets a TransformComponent when trying to add a {x, y, z} object', function () {
			var entity = new Entity(world);
			var translation = { x: 1, y: 2, z: 3 };
			entity.set(translation);

			expect(entity.transformComponent).toBeTruthy();
			expect(entity.transformComponent.transform.translation).toBeCloseToVector(new Vector3(1, 2, 3));
		});

		it('sets a TransformComponent when trying to add a Transform', function () {
			var entity = new Entity(world);
			var transform = new Transform();
			transform.translation.setDirect(1, 2, 3);
			entity.set(transform);

			expect(entity.transformComponent).toBeTruthy();
			expect(entity.transformComponent.transform.translation).toBeCloseToVector(new Vector3(1, 2, 3));
		});

		it('applies all of the API functions correctly', function (){
			var entity = new Entity(world);
			var childEntity = new Entity(world);
			function traverseFunction(entity){
				expect(entity).toEqual(jasmine.any(Entity));
			}
			entity.set(new TransformComponent());
			childEntity.set(new TransformComponent());

			entity.setTranslation(1, 2, 3);
			expect(entity.getTranslation()).toEqual(new Vector3(1, 2, 3));

			entity.setRotation(0, 0, 0);
			expect(entity.getRotation()).toEqual(new Vector3(0, 0, 0));

			entity.setScale(1, 2, 3);
			expect(entity.getScale()).toEqual(new Vector3(1, 2, 3));

			entity.lookAt(0, 0, 0);

			entity.addTranslation(1, 0, 0);

			entity.setTranslation(1, 2, 3).addTranslation(1, 2, 3);
			expect(entity.getTranslation()).toEqual(new Vector3(2, 4, 6));

			entity.attachChild(childEntity);
			expect(entity.children().size()).toEqual(1);
			expect(childEntity.parent().size()).toEqual(1);

			entity.traverse(traverseFunction);
			entity.traverseUp(traverseFunction);

			entity.detachChild(childEntity);
			expect(entity.children().size()).toEqual(0);
			expect(childEntity.parent().size()).toEqual(0);
		});
	});

	it('gets an EntitySelection of children', function () {
		var parent = world.createEntity();
		var child1 = world.createEntity();
		var child2 = world.createEntity();

		parent.attachChild(child1);
		parent.attachChild(child2);

		var children = parent.children();

		expect(children.contains(child1)).toBeTruthy();
		expect(children.contains(child2)).toBeTruthy();
	});

	it('gets an EntitySelection of parent', function () {
		var parent = world.createEntity();
		var child = world.createEntity();

		parent.attachChild(child);

		var parentSelection = child.parent();

		expect(parentSelection.contains(parent)).toBeTruthy();
	});

	describe('traverse', function () {
		it('traverses the children of an entity with a callback', function () {
			var child21 = world.createEntity('child21');
			var child22 = world.createEntity('child22');

			var child1 = world.createEntity('child1');
			var child2 = world.createEntity('child2').attachChild(child21).attachChild(child22);

			var parent = world.createEntity().attachChild(child1).attachChild(child2);

			var traversed = [];
			parent.traverse(function (entity) {
				traversed.push(entity);
			});

			expect(traversed).toEqual([parent, child1, child2, child21, child22]);
		});

		it('traverses the children of an entity with a callback until false is returned', function () {
			var child21 = world.createEntity('child21');
			var child22 = world.createEntity('child22');

			var child1 = world.createEntity('child1');
			var child2 = world.createEntity('child2').attachChild(child21).attachChild(child22);

			var parent = world.createEntity().attachChild(child1).attachChild(child2);

			var traversed = [];
			parent.traverse(function (entity) {
				traversed.push(entity);
				if (traversed.length >= 3) {
					return false;
				}
			});

			expect(traversed).toEqual([parent, child1, child2]);
		});
	});

	describe('traverseUp', function () {
		it('traverses the parents of an entity with a callback', function () {
			var child21 = world.createEntity('child21');
			var child22 = world.createEntity('child22');

			var child1 = world.createEntity('child1');
			var child2 = world.createEntity('child2').attachChild(child21).attachChild(child22);

			var parent = world.createEntity().attachChild(child1).attachChild(child2);

			var traversed = [];
			child22.traverseUp(function (entity) {
				traversed.push(entity);
			});

			expect(traversed).toEqual([child22, child2, parent]);
		});

		it('traverses the parents of an entity with a callback until false is returned', function () {
			var child21 = world.createEntity('child21');
			var child22 = world.createEntity('child22');

			var child1 = world.createEntity('child1');
			var child2 = world.createEntity('child2').attachChild(child21).attachChild(child22);

			world.createEntity().attachChild(child1).attachChild(child2);

			var traversed = [];
			child22.traverseUp(function (entity) {
				traversed.push(entity);
				return false;
			});

			expect(traversed).toEqual([child22]);
		});
	});

	//! AT: let's isolate this a bit
	// it can't stay in its own describe but it uses some methods of its own
	(function () {
		function getEntity() {
			return world.createEntity().set(new MeshRendererComponent())
				.set(new LightComponent())
				.set(new HtmlComponent());
		}

		function expectEverything(entity, entityHidden, componentsHidden) {
			expect(entity._hidden).toEqual(entityHidden);
			expect(entity.meshRendererComponent.hidden).toEqual(componentsHidden);
			expect(entity.lightComponent.hidden).toEqual(componentsHidden);
			expect(entity.htmlComponent.hidden).toEqual(componentsHidden);
		}

		describe('hide', function () {
			it('can hide an entity and its components', function () {
				var entity = getEntity();

				entity.hide();

				expectEverything(entity, true, true);
			});

			it('can hide an entity and its children and their components', function () {
				var grandparent = getEntity();
				var parent1 = getEntity();
				var parent2 = getEntity();
				var child11 = getEntity();
				var child12 = getEntity();
				var child21 = getEntity();
				var child22 = getEntity();

				grandparent.attachChild(parent1);
				grandparent.attachChild(parent2);
				parent1.attachChild(child11);
				parent1.attachChild(child12);
				parent2.attachChild(child21);
				parent2.attachChild(child22);

				parent1.hide();
				grandparent.hide();

				expectEverything(grandparent, true, true);
				expectEverything(parent1, true, true);
				expectEverything(parent2, false, true);
				expectEverything(child11, false, true);
				expectEverything(child12, false, true);
				expectEverything(child21, false, true);
				expectEverything(child22, false, true);
			});
		});

		describe('show', function () {
			it('can show a hidden entity and its components', function () {
				var entity = getEntity();

				entity.hide();
				entity.show();

				expectEverything(entity, false, false);
			});

			it('can show a hidden entity but keeps its components hidden if an ancestor entity is hidden', function () {
				var grandparent = getEntity();
				var parent1 = getEntity();
				var parent2 = getEntity();
				var child11 = getEntity();
				var child12 = getEntity();
				var child21 = getEntity();
				var child22 = getEntity();

				grandparent.attachChild(parent1);
				grandparent.attachChild(parent2);
				parent1.attachChild(child11);
				parent1.attachChild(child12);
				parent2.attachChild(child21);
				parent2.attachChild(child22);

				grandparent.hide();
				parent1.show();
				child22.show();

				expectEverything(grandparent, true, true);
				expectEverything(parent1, false, true);
				expectEverything(parent2, false, true);
				expectEverything(child11, false, true);
				expectEverything(child12, false, true);
				expectEverything(child21, false, true);
				expectEverything(child22, false, true);
			});
		});

		describe('isHidden', function () {
			it('returns the correct hidden status for one entity', function () {
				var entity1 = getEntity();
				expect(entity1.isHidden()).toBeFalsy();

				var entity2 = getEntity();
				entity2.hide();
				expect(entity2.isHidden()).toBeTruthy();
				entity2.show();
				expect(entity2.isHidden()).toBeFalsy();
			});

			it('returns the correct hidden status for an entity in a hierarchy', function () {
				var grandparent = getEntity();
				var parent1 = getEntity();
				var parent2 = getEntity();
				var child11 = getEntity();
				var child12 = getEntity();
				var child21 = getEntity();
				var child22 = getEntity();

				grandparent.attachChild(parent1);
				grandparent.attachChild(parent2);
				parent1.attachChild(child11);
				parent1.attachChild(child12);
				parent2.attachChild(child21);
				parent2.attachChild(child22);

				parent1.hide();

				expect(grandparent.isHidden()).toBeFalsy();
				expect(parent1.isHidden()).toBeTruthy();
				expect(parent2.isHidden()).toBeFalsy();

				expect(child11.isHidden()).toBeFalsy();
				expect(child12.isHidden()).toBeFalsy();
				expect(child21.isHidden()).toBeFalsy();
				expect(child22.isHidden()).toBeFalsy();
			});
		});

		describe('isVisiblyHidden', function () {
			it('returns the correct visibly hidden status for one entity', function () {
				var entity1 = getEntity();
				expect(entity1.isVisiblyHidden()).toBeFalsy();

				var entity2 = getEntity();
				entity2.hide();
				expect(entity2.isVisiblyHidden()).toBeTruthy();
				entity2.show();
				expect(entity2.isVisiblyHidden()).toBeFalsy();
			});

			it('returns the correct visibly hidden status for an entity in a hierarchy', function () {
				var grandparent = getEntity();
				var parent1 = getEntity();
				var parent2 = getEntity();
				var child11 = getEntity();
				var child12 = getEntity();
				var child21 = getEntity();
				var child22 = getEntity();

				grandparent.attachChild(parent1);
				grandparent.attachChild(parent2);
				parent1.attachChild(child11);
				parent1.attachChild(child12);
				parent2.attachChild(child21);
				parent2.attachChild(child22);

				parent1.hide();

				expect(grandparent.isVisiblyHidden()).toBeFalsy();
				expect(parent1.isVisiblyHidden()).toBeTruthy();
				expect(parent2.isVisiblyHidden()).toBeFalsy();

				expect(child11.isVisiblyHidden()).toBeTruthy();
				expect(child12.isVisiblyHidden()).toBeTruthy();
				expect(child21.isVisiblyHidden()).toBeFalsy();
				expect(child22.isVisiblyHidden()).toBeFalsy();
			});
		});

		//! AT: components will be visible if attached after the entity was hidden
		// same goes for entities attached after the parent was hidden
	})();

	it('can sync', function () {
		var parentEntity = world.createEntity().addToWorld();
		var childEntity = world.createEntity().addToWorld();
		parentEntity.transformComponent.attachChild(childEntity.transformComponent);
		parentEntity.transformComponent.transform.translation.x = 1;
		parentEntity.transformComponent.transform.update();
		parentEntity.transformComponent.setUpdated();

		parentEntity.transformComponent.sync();

		expect(parentEntity.transformComponent.worldTransform.translation.x).toBe(1);
		expect(childEntity.transformComponent.worldTransform.translation.x).toBe(0);

		childEntity.transformComponent.sync();

		expect(childEntity.transformComponent.worldTransform.translation.x).toBe(1);
	});
});

var World = require("../../src/goo/entities/World");
var EntityManager = require("../../src/goo/entities/managers/EntityManager");

describe('EntityManager', function () {
	var world;
	var entityManager;
	beforeEach(function () {
		world = new World();
		entityManager = new EntityManager();
	});

	describe('added & containsEntity', function () {
		var entity1, entity2;
		beforeEach(function () {
			entityManager = new EntityManager();
			entity1 = world.createEntity();
			entity2 = world.createEntity();
		});

		it('adds nothing and contains nothing', function () {
			expect(entityManager.containsEntity(entity1)).toBeFalsy();
			expect(entityManager.containsEntity(entity2)).toBeFalsy();
		});

		it('adds an entity and contains it', function () {
			entityManager.added(entity1);
			expect(entityManager.containsEntity(entity1)).toBeTruthy();
			expect(entityManager.containsEntity(entity2)).toBeFalsy();
		});

		it('adds 2 entities and contains them both', function () {
			entityManager.added(entity1);
			entityManager.added(entity2);
			expect(entityManager.containsEntity(entity1)).toBeTruthy();
			expect(entityManager.containsEntity(entity2)).toBeTruthy();
		});

		it('tries to add the same entity twice and contains it', function () {
			entityManager.added(entity1);
			entityManager.added(entity1); //add again to see what happens
			expect(entityManager.containsEntity(entity1)).toBeTruthy();
		});

		it('adds 2 entities with the same id but different indices', function () {
			entity1.id = 'asd';
			entity2.id = 'asd';
			entityManager.added(entity1);
			entityManager.added(entity2);
			expect(entityManager.containsEntity(entity1)).toBeTruthy();
			expect(entityManager.containsEntity(entity2)).toBeTruthy();
		});
	});

	describe('removed', function () {
		var entity1, entity2;
		beforeEach(function () {
			entityManager = new EntityManager();
			entity1 = world.createEntity();
			entity2 = world.createEntity();
		});

		it('tries to remove a non-added entity', function () {
			entityManager.removed(entity1);
			expect(entityManager.containsEntity(entity1)).toBeFalsy();
		});

		it('removes an entity', function () {
			entityManager.added(entity1);
			entityManager.removed(entity1);
			expect(entityManager.containsEntity(entity1)).toBeFalsy();
		});

		it('removes one entity and leaves the other intact', function () {
			entityManager.added(entity1);
			entityManager.added(entity2);
			entityManager.removed(entity1);
			expect(entityManager.containsEntity(entity1)).toBeFalsy();
			expect(entityManager.containsEntity(entity2)).toBeTruthy();
		});

		it('tries to remove the same entity twice', function () {
			entityManager.added(entity1);
			entityManager.removed(entity1);
			entityManager.removed(entity1);
			expect(entityManager.containsEntity(entity1)).toBeFalsy();
		});
	});

	describe('getEntityById', function () {
		var entity1, entity2, entity3;
		beforeEach(function () {
			entityManager = new EntityManager();
			entity1 = world.createEntity();
			entity2 = world.createEntity();
			entity3 = world.createEntity();
			entityManager.added(entity1);
			entityManager.added(entity3);
		});

		it('gets an entity by its id', function () {
			expect(entityManager.getEntityById(entity1.id)).toEqual(entity1);
			expect(entityManager.getEntityById(entity3.id)).toEqual(entity3);
		});

		it('tries to get a non-added entity by its id', function () {
			expect(entityManager.getEntityById(entity2.id)).toBeUndefined();
		});
	});

	describe('getEntityByName', function () {
		var entity1, entity2, entity3;
		beforeEach(function () {
			entityManager = new EntityManager();
			entity1 = world.createEntity();
			entity2 = world.createEntity();
			entity3 = world.createEntity();
			entityManager.added(entity1);
			entityManager.added(entity3);
		});

		it('gets an entity by its name', function () {
			expect(entityManager.getEntityByName(entity1.name)).toEqual(entity1);
			expect(entityManager.getEntityByName(entity3.name)).toEqual(entity3);
		});

		it('tries to get a non-added entity by its name', function () {
			expect(entityManager.getEntityByName(entity2.name)).toBeUndefined();
		});
	});

	describe('getEntities', function () {
		var entity1, entity2, entity3;
		beforeEach(function () {
			entityManager = new EntityManager();
			entity1 = world.createEntity();
			entity2 = world.createEntity();
			entity3 = world.createEntity();
		});

		it('adds an entity and gets all entities', function () {
			entityManager.added(entity1);
			expect(entityManager.getEntities().length).toEqual(1);
			expect(entityManager.getEntities()).toContain(entity1);
			expect(entityManager.getEntities()).not.toContain(entity2);
			expect(entityManager.getEntities()).not.toContain(entity3);
			expect(entityManager.getEntities()).not.toContain('fishbowl');
		});

		it('adds two entities and gets all entities', function () {
			entityManager.added(entity1);
			entityManager.added(entity2);
			expect(entityManager.getEntities().length).toEqual(2);
			expect(entityManager.getEntities()).toContain(entity1);
			expect(entityManager.getEntities()).toContain(entity2);
			expect(entityManager.getEntities()).not.toContain(entity3);
			expect(entityManager.getEntities()).not.toContain('fishbowl');
		});

		it('adds two entities, removed one and gets all entities', function () {
			entityManager.added(entity1);
			entityManager.added(entity2);
			entityManager.removed(entity1);
			expect(entityManager.getEntities().length).toEqual(1);
			expect(entityManager.getEntities()).not.toContain(entity1);
			expect(entityManager.getEntities()).toContain(entity2);
			expect(entityManager.getEntities()).not.toContain(entity3);
			expect(entityManager.getEntities()).not.toContain('fishbowl');
		});

		it('retrieves two distinct entities with the same id', function () {
			entity1.id = 'e1';
			entity2.id = 'e1';

			entityManager.added(entity1);
			entityManager.added(entity2);

			expect(entityManager.getEntities().length).toEqual(2);

			expect(entityManager.getEntities()).toContain(entity1);
			expect(entityManager.getEntities()).toContain(entity2);
		});
	});

	it('can get top entities', function () {
		var entity1 = world.createEntity('entity1');
		var entity2 = world.createEntity('entity2');
		entity2.transformComponent.attachChild(entity1.transformComponent);
		entityManager.added(entity1);
		entityManager.added(entity2);

		expect(entityManager.getTopEntities()).toContain(entity2);
		expect(entityManager.getTopEntities()).not.toContain(entity1);
	});

	it('can get the number of entities that the Entity Manager holds', function () {
		var entity1 = world.createEntity('entity1');
		var entity2 = world.createEntity('entity2');

		expect(entityManager.size()).toEqual(0);

		entityManager.added(entity1);
		expect(entityManager.size()).toEqual(1);

		entityManager.added(entity2);
		expect(entityManager.size()).toEqual(2);

		entityManager.removed(entity2);
		expect(entityManager.size()).toEqual(1);
	});

	describe('by.id', function () {
		var world;
		var entity1, entity2, entity3;
		beforeEach(function () {
			world = new World();
			entity1 = world.createEntity().addToWorld();
			entity2 = world.createEntity();
			entity3 = world.createEntity().addToWorld();
			world.process();
		});

		it('gets an entity by its id', function () {
			expect(world.by.id(entity1.id).first()).toEqual(entity1);
			expect(world.by.id(entity3.id).first()).toEqual(entity3);
		});

		it('tries to get a non-added entity by its id', function () {
			expect(world.by.id(entity2.id).first()).toBeUndefined();
		});
	});

	describe('by.name', function () {
		var world;
		var entity1, entity2, entity3;
		beforeEach(function () {
			world = new World();
			entity1 = world.createEntity().addToWorld();
			entity2 = world.createEntity();
			entity3 = world.createEntity().addToWorld();
			world.process();
		});

		it('gets an entity by its id', function () {
			expect(world.by.name(entity1.name).first()).toEqual(entity1);
			expect(world.by.name(entity3.name).first()).toEqual(entity3);
		});

		it('tries to get a non-added entity by its id', function () {
			expect(world.by.name(entity2.name).first()).toBeUndefined();
		});
	});
});



















var Entity = require("../../src/goo/entities/Entity");
var LightComponent = require("../../src/goo/entities/components/LightComponent");
var TransformComponent = require("../../src/goo/entities/components/TransformComponent");
var LightingSystem = require("../../src/goo/entities/systems/LightingSystem");
var World = require("../../src/goo/entities/World");

describe('LightingSystem', function () {
	describe('inserted', function () {
		it('will update a light\'s transform', function () {
			var light = jasmine.createSpyObj('Light', ['update']);
			var lightComponent = new LightComponent(light);
			var entity = new Entity().setComponent(lightComponent).setComponent(new TransformComponent());
			var lightingSystem = new LightingSystem();

			lightingSystem.inserted(entity);

			expect(light.update).toHaveBeenCalledWith(entity.transformComponent.worldTransform);
		});
	});

	// testing interaction coming from 'world-space'
	describe('+World', function () {
		it('adds and updates a light when adding an entity with a light component to the world', function () {
			var light = jasmine.createSpyObj('Light', ['update']);
			var lightComponent = new LightComponent(light);
			var lightingSystem = new LightingSystem();

			var world = new World();
			world.setSystem(lightingSystem);
			var entity = world.createEntity(lightComponent).addToWorld();

			world.process();

			expect(lightingSystem.lights).toContain(light);
			expect(light.update).toHaveBeenCalledWith(entity.transformComponent.worldTransform);
		});

		it('adds and updates a light when adding a light component on an existing entity', function () {
			var light = jasmine.createSpyObj('Light', ['update']);
			var lightComponent = new LightComponent(light);
			var lightingSystem = new LightingSystem();

			var world = new World();
			world.setSystem(lightingSystem);
			var entity = world.createEntity().addToWorld();

			world.process();

			entity.setComponent(lightComponent);

			world.process();

			expect(lightingSystem.lights).toContain(light);
			expect(light.update).toHaveBeenCalledWith(entity.transformComponent.worldTransform);
		});
	});
});


describe('test that movement updates transform', function () {
	// what happened here?
});


















var Vector3 = require("../../src/goo/math/Vector3");
var TransformSystem = require("../../src/goo/entities/systems/TransformSystem");
var World = require("../../src/goo/entities/World");

describe('TransformSystem', function () {
	var world;

	function createEntity(x, y, z) {
		var entity = world.createEntity().addToWorld();
		entity.setTranslation(new Vector3(x || 0, y || 0, z || 0));
		return entity;
	}

	beforeEach(function () {
		world = new World();
		world.setSystem(new TransformSystem());
	});

	it('updates the world transform of a single entity', function () {
		var entity = createEntity(1, 2, 3);
		world.process();
		expect(entity.transformComponent.worldTransform.translation).toEqual(new Vector3(1, 2, 3));
	});

	it('updates the world transform of a parent-child structure and propagates correctly', function () {
		var grandParent = createEntity(1, 2, 3);
		var parent = createEntity(1, 2, 3);
		var child = createEntity(1, 2, 3);

		grandParent.attachChild(parent);
		parent.attachChild(child);

		world.process();

		expect(grandParent.transformComponent.worldTransform.translation).toEqual(new Vector3(1, 2, 3));
		expect(parent.transformComponent.worldTransform.translation).toEqual(new Vector3(2, 4, 6));
		expect(child.transformComponent.worldTransform.translation).toEqual(new Vector3(3, 6, 9));

		parent.setTranslation(0, 0, 0);

		world.process();

		expect(grandParent.transformComponent.worldTransform.translation).toEqual(new Vector3(1, 2, 3));
		expect(parent.transformComponent.worldTransform.translation).toEqual(new Vector3(1, 2, 3));
		expect(child.transformComponent.worldTransform.translation).toEqual(new Vector3(2, 4, 6));

		grandParent.setTranslation(0, 0, 0);
		parent.setTranslation(1, 2, 3);
		child.setTranslation(1, 2, 3);

		world.process();

		expect(grandParent.transformComponent.worldTransform.translation).toEqual(new Vector3(0, 0, 0));
		expect(parent.transformComponent.worldTransform.translation).toEqual(new Vector3(1, 2, 3));
		expect(child.transformComponent.worldTransform.translation).toEqual(new Vector3(2, 4, 6));
	});

	it('updates all children correctly in a chain', function () {
		var entityA = createEntity();
		var entityB = createEntity();
		var entityC = createEntity(1, 2, 3);
		var entityD = createEntity();
		var entityE = createEntity();

		entityA.attachChild(entityB);
		entityB.attachChild(entityC);
		entityC.attachChild(entityD);
		entityD.attachChild(entityE);

		world.process();

		expect(entityA.transformComponent.worldTransform.translation).toEqual(new Vector3(0, 0, 0));
		expect(entityB.transformComponent.worldTransform.translation).toEqual(new Vector3(0, 0, 0));
		expect(entityD.transformComponent.worldTransform.translation).toEqual(new Vector3(1, 2, 3));
		expect(entityE.transformComponent.worldTransform.translation).toEqual(new Vector3(1, 2, 3));
	});

	it('updates all children correctly in a chain', function () {
		var entityE = createEntity();
		var entityD = createEntity();
		var entityC = createEntity(1, 2, 3);
		var entityB = createEntity();
		var entityA = createEntity(1, 2, 3);

		entityA.attachChild(entityB);
		entityB.attachChild(entityC);
		entityC.attachChild(entityD);
		entityD.attachChild(entityE);

		world.process();

		expect(entityA.transformComponent.worldTransform.translation).toEqual(new Vector3(1, 2, 3));
		expect(entityB.transformComponent.worldTransform.translation).toEqual(new Vector3(1, 2, 3));
		expect(entityD.transformComponent.worldTransform.translation).toEqual(new Vector3(2, 4, 6));
		expect(entityE.transformComponent.worldTransform.translation).toEqual(new Vector3(2, 4, 6));
	});
});


var Machine = require("../../src/goo/fsmpack/statemachine/Machine");
var State = require("../../src/goo/fsmpack/statemachine/State");
var StateMachineComponent = require("../../src/goo/fsmpack/statemachine/StateMachineComponent");

describe('StateMachineComponent', function () {
	var stateMachineComponent;
	beforeEach(function () {
		stateMachineComponent = new StateMachineComponent();
	});

	it('can run enter on initialisation on all machines', function () {
		var gotData1 = 0, gotData2 = 0;

		// set up machine 1
		var machine1 = new Machine();
		machine1.asyncMode = true;
		stateMachineComponent.addMachine(machine1);

		var state1 = new State('entry');
		machine1.addState(state1);

		state1.addAction({
			ready: function () {},
			enter: function () { gotData1 += 123; },
			exit: function () {},
			update: function () {}
		});


		// set up machine 2
		var machine2 = new Machine();
		machine2.asyncMode = true;
		stateMachineComponent.addMachine(machine2);

		var state2 = new State('entry');
		machine2.addState(state2);

		state2.addAction({
			ready: function () {},
			enter: function () { gotData2 += 234; },
			exit: function () {},
			update: function () {}
		});


		// init
		stateMachineComponent.init();
		stateMachineComponent.doEnter();

		expect(gotData1).toBe(123);
		expect(gotData2).toBe(234);
	});

	it('can run enter on initialisation only on the initial state', function () {
		var gotData1 = 0, gotData2 = 0;

		// set up machine 1
		var machine1 = new Machine();
		machine1.asyncMode = true;

		var state1 = new State('first');
		state1.addAction({
			ready: function () {},
			enter: function () { gotData1 += 123; },
			exit: function () {},
			update: function () {}
		});

		var state2 = new State('second');
		state2.addAction({
			ready: function () {},
			enter: function () { gotData2 += 234; },
			exit: function () {},
			update: function () {}
		});

		machine1.addState(state1);
		machine1.addState(state2);

		stateMachineComponent.addMachine(machine1);

		// init
		stateMachineComponent.init();
		stateMachineComponent.doEnter();

		expect(gotData1).toBe(123);
		expect(gotData2).toBe(0);
	});

	it('can run update', function () {
		var gotData1 = 0, gotData2 = 0;

		// set up machine 1
		var state1 = new State('entry');
		state1.addAction({
			ready: function () {},
			enter: function () {},
			exit: function () {},
			update: function () { gotData1 += 123; }
		});

		var machine1 = new Machine();
		machine1.asyncMode = true;
		machine1.addState(state1);


		// set up machine 2
		var state2 = new State('entry');
		state2.addAction({
			ready: function () {},
			enter: function () {},
			exit: function () {},
			update: function () { gotData2 += 234; }
		});
		var machine2 = new Machine();
		machine2.asyncMode = true;
		machine2.addState(state2);

		stateMachineComponent.addMachine(machine1);
		stateMachineComponent.addMachine(machine2);

		// init
		stateMachineComponent.init();
		stateMachineComponent.doEnter();

		// do update
		stateMachineComponent.update();

		expect(gotData1).toBe(123);
		expect(gotData2).toBe(234);
	});

	it('can transition on the same level', function () {
		var gotData1 = 0, gotData2 = 0, gotData3 = 0;

		// set up machine 1
		var machine1 = new Machine();
		machine1.asyncMode = true;

		var state1 = new State('entry');
		machine1.addState(state1);
		state1.addAction({
			ready: function () {},
			enter: function () {},
			exit: function () { gotData1 += 123; },
			update: function (proxy) { proxy.send('toSecond'); }
		});
		state1.setTransition('toSecond', 'second');

		var state2 = new State('second');
		machine1.addState(state2);
		state2.addAction({
			ready: function () {},
			enter: function () { gotData2 += 234; },
			exit: function () {},
			update: function () { gotData3 += 345; }
		});

		stateMachineComponent.addMachine(machine1);

		// init
		stateMachineComponent.init();
		stateMachineComponent.doEnter();

		// jump to second state
		stateMachineComponent.update();

		// second state update
		stateMachineComponent.update();

		expect(gotData1).toBe(123);
		expect(gotData2).toBe(234);
		expect(gotData3).toBe(345);
	});

	it('can transition down', function () {
		var gotData1 = 0, gotData2 = 0, gotData3 = 0, gotData4 = 0, gotData5 = 0;

		// set up machine 1
		var state1 = new State('entry');
		state1.addAction({
			ready: function () {},
			enter: function () {},
			exit: function () { gotData1 += 123; },
			update: function (proxy) { proxy.send('toSecond'); }
		});
		state1.setTransition('toSecond', 'second');

		var state2 = new State('second');
		state2.addAction({
			ready: function () {},
			enter: function () { gotData2 += 234; },
			exit: function () {},
			update: function () { gotData3 += 345; }
		});


		var state21 = new State('third');
		state21.addAction({
			ready: function () {},
			enter: function () { gotData4 += 456; },
			exit: function () {},
			update: function () { gotData5 += 567; }
		});

		var machine11 = new Machine();
		machine11.asyncMode = true;
		machine11.addState(state21);

		state2.addMachine(machine11);

		var machine1 = new Machine();
		machine1.asyncMode = true;
		machine1.addState(state1);
		machine1.addState(state2);

		stateMachineComponent.addMachine(machine1);

		// init
		stateMachineComponent.init();
		stateMachineComponent.doEnter();

		// jump to second state
		stateMachineComponent.update();

		// second state update
		stateMachineComponent.update();

		expect(gotData1).toBe(123);
		expect(gotData2).toBe(234);
		expect(gotData3).toBe(345);
		expect(gotData4).toBe(456);
		expect(gotData5).toBe(567);
	});

	it('can transition up', function () {
		var gotData1 = 0, gotData2 = 0, gotData3 = 0, gotData4 = 0;

		// set up machine 1
		var state1 = new State('entry');
		state1.addAction({
			ready: function () {},
			enter: function () { gotData1 += 123; },
			exit: function () {},
			update: function (proxy) { proxy.send('toSecond'); }
		});
		state1.setTransition('toSecond', 'second');

		var state2 = new State('second');
		state2.addAction({
			ready: function () {},
			enter: function () {},
			exit: function () { gotData2 += 234; },
			update: function () {}
		});

		var state21 = new State('third');
		state21.addAction({
			ready: function () {},
			enter: function () { gotData3 += 345; },
			exit: function () { gotData4 += 456; },
			update: function (proxy) {proxy.send('toEntry'); }
		});
		state21.setTransition('toEntry', 'entry');

		var machine11 = new Machine();
		machine11.asyncMode = true;
		machine11.addState(state21);

		state2.addMachine(machine11);

		var machine1 = new Machine();
		machine1.asyncMode = true;
		machine1.addState(state1);
		machine1.addState(state2);

		stateMachineComponent.addMachine(machine1);

		// init
		stateMachineComponent.init();
		stateMachineComponent.doEnter();

		// jump to second state
		stateMachineComponent.update();

		// second state update
		stateMachineComponent.update();

		expect(gotData1).toBe(123 * 2);
		expect(gotData2).toBe(234);
		expect(gotData3).toBe(345);
		expect(gotData4).toBe(456);
	});

	it('cancels execution of update on transition', function () {
		var gotData = [0, 0, 0, 0, 0, 0];

		// set up machine 1
		var state1 = new State('entry');
		state1.addAction({
			ready: function () {},
			enter: function () {},
			exit: function () { gotData[0] += 123; },
			update: function () { gotData[1] += 234; }
		});
		state1.addAction({
			ready: function () {},
			enter: function () {},
			exit: function () { gotData[2] += 345; },
			update: function (proxy) { gotData[3] += 456; proxy.send('toSecond'); }
		});
		state1.setTransition('toSecond', 'second');
		state1.addAction({
			ready: function () {},
			enter: function () {},
			exit: function () { gotData[4] += 567; },
			update: function () { gotData[5] += 678; }
		});

		var state2 = new State('second');
		state2.addAction({
			ready: function () {},
			enter: function () {},
			exit: function () {},
			update: function () {}
		});

		var machine1 = new Machine();
		machine1.asyncMode = true;
		machine1.addState(state1);
		machine1.addState(state2);

		stateMachineComponent.addMachine(machine1);

		// init
		stateMachineComponent.init();
		stateMachineComponent.doEnter();

		// jump to second state
		stateMachineComponent.update();

		// second state update
		stateMachineComponent.update();

		expect(gotData[0]).toBe(123);
		expect(gotData[1]).toBe(234);
		expect(gotData[2]).toBe(345);
		expect(gotData[3]).toBe(456);
		expect(gotData[4]).toBe(567);
		expect(gotData[5]).toBe(0);
	});

	it('can transition down 2 levels', function () {
		var gotData = [0, 0, 0, 0, 0, 0, 0];

		// set up machine 1
		var state1 = new State('entry');
		state1.addAction({
			ready: function () {},
			enter: function () {},
			exit: function () { gotData[0] += 123; },
			update: function (proxy) { proxy.send('toSecond'); }
		});
		state1.setTransition('toSecond', 'second');

		var state2 = new State('second');
		state2.addAction({
			ready: function () {},
			enter: function () { gotData[1] += 234; },
			exit: function () {},
			update: function () { gotData[2] += 345; }
		});
		// {
		var state21 = new State('third');
		state21.addAction({
			ready: function () {},
			enter: function () { gotData[3] += 456; },
			exit: function () {},
			update: function () { gotData[4] += 567; }
		});
		// {
		var state211 = new State('fourth');
		state211.addAction({
			ready: function () {},
			enter: function () { gotData[5] += 678; },
			exit: function () {},
			update: function () { gotData[6] += 789; }
		});

		var machine111 = new Machine();
		machine111.asyncMode = true;
		machine111.addState(state211);
		state21.addMachine(machine111);

		var machine11 = new Machine();
		machine11.asyncMode = true;
		machine11.addState(state21);
		state2.addMachine(machine11);

		var machine1 = new Machine();
		machine1.asyncMode = true;
		machine1.addState(state1);
		machine1.addState(state2);

		stateMachineComponent.addMachine(machine1);

		// init
		stateMachineComponent.init();
		stateMachineComponent.doEnter();

		// jump to second state
		stateMachineComponent.update();

		// second state update
		stateMachineComponent.update();

		expect(gotData[0]).toBe(123);
		expect(gotData[1]).toBe(234);
		expect(gotData[2]).toBe(345);
		expect(gotData[3]).toBe(456);
		expect(gotData[4]).toBe(567);
		expect(gotData[5]).toBe(678);
		expect(gotData[6]).toBe(789);
	});

	it('can transition up 2 levels', function () {
		var gotData = [0, 0, 0, 0, 0, 0, 0];

		// set up machine 1
		var state1 = new State('entry');
		state1.addAction({
			ready: function () {},
			enter: function () { gotData[0] += 123; },
			exit: function () { gotData[1] += 234; },
			update: function (proxy) { proxy.send('toSecond'); }
		});
		state1.setTransition('toSecond', 'second');

		var state2 = new State('second');
		state2.addAction({
			ready: function () {},
			enter: function () {},
			exit: function () { gotData[2] += 345; },
			update: function () { gotData[3] += 456; }
		});
		// {
		var state21 = new State('third');
		state21.addAction({
			ready: function () {},
			enter: function () {},
			exit: function () { gotData[4] += 567; },
			update: function () { gotData[5] += 678; }
		});
		// {
		var state211 = new State('fourth');
		state211.addAction({
			ready: function () {},
			enter: function () {},
			exit: function () { gotData[6] += 789; },
			update: function (proxy) { proxy.send('toEntry'); }
		});
		state211.setTransition('toEntry', 'entry');

		var machine111 = new Machine();
		machine111.asyncMode = true;
		machine111.addState(state211);
		state21.addMachine(machine111);

		var machine11 = new Machine();
		machine11.asyncMode = true;
		machine11.addState(state21);
		state2.addMachine(machine11);

		var machine1 = new Machine();
		machine1.asyncMode = true;
		machine1.addState(state1);
		machine1.addState(state2);

		stateMachineComponent.addMachine(machine1);

		// init
		stateMachineComponent.init();
		stateMachineComponent.doEnter();

		// jump to second state
		stateMachineComponent.update();

		// second state update
		stateMachineComponent.update();

		expect(gotData[0]).toBe(123 * 2);
		expect(gotData[1]).toBe(234);
		expect(gotData[2]).toBe(345);
		expect(gotData[3]).toBe(456);
		expect(gotData[4]).toBe(567);
		expect(gotData[5]).toBe(678);
		expect(gotData[6]).toBe(789);
	});
});


var Actions = require("../../src/goo/fsmpack/statemachine/actions/Actions");

describe('Actions', function () {
	it('Every action has a key', function () {
		var allActions = Actions.allActionsArray();
		for (var i=0; i<allActions.length; i++) {
			expect(allActions[i]).toBeTruthy();
		}
	});
});


var InBoxAction = require("../../src/goo/fsmpack/statemachine/actions/InBoxAction");
var Vector3 = require("../../src/goo/math/Vector3");
var World = require("../../src/goo/entities/World");

describe('InBoxAction', function () {
	describe('Check pos against boxes', function () {
		var inBoxAction;
		var fakeFunc = function () {};

		var mockFsm = {
			send: fakeFunc
		};

		var entity, world;

		beforeEach(function () {
			world = new World();
			entity = world.createEntity([0,0,0]);
			mockFsm.entity = entity;
			mockFsm.getOwnerEntity = function () {
				return entity;
			};
		});

		it('box [0, 0, 0], [2, 2, 2] is inside at pos [1,1,1]', function () {
			var settings = {
				point1: [0, 0, 0],
				point2: [2, 2, 2],
				transitions: {
					inside: 'toInsideTransition',
					outside: 'toOutsideTransition'
				}

			};

			inBoxAction = new InBoxAction('testId', settings);

			entity.transformComponent.setTranslation(new Vector3(1, 1, 1));
			spyOn(mockFsm, 'send');

			inBoxAction.update(mockFsm);

			expect(mockFsm.send).toHaveBeenCalledWith(settings.transitions.inside);
		});

		it('box [0, 0, 0], [2, 2, 2] is outside at pos [3,3,3]', function () {
			var settings = {
				point1: [0, 0, 0],
				point2: [2, 2, 2],
				transitions: {
					inside: 'toInsideTransition',
					outside: 'toOutsideTransition'
				}
			};

			inBoxAction = new InBoxAction('testId', settings);

			entity.transformComponent.setTranslation(new Vector3(3, 3, 3));
			spyOn(mockFsm, 'send');
			inBoxAction.update(mockFsm);
			expect(mockFsm.send).toHaveBeenCalledWith(settings.transitions.outside);
		});

		it('box [-90, -100, -100], [-110, 100, 100] is inside at pos [-100,0,0]', function () {
			var settings = {
				point1: [-90, -100, -100],
				point2: [-110, 100, 100],
				transitions: {
					inside: 'toInsideTransition',
					outside: 'toOutsideTransition'
				}
			};

			inBoxAction = new InBoxAction('testId', settings);

			entity.transformComponent.setTranslation(new Vector3(-100, 0, 0));
			spyOn(mockFsm, 'send');
			inBoxAction.update(mockFsm);
			expect(mockFsm.send).toHaveBeenCalledWith(settings.transitions.inside);
		});
	});
});












var path = require('path');
var webpack = require('webpack');

module.exports = function (config) {
	config.set({
		browsers: ['Chrome'],
		captureTimeout: 60000,
		browserDisconnectTimeout: 60000,
		browserNoActivityTimeout: 60000,

		basePath: '../../',

		files: [
			'lib/cannon/cannon.min.js',
			{ pattern: 'test/unit/**/*.mp4', included: false },
			{ pattern: 'test/unit/**/*.png', included: false },
			'test/unit/**/*-test.js'
		],

		frameworks: ['jasmine'],

		plugins: [
			require('karma-coverage'),
			require('karma-jasmine'),
			require('karma-chrome-launcher'),
			require('karma-webpack')
		],

		preprocessors: {
			'test/unit/**/*-test.js': ['webpack']
		},

		reporters: ['dots', 'coverage'],

		coverageReporter: {
			reporters: [{
				type: 'text-summary'
			}, {
				type: 'html',
				dir: 'coverage'
			}]
		},

		singleRun: true,

		webpack: {
			resolve: {
				// Everything relative to repo root
				root: path.resolve(path.join(__dirname, '..', '..'))
			},

			node: {
				fs: 'empty'
			},

			// Instrument code that isn't test or vendor code.
			module: {
				loaders: [{
					test: /\.js?$/,
					include: path.join(__dirname, 'src'),
					loader: 'babel?stage=0'
				}],
				postLoaders: [{
					test: /\.js$/,
					exclude: /(test|node_modules)\//,
					loader: 'istanbul-instrumenter'
				}]
			},

			plugins: [
				new webpack.ProvidePlugin(require('./karmaWebpackProvidePluginSettings'))
			]

		},

		webpackMiddleware: {
			noInfo: true
		}
	});
};

var path = require('path');
var webpack = require('webpack');

module.exports = function (config) {
	config.set({

		// base path, that will be used to resolve files and exclude
		basePath: '../../',

		plugins: [
			require('karma-coverage'),
			require('karma-jasmine'),
			require('karma-chrome-launcher'),
			require('karma-webpack')
		],

		frameworks: ['jasmine'],

		files: [
			'lib/cannon/cannon.min.js',
			{ pattern: 'test/unit/**/*.mp4', included: false },
			{ pattern: 'test/unit/**/*.png', included: false },
			{ pattern: 'test/unit/**/*-test.js' }
		],

		// list of files to exclude
		exclude: [],

		// test results reporter to use
		// possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
		reporters: ['dots', 'coverage'],


		// web server port
		port: 9876,


		// enable / disable colors in the output (reporters and logs)
		colors: true,


		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		// logLevel: config.LOG_INFO,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,


		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera (has to be installed with `npm install karma-opera-launcher`)
		// - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
		// - PhantomJS
		// - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
		browsers: ['Chrome'],

		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 60000,

		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: false,

		preprocessors: {
			// source files, that you wanna generate coverage for
			// do not include tests or libraries
			// (these files will be instrumented by Istanbul)
			'src/**/*.js': ['coverage'],
			'test/unit/**/*-test.js': ['webpack']
		},

		// optionally, configure the reporter
		coverageReporter: {
			type : 'html',
			dir : 'coverage/'
		},

		webpackMiddleware: {
			// webpack-dev-middleware configuration
			// i. e.
			noInfo: true
		},

		webpack: {
			resolve: {
				// Everything relative to repo root
				root: path.resolve(path.join(__dirname, '..', '..'))
			},
			plugins: [
				new webpack.ProvidePlugin(require('./karmaWebpackProvidePluginSettings'))
			]
		}
	});
};


module.exports = {
	CustomMatchers: 'test/unit/CustomMatchers',
	Configs: 'test/unit/loaders/Configs',

	PhysicsSystem: 'src/goo/addons/physicspack/systems/PhysicsSystem',
	MathUtils: 'src/goo/math/MathUtils',
	AmmoComponent: 'src/goo/addons/ammopack/AmmoComponent',
	AmmoSystem: 'src/goo/addons/ammopack/AmmoSystem',
	calculateTriangleMeshShape: 'src/goo/addons/ammopack/calculateTriangleMeshShape',
	Box2DComponent: 'src/goo/addons/box2dpack/components/Box2DComponent',
	Box2DSystem: 'src/goo/addons/box2dpack/systems/Box2DSystem',
	CannonBoxColliderComponent: 'src/goo/addons/cannonpack/CannonBoxColliderComponent',
	CannonCylinderColliderComponent: 'src/goo/addons/cannonpack/CannonCylinderColliderComponent',
	CannonDistanceJointComponent: 'src/goo/addons/cannonpack/CannonDistanceJointComponent',
	CannonPlaneColliderComponent: 'src/goo/addons/cannonpack/CannonPlaneColliderComponent',
	CannonRigidbodyComponent: 'src/goo/addons/cannonpack/CannonRigidbodyComponent',
	CannonSphereColliderComponent: 'src/goo/addons/cannonpack/CannonSphereColliderComponent',
	CannonSystem: 'src/goo/addons/cannonpack/CannonSystem',
	CannonTerrainColliderComponent: 'src/goo/addons/cannonpack/CannonTerrainColliderComponent',
	GamepadComponent: 'src/goo/addons/gamepadpack/GamepadComponent',
	GamepadData: 'src/goo/addons/gamepadpack/GamepadData',
	GamepadSystem: 'src/goo/addons/gamepadpack/GamepadSystem',
	LineRenderer: 'src/goo/addons/linerenderpack/LineRenderer',
	LineRenderSystem: 'src/goo/addons/linerenderpack/LineRenderSystem',
	P2Component: 'src/goo/addons/p2pack/P2Component',
	P2System: 'src/goo/addons/p2pack/P2System',
	BoxCollider: 'src/goo/addons/physicspack/colliders/BoxCollider',
	Collider: 'src/goo/addons/physicspack/colliders/Collider',
	CylinderCollider: 'src/goo/addons/physicspack/colliders/CylinderCollider',
	MeshCollider: 'src/goo/addons/physicspack/colliders/MeshCollider',
	PlaneCollider: 'src/goo/addons/physicspack/colliders/PlaneCollider',
	SphereCollider: 'src/goo/addons/physicspack/colliders/SphereCollider',
	AbstractColliderComponent: 'src/goo/addons/physicspack/components/AbstractColliderComponent',
	AbstractRigidBodyComponent: 'src/goo/addons/physicspack/components/AbstractRigidBodyComponent',
	ColliderComponent: 'src/goo/addons/physicspack/components/ColliderComponent',
	RigidBodyComponent: 'src/goo/addons/physicspack/components/RigidBodyComponent',
	BallJoint: 'src/goo/addons/physicspack/joints/BallJoint',
	HingeJoint: 'src/goo/addons/physicspack/joints/HingeJoint',
	PhysicsJoint: 'src/goo/addons/physicspack/joints/PhysicsJoint',
	PhysicsMaterial: 'src/goo/addons/physicspack/PhysicsMaterial',
	RaycastResult: 'src/goo/addons/physicspack/RaycastResult',
	PhysicsBoxDebugShape: 'src/goo/addons/physicspack/shapes/PhysicsBoxDebugShape',
	PhysicsCylinderDebugShape: 'src/goo/addons/physicspack/shapes/PhysicsCylinderDebugShape',
	PhysicsPlaneDebugShape: 'src/goo/addons/physicspack/shapes/PhysicsPlaneDebugShape',
	PhysicsSphereDebugShape: 'src/goo/addons/physicspack/shapes/PhysicsSphereDebugShape',
	AbstractPhysicsSystem: 'src/goo/addons/physicspack/systems/AbstractPhysicsSystem',
	ColliderSystem: 'src/goo/addons/physicspack/systems/ColliderSystem',
	PhysicsDebugRenderSystem: 'src/goo/addons/physicspack/systems/PhysicsDebugRenderSystem',
	Pool: 'src/goo/addons/physicspack/util/Pool',
	SoundManager2Component: 'src/goo/addons/soundmanager2pack/components/SoundManager2Component',
	SoundManager2System: 'src/goo/addons/soundmanager2pack/systems/SoundManager2System',
	Forrest: 'src/goo/addons/terrainpack/Forrest',
	Terrain: 'src/goo/addons/terrainpack/Terrain',
	TerrainSurface: 'src/goo/addons/terrainpack/TerrainSurface',
	Vegetation: 'src/goo/addons/terrainpack/Vegetation',
	FlatWaterRenderer: 'src/goo/addons/waterpack/FlatWaterRenderer',
	ProjectedGrid: 'src/goo/addons/waterpack/ProjectedGrid',
	ProjectedGridWaterRenderer: 'src/goo/addons/waterpack/ProjectedGridWaterRenderer',
	BinaryLerpSource: 'src/goo/animationpack/blendtree/BinaryLerpSource',
	ClipSource: 'src/goo/animationpack/blendtree/ClipSource',
	FrozenClipSource: 'src/goo/animationpack/blendtree/FrozenClipSource',
	ManagedTransformSource: 'src/goo/animationpack/blendtree/ManagedTransformSource',
	AbstractAnimationChannel: 'src/goo/animationpack/clip/AbstractAnimationChannel',
	AnimationClip: 'src/goo/animationpack/clip/AnimationClip',
	AnimationClipInstance: 'src/goo/animationpack/clip/AnimationClipInstance',
	InterpolatedFloatChannel: 'src/goo/animationpack/clip/InterpolatedFloatChannel',
	JointChannel: 'src/goo/animationpack/clip/JointChannel',
	JointData: 'src/goo/animationpack/clip/JointData',
	TransformChannel: 'src/goo/animationpack/clip/TransformChannel',
	TransformData: 'src/goo/animationpack/clip/TransformData',
	TriggerChannel: 'src/goo/animationpack/clip/TriggerChannel',
	TriggerData: 'src/goo/animationpack/clip/TriggerData',
	AnimationComponent: 'src/goo/animationpack/components/AnimationComponent',
	Joint: 'src/goo/animationpack/Joint',
	AnimationLayer: 'src/goo/animationpack/layer/AnimationLayer',
	LayerLerpBlender: 'src/goo/animationpack/layer/LayerLerpBlender',
	Skeleton: 'src/goo/animationpack/Skeleton',
	SkeletonPose: 'src/goo/animationpack/SkeletonPose',
	AbstractState: 'src/goo/animationpack/state/AbstractState',
	AbstractTransitionState: 'src/goo/animationpack/state/AbstractTransitionState',
	FadeTransitionState: 'src/goo/animationpack/state/FadeTransitionState',
	FrozenTransitionState: 'src/goo/animationpack/state/FrozenTransitionState',
	SteadyState: 'src/goo/animationpack/state/SteadyState',
	SyncFadeTransitionState: 'src/goo/animationpack/state/SyncFadeTransitionState',
	AnimationSystem: 'src/goo/animationpack/systems/AnimationSystem',
	BoundingVolumeMeshBuilder: 'src/goo/debugpack/BoundingVolumeMeshBuilder',
	MarkerComponent: 'src/goo/debugpack/components/MarkerComponent',
	DebugDrawHelper: 'src/goo/debugpack/DebugDrawHelper',
	Debugger: 'src/goo/debugpack/Debugger',
	EntityCounter: 'src/goo/debugpack/EntityCounter',
	CameraDebug: 'src/goo/debugpack/shapes/CameraDebug',
	LightDebug: 'src/goo/debugpack/shapes/LightDebug',
	MeshRendererDebug: 'src/goo/debugpack/shapes/MeshRendererDebug',
	SkeletonDebug: 'src/goo/debugpack/shapes/SkeletonDebug',
	DebugRenderSystem: 'src/goo/debugpack/systems/DebugRenderSystem',
	MarkerSystem: 'src/goo/debugpack/systems/MarkerSystem',
	Bus: 'src/goo/entities/Bus',
	CameraComponent: 'src/goo/entities/components/CameraComponent',
	Component: 'src/goo/entities/components/Component',
	CssTransformComponent: 'src/goo/entities/components/CssTransformComponent',
	Dom3dComponent: 'src/goo/entities/components/Dom3dComponent',
	HtmlComponent: 'src/goo/entities/components/HtmlComponent',
	LightComponent: 'src/goo/entities/components/LightComponent',
	MeshDataComponent: 'src/goo/entities/components/MeshDataComponent',
	MeshRendererComponent: 'src/goo/entities/components/MeshRendererComponent',
	MovementComponent: 'src/goo/entities/components/MovementComponent',
	ParticleComponent: 'src/goo/entities/components/ParticleComponent',
	PortalComponent: 'src/goo/entities/components/PortalComponent',
	ScriptComponent: 'src/goo/entities/components/ScriptComponent',
	SoundComponent: 'src/goo/entities/components/SoundComponent',
	TextComponent: 'src/goo/entities/components/TextComponent',
	TransformComponent: 'src/goo/entities/components/TransformComponent',
	Entity: 'src/goo/entities/Entity',
	EntitySelection: 'src/goo/entities/EntitySelection',
	EntityUtils: 'src/goo/entities/EntityUtils',
	GooRunner: 'src/goo/entities/GooRunner',
	EntityManager: 'src/goo/entities/managers/EntityManager',
	Manager: 'src/goo/entities/managers/Manager',
	Selection: 'src/goo/entities/Selection',
	SystemBus: 'src/goo/entities/SystemBus',
	BoundingUpdateSystem: 'src/goo/entities/systems/BoundingUpdateSystem',
	CameraSystem: 'src/goo/entities/systems/CameraSystem',
	CssTransformSystem: 'src/goo/entities/systems/CssTransformSystem',
	Dom3dSystem: 'src/goo/entities/systems/Dom3dSystem',
	GridRenderSystem: 'src/goo/entities/systems/GridRenderSystem',
	HtmlSystem: 'src/goo/entities/systems/HtmlSystem',
	LightingSystem: 'src/goo/entities/systems/LightingSystem',
	MovementSystem: 'src/goo/entities/systems/MovementSystem',
	ParticlesSystem: 'src/goo/entities/systems/ParticlesSystem',
	PickingSystem: 'src/goo/entities/systems/PickingSystem',
	PortalSystem: 'src/goo/entities/systems/PortalSystem',
	RenderSystem: 'src/goo/entities/systems/RenderSystem',
	ScriptSystem: 'src/goo/entities/systems/ScriptSystem',
	SoundSystem: 'src/goo/entities/systems/SoundSystem',
	System: 'src/goo/entities/systems/System',
	TextSystem: 'src/goo/entities/systems/TextSystem',
	TransformSystem: 'src/goo/entities/systems/TransformSystem',
	World: 'src/goo/entities/World',
	ProximityComponent: 'src/goo/fsmpack/proximity/ProximityComponent',
	ProximitySystem: 'src/goo/fsmpack/proximity/ProximitySystem',
	Action: 'src/goo/fsmpack/statemachine/actions/Action',
	Actions: 'src/goo/fsmpack/statemachine/actions/Actions',
	AddLightAction: 'src/goo/fsmpack/statemachine/actions/AddLightAction',
	AddPositionAction: 'src/goo/fsmpack/statemachine/actions/AddPositionAction',
	AddVariableAction: 'src/goo/fsmpack/statemachine/actions/AddVariableAction',
	ApplyImpulseAction: 'src/goo/fsmpack/statemachine/actions/ApplyImpulseAction',
	ArrowsAction: 'src/goo/fsmpack/statemachine/actions/ArrowsAction',
	CollidesAction: 'src/goo/fsmpack/statemachine/actions/CollidesAction',
	CompareCounterAction: 'src/goo/fsmpack/statemachine/actions/CompareCounterAction',
	CompareCountersAction: 'src/goo/fsmpack/statemachine/actions/CompareCountersAction',
	CompareDistanceAction: 'src/goo/fsmpack/statemachine/actions/CompareDistanceAction',
	CopyJointTransformAction: 'src/goo/fsmpack/statemachine/actions/CopyJointTransformAction',
	DollyZoomAction: 'src/goo/fsmpack/statemachine/actions/DollyZoomAction',
	EmitAction: 'src/goo/fsmpack/statemachine/actions/EmitAction',
	EvalAction: 'src/goo/fsmpack/statemachine/actions/EvalAction',
	FireAction: 'src/goo/fsmpack/statemachine/actions/FireAction',
	GetPositionAction: 'src/goo/fsmpack/statemachine/actions/GetPositionAction',
	HideAction: 'src/goo/fsmpack/statemachine/actions/HideAction',
	HtmlAction: 'src/goo/fsmpack/statemachine/actions/HtmlAction',
	InBoxAction: 'src/goo/fsmpack/statemachine/actions/InBoxAction',
	IncrementCounterAction: 'src/goo/fsmpack/statemachine/actions/IncrementCounterAction',
	InFrustumAction: 'src/goo/fsmpack/statemachine/actions/InFrustumAction',
	KeyDownAction: 'src/goo/fsmpack/statemachine/actions/KeyDownAction',
	KeyPressedAction: 'src/goo/fsmpack/statemachine/actions/KeyPressedAction',
	KeyUpAction: 'src/goo/fsmpack/statemachine/actions/KeyUpAction',
	LogMessageAction: 'src/goo/fsmpack/statemachine/actions/LogMessageAction',
	LookAtAction: 'src/goo/fsmpack/statemachine/actions/LookAtAction',
	MouseDownAction: 'src/goo/fsmpack/statemachine/actions/MouseDownAction',
	MouseMoveAction: 'src/goo/fsmpack/statemachine/actions/MouseMoveAction',
	MouseUpAction: 'src/goo/fsmpack/statemachine/actions/MouseUpAction',
	MoveAction: 'src/goo/fsmpack/statemachine/actions/MoveAction',
	MultiplyVariableAction: 'src/goo/fsmpack/statemachine/actions/MultiplyVariableAction',
	NumberCompareAction: 'src/goo/fsmpack/statemachine/actions/NumberCompareAction',
	PauseAnimationAction: 'src/goo/fsmpack/statemachine/actions/PauseAnimationAction',
	PickAction: 'src/goo/fsmpack/statemachine/actions/PickAction',
	PickAndExitAction: 'src/goo/fsmpack/statemachine/actions/PickAndExitAction',
	RandomTransitionAction: 'src/goo/fsmpack/statemachine/actions/RandomTransitionAction',
	RemoveAction: 'src/goo/fsmpack/statemachine/actions/RemoveAction',
	RemoveLightAction: 'src/goo/fsmpack/statemachine/actions/RemoveLightAction',
	RemoveParticlesAction: 'src/goo/fsmpack/statemachine/actions/RemoveParticlesAction',
	ResumeAnimationAction: 'src/goo/fsmpack/statemachine/actions/ResumeAnimationAction',
	RotateAction: 'src/goo/fsmpack/statemachine/actions/RotateAction',
	ScaleAction: 'src/goo/fsmpack/statemachine/actions/ScaleAction',
	SetAnimationAction: 'src/goo/fsmpack/statemachine/actions/SetAnimationAction',
	SetClearColorAction: 'src/goo/fsmpack/statemachine/actions/SetClearColorAction',
	SetCounterAction: 'src/goo/fsmpack/statemachine/actions/SetCounterAction',
	SetLightRangeAction: 'src/goo/fsmpack/statemachine/actions/SetLightRangeAction',
	SetPositionAction: 'src/goo/fsmpack/statemachine/actions/SetPositionAction',
	SetRenderTargetAction: 'src/goo/fsmpack/statemachine/actions/SetRenderTargetAction',
	SetRotationAction: 'src/goo/fsmpack/statemachine/actions/SetRotationAction',
	SetVariableAction: 'src/goo/fsmpack/statemachine/actions/SetVariableAction',
	ShakeAction: 'src/goo/fsmpack/statemachine/actions/ShakeAction',
	ShowAction: 'src/goo/fsmpack/statemachine/actions/ShowAction',
	SmokeAction: 'src/goo/fsmpack/statemachine/actions/SmokeAction',
	SoundFadeInAction: 'src/goo/fsmpack/statemachine/actions/SoundFadeInAction',
	SoundFadeOutAction: 'src/goo/fsmpack/statemachine/actions/SoundFadeOutAction',
	SwitchCameraAction: 'src/goo/fsmpack/statemachine/actions/SwitchCameraAction',
	TagAction: 'src/goo/fsmpack/statemachine/actions/TagAction',
	TransitionAction: 'src/goo/fsmpack/statemachine/actions/TransitionAction',
	TransitionOnMessageAction: 'src/goo/fsmpack/statemachine/actions/TransitionOnMessageAction',
	TriggerEnterAction: 'src/goo/fsmpack/statemachine/actions/TriggerEnterAction',
	TriggerLeaveAction: 'src/goo/fsmpack/statemachine/actions/TriggerLeaveAction',
	TweenLightColorAction: 'src/goo/fsmpack/statemachine/actions/TweenLightColorAction',
	TweenLookAtAction: 'src/goo/fsmpack/statemachine/actions/TweenLookAtAction',
	TweenMoveAction: 'src/goo/fsmpack/statemachine/actions/TweenMoveAction',
	TweenOpacityAction: 'src/goo/fsmpack/statemachine/actions/TweenOpacityAction',
	TweenRotationAction: 'src/goo/fsmpack/statemachine/actions/TweenRotationAction',
	TweenScaleAction: 'src/goo/fsmpack/statemachine/actions/TweenScaleAction',
	TweenTextureOffsetAction: 'src/goo/fsmpack/statemachine/actions/TweenTextureOffsetAction',
	WaitAction: 'src/goo/fsmpack/statemachine/actions/WaitAction',
	WasdAction: 'src/goo/fsmpack/statemachine/actions/WasdAction',
	FSMUtil: 'src/goo/fsmpack/statemachine/FSMUtil',
	FsmUtils: 'src/goo/fsmpack/statemachine/FsmUtils',
	Machine: 'src/goo/fsmpack/statemachine/Machine',
	State: 'src/goo/fsmpack/statemachine/State',
	StateMachineComponent: 'src/goo/fsmpack/statemachine/StateMachineComponent',
	StateMachineSystem: 'src/goo/fsmpack/statemachine/StateMachineSystem',
	FilledPolygon: 'src/goo/geometrypack/FilledPolygon',
	PolyLine: 'src/goo/geometrypack/PolyLine',
	RegularPolygon: 'src/goo/geometrypack/RegularPolygon',
	Surface: 'src/goo/geometrypack/Surface',
	TextMeshGenerator: 'src/goo/geometrypack/text/TextMeshGenerator',
	Triangle: 'src/goo/geometrypack/Triangle',
	DdsUtils: 'src/goo/loaders/dds/DdsUtils',
	LogicInterface: 'src/goo/logicpack/logic/LogicInterface',
	LogicLayer: 'src/goo/logicpack/logic/LogicLayer',
	LogicNode: 'src/goo/logicpack/logic/LogicNode',
	LogicNodeAdd: 'src/goo/logicpack/logic/LogicNodeAdd',
	LogicNodeApplyMatrix: 'src/goo/logicpack/logic/LogicNodeApplyMatrix',
	LogicNodeConstVec3: 'src/goo/logicpack/logic/LogicNodeConstVec3',
	LogicNodeDebug: 'src/goo/logicpack/logic/LogicNodeDebug',
	LogicNodeEntityProxy: 'src/goo/logicpack/logic/LogicNodeEntityProxy',
	LogicNodeFloat: 'src/goo/logicpack/logic/LogicNodeFloat',
	LogicNodeInput: 'src/goo/logicpack/logic/LogicNodeInput',
	LogicNodeInt: 'src/goo/logicpack/logic/LogicNodeInt',
	LogicNodeLightComponent: 'src/goo/logicpack/logic/LogicNodeLightComponent',
	LogicNodeMax: 'src/goo/logicpack/logic/LogicNodeMax',
	LogicNodeMeshRendererComponent: 'src/goo/logicpack/logic/LogicNodeMeshRendererComponent',
	LogicNodeMouse: 'src/goo/logicpack/logic/LogicNodeMouse',
	LogicNodeMultiply: 'src/goo/logicpack/logic/LogicNodeMultiply',
	LogicNodeMultiplyFloat: 'src/goo/logicpack/logic/LogicNodeMultiplyFloat',
	LogicNodeOutput: 'src/goo/logicpack/logic/LogicNodeOutput',
	LogicNodeRandom: 'src/goo/logicpack/logic/LogicNodeRandom',
	LogicNodeRotationMatrix: 'src/goo/logicpack/logic/LogicNodeRotationMatrix',
	LogicNodes: 'src/goo/logicpack/logic/LogicNodes',
	LogicNodeSine: 'src/goo/logicpack/logic/LogicNodeSine',
	LogicNodeSub: 'src/goo/logicpack/logic/LogicNodeSub',
	LogicNodeTime: 'src/goo/logicpack/logic/LogicNodeTime',
	LogicNodeTransformComponent: 'src/goo/logicpack/logic/LogicNodeTransformComponent',
	LogicNodeVec3: 'src/goo/logicpack/logic/LogicNodeVec3',
	LogicNodeVec3Add: 'src/goo/logicpack/logic/LogicNodeVec3Add',
	LogicNodeWASD: 'src/goo/logicpack/logic/LogicNodeWASD',
	LogicNodeWASD2: 'src/goo/logicpack/logic/LogicNodeWASD2',
	LogicComponent: 'src/goo/logicpack/LogicComponent',
	LogicSystem: 'src/goo/logicpack/LogicSystem',
	Matrix: 'src/goo/math/Matrix',
	Matrix2: 'src/goo/math/Matrix2',
	Matrix2x2: 'src/goo/math/Matrix2x2',
	Matrix3: 'src/goo/math/Matrix3',
	Matrix3x3: 'src/goo/math/Matrix3x3',
	Matrix4: 'src/goo/math/Matrix4',
	Matrix4x4: 'src/goo/math/Matrix4x4',
	Plane: 'src/goo/math/Plane',
	Quaternion: 'src/goo/math/Quaternion',
	Ray: 'src/goo/math/Ray',
	Spline: 'src/goo/math/splines/Spline',
	SplineWalker: 'src/goo/math/splines/SplineWalker',
	Transform: 'src/goo/math/Transform',
	Vector: 'src/goo/math/Vector',
	Vector2: 'src/goo/math/Vector2',
	Vector3: 'src/goo/math/Vector3',
	Vector4: 'src/goo/math/Vector4',
	Noise: 'src/goo/noise/Noise',
	ValueNoise: 'src/goo/noise/ValueNoise',
	OccludeeComponent: 'src/goo/occlusionpack/OccludeeComponent',
	OccluderComponent: 'src/goo/occlusionpack/OccluderComponent',
	OcclusionPartitioner: 'src/goo/occlusionpack/OcclusionPartitioner',
	BoundingBoxOcclusionChecker: 'src/goo/occlusionpack/scanline/BoundingBoxOcclusionChecker',
	BoundingSphereOcclusionChecker: 'src/goo/occlusionpack/scanline/BoundingSphereOcclusionChecker',
	Edge: 'src/goo/occlusionpack/scanline/Edge',
	EdgeData: 'src/goo/occlusionpack/scanline/EdgeData',
	EdgeMap: 'src/goo/occlusionpack/scanline/EdgeMap',
	OccludeeTriangleData: 'src/goo/occlusionpack/scanline/OccludeeTriangleData',
	OccluderTriangleData: 'src/goo/occlusionpack/scanline/OccluderTriangleData',
	SoftwareRenderer: 'src/goo/occlusionpack/scanline/SoftwareRenderer',
	Particle: 'src/goo/particles/Particle',
	ParticleEmitter: 'src/goo/particles/ParticleEmitter',
	ParticleInfluence: 'src/goo/particles/ParticleInfluence',
	ParticleLib: 'src/goo/particles/ParticleLib',
	ParticleUtils: 'src/goo/particles/ParticleUtils',
	BloomPass: 'src/goo/passpack/BloomPass',
	BlurPass: 'src/goo/passpack/BlurPass',
	DepthPass: 'src/goo/passpack/DepthPass',
	DofPass: 'src/goo/passpack/DofPass',
	DogPass: 'src/goo/passpack/DogPass',
	MotionBlurPass: 'src/goo/passpack/MotionBlurPass',
	PassLib: 'src/goo/passpack/PassLib',
	ShaderLibExtra: 'src/goo/passpack/ShaderLibExtra',
	SsaoPass: 'src/goo/passpack/SsaoPass',
	BoundingTree: 'src/goo/picking/BoundingTree',
	PrimitivePickLogic: 'src/goo/picking/PrimitivePickLogic',
	DoubleQuad: 'src/goo/quadpack/DoubleQuad',
	QuadComponent: 'src/goo/quadpack/QuadComponent',
	BoundingBox: 'src/goo/renderer/bounds/BoundingBox',
	BoundingSphere: 'src/goo/renderer/bounds/BoundingSphere',
	BoundingVolume: 'src/goo/renderer/bounds/BoundingVolume',
	BufferData: 'src/goo/renderer/BufferData',
	BufferUtils: 'src/goo/renderer/BufferUtils',
	Camera: 'src/goo/renderer/Camera',
	Capabilities: 'src/goo/renderer/Capabilities',
	DirectionalLight: 'src/goo/renderer/light/DirectionalLight',
	Light: 'src/goo/renderer/light/Light',
	PointLight: 'src/goo/renderer/light/PointLight',
	SpotLight: 'src/goo/renderer/light/SpotLight',
	Material: 'src/goo/renderer/Material',
	MeshData: 'src/goo/renderer/MeshData',
	Composer: 'src/goo/renderer/pass/Composer',
	FullscreenPass: 'src/goo/renderer/pass/FullscreenPass',
	FullscreenUtil: 'src/goo/renderer/pass/FullscreenUtil',
	FullscreenUtils: 'src/goo/renderer/pass/FullscreenUtils',
	Pass: 'src/goo/renderer/pass/Pass',
	RenderPass: 'src/goo/renderer/pass/RenderPass',
	RenderTarget: 'src/goo/renderer/pass/RenderTarget',
	ContextLost: 'src/goo/renderer/Renderer+ContextLost',
	Renderer: 'src/goo/renderer/Renderer',
	RendererRecord: 'src/goo/renderer/RendererRecord',
	RendererUtils: 'src/goo/renderer/RendererUtils',
	RenderInfo: 'src/goo/renderer/RenderInfo',
	RenderQueue: 'src/goo/renderer/RenderQueue',
	RenderStats: 'src/goo/renderer/RenderStats',
	Shader: 'src/goo/renderer/Shader',
	ShaderCall: 'src/goo/renderer/ShaderCall',
	ShaderBuilder: 'src/goo/renderer/shaders/ShaderBuilder',
	ShaderFragment: 'src/goo/renderer/shaders/ShaderFragment',
	ShaderLib: 'src/goo/renderer/shaders/ShaderLib',
	SimplePartitioner: 'src/goo/renderer/SimplePartitioner',
	TaskScheduler: 'src/goo/renderer/TaskScheduler',
	Texture: 'src/goo/renderer/Texture',
	TextureCreator: 'src/goo/renderer/TextureCreator',
	AxisAlignedCamControlScript: 'src/goo/scriptpack/AxisAlignedCamControlScript',
	BasicControlScript: 'src/goo/scriptpack/BasicControlScript',
	ButtonScript: 'src/goo/scriptpack/ButtonScript',
	CannonPickScript: 'src/goo/scriptpack/CannonPickScript',
	FlyControlScript: 'src/goo/scriptpack/FlyControlScript',
	GroundBoundMovementScript: 'src/goo/scriptpack/GroundBoundMovementScript',
	HeightMapBoundingScript: 'src/goo/scriptpack/HeightMapBoundingScript',
	LensFlareScript: 'src/goo/scriptpack/LensFlareScript',
	MouseLookControlScript: 'src/goo/scriptpack/MouseLookControlScript',
	OrbitNPanControlScript: 'src/goo/scriptpack/OrbitNPanControlScript',
	PanCamScript: 'src/goo/scriptpack/PanCamScript',
	PickAndRotateScript: 'src/goo/scriptpack/PickAndRotateScript',
	PolyBoundingScript: 'src/goo/scriptpack/PolyBoundingScript',
	RotationScript: 'src/goo/scriptpack/RotationScript',
	ScriptRegister: 'src/goo/scriptpack/ScriptRegister',
	SparseHeightMapBoundingScript: 'src/goo/scriptpack/SparseHeightMapBoundingScript',
	WasdControlScript: 'src/goo/scriptpack/WasdControlScript',
	WorldFittedTerrainScript: 'src/goo/scriptpack/WorldFittedTerrainScript',
	OrbitCamControlScript: 'src/goo/scripts/OrbitCamControlScript',
	Scripts: 'src/goo/scripts/Scripts',
	ScriptUtils: 'src/goo/scripts/ScriptUtils',
	Box: 'src/goo/shapes/Box',
	Cone: 'src/goo/shapes/Cone',
	Cylinder: 'src/goo/shapes/Cylinder',
	Disk: 'src/goo/shapes/Disk',
	Grid: 'src/goo/shapes/Grid',
	Quad: 'src/goo/shapes/Quad',
	SimpleBox: 'src/goo/shapes/SimpleBox',
	Sphere: 'src/goo/shapes/Sphere',
	TextureGrid: 'src/goo/shapes/TextureGrid',
	Torus: 'src/goo/shapes/Torus',
	AudioContext: 'src/goo/sound/AudioContext',
	OscillatorSound: 'src/goo/sound/OscillatorSound',
	Sound: 'src/goo/sound/Sound',
	AbstractTimelineChannel: 'src/goo/timelinepack/AbstractTimelineChannel',
	EventChannel: 'src/goo/timelinepack/EventChannel',
	TimelineComponent: 'src/goo/timelinepack/TimelineComponent',
	TimelineSystem: 'src/goo/timelinepack/TimelineSystem',
	ValueChannel: 'src/goo/timelinepack/ValueChannel',
	Ajax: 'src/goo/util/Ajax',
	ArrayUtil: 'src/goo/util/ArrayUtil',
	ArrayUtils: 'src/goo/util/ArrayUtils',
	CanvasUtils: 'src/goo/util/CanvasUtils',
	AtlasNode: 'src/goo/util/combine/AtlasNode',
	EntityCombiner: 'src/goo/util/combine/EntityCombiner',
	Rectangle: 'src/goo/util/combine/Rectangle',
	EventTarget: 'src/goo/util/EventTarget',
	GameUtils: 'src/goo/util/GameUtils',
	Gizmo: 'src/goo/util/gizmopack/Gizmo',
	GizmoRenderSystem: 'src/goo/util/gizmopack/GizmoRenderSystem',
	GlobalRotationGizmo: 'src/goo/util/gizmopack/GlobalRotationGizmo',
	GlobalTranslationGizmo: 'src/goo/util/gizmopack/GlobalTranslationGizmo',
	RotationGizmo: 'src/goo/util/gizmopack/RotationGizmo',
	ScaleGizmo: 'src/goo/util/gizmopack/ScaleGizmo',
	TranslationGizmo: 'src/goo/util/gizmopack/TranslationGizmo',
	Logo: 'src/goo/util/Logo',
	MeshBuilder: 'src/goo/util/MeshBuilder',
	ObjectUtil: 'src/goo/util/ObjectUtil',
	ObjectUtils: 'src/goo/util/ObjectUtils',
	ParticleSystemUtils: 'src/goo/util/ParticleSystemUtils',
	PromiseUtil: 'src/goo/util/PromiseUtil',
	PromiseUtils: 'src/goo/util/PromiseUtils',
	Rc4Random: 'src/goo/util/Rc4Random',
	rsvp: 'src/goo/util/rsvp',
	ShapeCreatorMemoized: 'src/goo/util/ShapeCreatorMemoized',
	Skybox: 'src/goo/util/Skybox',
	Snow: 'src/goo/util/Snow',
	SoundCreator: 'src/goo/util/SoundCreator',
	Stats: 'src/goo/util/Stats',
	StringUtil: 'src/goo/util/StringUtil',
	StringUtils: 'src/goo/util/StringUtils',
	TangentGenerator: 'src/goo/util/TangentGenerator',
	TWEEN: 'src/goo/util/TWEEN',
};

var EntityConfig = require("./loaders/helpers/EntityConfig");
var AnimationConfig = require("./loaders/helpers/AnimationConfig");
var MaterialConfig = require("./loaders/helpers/MaterialConfig");
var MeshConfig = require("./loaders/helpers/MeshConfig");
var SceneConfig = require("./loaders/helpers/SceneConfig");
var PosteffectsConfig = require("./loaders/helpers/PosteffectsConfig");

var bundle = {};
var Configs = {
	randomRef: function (type) {
		var hash = 'aaaabbbbaaaabbbbaaaabbbbaaaabbbb'.replace(/[ab]/g, function(a) {
			return ((Math.random() * 16) % 16 | 0).toString(16);
		});
		return hash + '.' + (type || '');
	},
	gooObject: function (type, name) {
		var config = {
			id: Configs.randomRef(type),
			name: name,
			license: 'CC0',
			orignalLicense: 'CC0',

			created: '2014-01-11T13:29:12+00:00',
			modified: '2014-01-11T13:29:12+00:00',

			public: true,
			owner: 'rickard',
			readonly: false,
			description: 'Test object',
			deleted: false,

			dataModelVersion: 2
		};
		this.addToBundle(config);
		return config;
	},
	addToBundle: function (config, ref) {
		ref = ref || config.id;
		if (ref) {
			bundle[ref] = config;
		}
	},
	binary: function (size) {
		var arr = new Float32Array(size);
		for (var i = 0; i < size; i++) {
			arr[i] = i / size;
		}
		var ref = Configs.randomRef('bin');
		Configs.addToBundle(arr.buffer, ref);
		return ref;
	},
	get: function () {
		return bundle;
	}
};

function attach(attachee, attacher) {
	for (var key in attacher) {
		if (attacher[key] instanceof Function) {
			attachee[key] = attacher[key].bind(Configs);
		} else if (attacher[key] instanceof Object) {
			attachee[key] = attachee[key] || {};
			attach(attachee[key], attacher[key]);
		} else {
			attachee[key] = attacher[key];
		}
	}
}

attach(Configs, EntityConfig);
attach(Configs, AnimationConfig);
attach(Configs, MaterialConfig);
attach(Configs, MeshConfig);
attach(Configs, SceneConfig);
attach(Configs, PosteffectsConfig);
// for (var i = 0; i < arguments.length; i++) {
// 	attach(Configs, arguments[i]);
// }

module.exports = Configs;

var World = require("../../src/goo/entities/World");
var TransformSystem = require("../../src/goo/entities/systems/TransformSystem");
var CameraSystem = require("../../src/goo/entities/systems/CameraSystem");
var ParticlesSystem = require("../../src/goo/entities/systems/ParticlesSystem");
var BoundingUpdateSystem = require("../../src/goo/entities/systems/BoundingUpdateSystem");
var LightingSystem = require("../../src/goo/entities/systems/LightingSystem");
var AnimationSystem = require("../../src/goo/animationpack/systems/AnimationSystem");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var AudioContext = require("../../src/goo/sound/AudioContext");
var SoundSystem = require("../../src/goo/entities/systems/SoundSystem");
var RenderSystem = require("../../src/goo/entities/systems/RenderSystem");
var Configs = require("./loaders/Configs");

require("../../src/goo/loaders/handlers/EntityHandler");
require("../../src/goo/animationpack/handlers/AnimationHandlers");

describe('DynamicLoader', function () {
	var loader;

	var entityRef = 'aaaabbbbaaaabbbbaaaabbbbaaaabbbb.entity';
	var materialRef = 'ccccddddccccddddccccddddccccdddd.material';
	var imageRef = 'ccccddddccccddddccccddddccccddddccccdddd.jpg';

	beforeEach(function () {
		var world = new World();
		world.setSystem(new TransformSystem());
		world.setSystem(new CameraSystem());
		world.setSystem(new ParticlesSystem());
		world.setSystem(new BoundingUpdateSystem());
		world.setSystem(new LightingSystem());
		world.setSystem(new AnimationSystem());
		if (AudioContext) {
			world.setSystem(new SoundSystem());
		}

		world.setSystem(new RenderSystem());

		loader = new DynamicLoader({
			world: world,
			rootPath: './'
		});
	});

	it('loads bundle', function (done) {
		// Create a bundlewrapper to preload and skip ajax
		var config = Configs.entity();
		var bundleRef = Configs.randomRef('bundle');

		loader.update(bundleRef, Configs.get());
		// Load bundle
		loader.load(bundleRef).then(function (/* bundle */) {
			var keys = Object.keys(loader._ajax._cache); // this needs to change when _cache becomes a map

			expect(keys).toContain(config.id);
			expect(loader._ajax._cache[config.id].components).toBeDefined();
			done();
		}, function () {
			expect('').toEqual('Should never get here');
			done();
		});
	});

	it('clears the engine', function (done) {
		var config = Configs.project(true);
		var world = loader._world;
		loader.preload(Configs.get());
		loader.load(config.id).then(function () {
			world.process();
			// We have some entities
			expect(world.entityManager.getEntities().length).toBeGreaterThan(0);
			expect(world.getSystem('TransformSystem')._activeEntities.length).toBeGreaterThan(0);

			// Someloaders are populated
			expect(loader._handlers.entity._objects.size).toBeGreaterThan(0);

			// Ajax has some cache
			expect(Object.keys(loader._ajax._cache).length).toBeGreaterThan(0);

			return loader.clear();
		}).then(function () {
			world.process();
			// Process loop is empty
			expect(world._addedEntities.length).toBe(0);
			expect(world._removedEntities.length).toBe(0);
			expect(world._changedEntities.length).toBe(0);

			// No entities in world
			expect(world.entityManager.getEntities().length).toBe(0);

			// No entities in systems
			expect(world._systems.length).toBeGreaterThan(0);
			for (var i = 0; i < world._systems.length; i++) {
				var entities = world._systems[i]._activeEntities;
				expect(entities.length).toBe(0);
			}

			// No objects in handlers
			for (var key in loader._handlers) {
				expect(loader._handlers[key]._objects.size).toBe(0);
			}

			// No configs in ajax
			var cacheCount = Object.keys(loader._ajax._cache);
			expect(cacheCount.length).toBe(0);
			done();
		}, function () {
			expect('').toEqual('Should never get here');
			done();
		});
	});

	it('preloads all binaries in json structure', function (done) {
		var entities = [];
		for (var i = 0; i < 4; i++) {
			entities[i] = Configs.entity(['transform', 'meshData']);
			if (i > 0) {
				Configs.attachChild(entities[i - 1], entities[i]);
			}
		}

		var bundleRef = Configs.randomRef('bundle');
		loader.update(bundleRef, Configs.get());

		var progress = jasmine.createSpy('progress');
		loader.load(bundleRef).then(function () {
			return loader.load(entities[0].id, {
				preloadBinaries: true,
				progressCallback: progress
			});
		}).then(function () {
			var l = entities.length;
			expect(progress).toHaveBeenCalledWith(l, l);
			done();
		}, function () {
			expect('').toEqual('Should never get here');
			done();
		});
	});

	describe('_getRefsFromConfig', function () {
		it('gets individual references', function () {
			var config = {
				aref: entityRef,
				bref: materialRef
			};

			expect(DynamicLoader._getRefsFromConfig(config))
				.toEqual([entityRef, materialRef]);
		});

		it('gets individual references several levels deep', function () {
			var config = {
				a: {
					b: {
						c: {
							aref: entityRef,
							bref: materialRef
						}
					}
				}
			};

			expect(DynamicLoader._getRefsFromConfig(config))
				.toEqual([entityRef, materialRef]);
		});

		it('gets packed references', function () {
			var config = {
				arefs: {
					aref: entityRef,
					bref: materialRef
				}
			};

			expect(DynamicLoader._getRefsFromConfig(config))
				.toEqual([entityRef, materialRef]);
		});

		it('ignores thumbnailRef', function () {
			var config = {
				aref: entityRef,
				bref: materialRef,
				thumbnailRef: imageRef
			};

			expect(DynamicLoader._getRefsFromConfig(config))
				.toEqual([entityRef, materialRef]);
		});
	});
});








var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var World = require("../../src/goo/entities/World");
var Configs = require("./loaders/Configs");
var CameraComponent = require("../../src/goo/entities/components/CameraComponent");
var Camera = require("../../src/goo/renderer/Camera");

describe('CameraComponentHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads an entity with a cameraComponent', function (done) {
		var config = Configs.entity(['camera']);
		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			expect(entity.cameraComponent).toEqual(jasmine.any(CameraComponent));
			expect(entity.cameraComponent.camera).toEqual(jasmine.any(Camera));
			done();
		});
	});

	it('loads the correct camera settings', function (done) {
		var config = Configs.entity(['camera']);
		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			var camera = entity.cameraComponent.camera;
			var cameraConfig = config.components.camera;
			for (var key in cameraConfig) {
				if (key !== 'projectionMode') {
					expect(camera[key]).toBe(cameraConfig[key]);
				}
			}
			done();
		});
	});
});






var World = require("../../src/goo/entities/World");
var Entity = require("../../src/goo/entities/Entity");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var Configs = require("./loaders/Configs");

require("../../src/goo/loaders/handlers/EntityHandler");

describe('EntityHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads an entity', function (done) {
		var config = Configs.entity();
		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			expect(entity).toEqual(jasmine.any(Entity));
			expect(entity.id).toBe(config.id);
			done();
		});
	});

	it('loads an entity with tags', function (done) {
		var config = Configs.entity();
		config.tags = { t1: true, t2: true };
		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			expect(entity.hasTag('t1')).toEqual(true);
			expect(entity.hasTag('t2')).toEqual(true);
			done();
		});
	});
});


var World = require("../../src/goo/entities/World");
var TransformComponent = require("../../src/goo/entities/components/TransformComponent");
var MeshDataComponent = require("../../src/goo/entities/components/MeshDataComponent");
var MeshRendererComponent = require("../../src/goo/entities/components/MeshRendererComponent");
var RenderSystem = require("../../src/goo/entities/systems/RenderSystem");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var ShaderBuilder = require("../../src/goo/renderer/shaders/ShaderBuilder");
var Configs = require("./loaders/Configs");

require("../../src/goo/loaders/handlers/EnvironmentHandler");

describe('EnvironmentHandler', function () {
	var loader, world;

	beforeEach(function () {
		world = new World();

		// Pretending to be gooRunner
		world.registerComponent(TransformComponent);
		world.registerComponent(MeshDataComponent);
		world.registerComponent(MeshRendererComponent);
		world.setSystem(new RenderSystem());
		// Faking a goorunner
		world.gooRunner = {
			world: world
		};

		loader = new DynamicLoader({
			world: world,
			rootPath: typeof(window) !== 'undefined' && window.__karma__ ? './' : 'loaders/res'
		});
	});

	it('loads an environment', function (done) {
		var config = Configs.environment();
		loader.preload(Configs.get());
		loader.load(config.id).then(function (environment) {
			expect(ShaderBuilder.GLOBAL_AMBIENT).toEqual(environment.globalAmbient);

			expect(ShaderBuilder.FOG_SETTINGS).toEqual([environment.fog.near, environment.fog.far]);
			expect(ShaderBuilder.FOG_COLOR).toEqual(environment.fog.color);
			expect(ShaderBuilder.USE_FOG).toBe(environment.fog.enabled);

			expect(world._addedEntities).toContain(
				environment.weatherState.snow.snow.particleCloudEntity
			);

			done();
		});
	});
});


var World = require("../../src/goo/entities/World");
var HtmlComponent = require("../../src/goo/entities/components/HtmlComponent");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var Configs = require("./loaders/Configs");
require("../../src/goo/loaders/handlers/HtmlComponentHandler");

describe('HtmlComponentHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		world.gooRunner = {
			renderer: {
				domElement: document.createElement('div')
			}
		};

		loader = new DynamicLoader({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads an entity with an htmlComponent', function (done) {
		var config = Configs.entity(['html']);
		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			expect(entity.htmlComponent).toEqual(jasmine.any(HtmlComponent));
			expect(entity.htmlComponent.useTransformComponent).toBeTruthy();
			expect(/[^\-\w]/.test(entity.htmlComponent.domElement.id)).toBeFalsy();
			expect(document.getElementById(entity.htmlComponent.domElement.id)).not.toBeNull();
			done();
		}, function () {
			expect('').toEqual('Should never get here');
			done();
		});
	});

	it('removes an html entity', function (done) {
		var config = Configs.entity(['html']);
		loader.preload(Configs.get());

		var entity, htmlComponent;
		loader.load(config.id).then(function (_entity) {
			entity = _entity;
			htmlComponent = entity.htmlComponent;
			return loader.remove(config.id);
		}).then(function () {
			expect(entity.htmlComponent).toBeUndefined();
			expect(document.getElementById(htmlComponent.domElement.id)).toBeNull();
			done();
		}, function () {
			expect('').toEqual('Should never get here');
			done();
		});
	});
});


var World = require("../../src/goo/entities/World");
var LightComponent = require("../../src/goo/entities/components/LightComponent");
var PointLight = require("../../src/goo/renderer/light/PointLight");
var SpotLight = require("../../src/goo/renderer/light/SpotLight");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var Configs = require("./loaders/Configs");

require("../../src/goo/loaders/handlers/LightComponentHandler");

describe('LightComponentHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads an entity with a lightComponent', function (done) {
		var config = Configs.entity(['light']);
		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			expect(entity.lightComponent).toEqual(jasmine.any(LightComponent));
			done();
		});
	});

	it('manages to update between light types', function (done) {
		var component;
		var config = Configs.entity();
		var pointLight = Configs.component.light('PointLight');
		var spotLight = Configs.component.light('SpotLight');
		config.components.light = pointLight;
		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			component = entity.lightComponent;
			expect(component.light).toEqual(jasmine.any(PointLight));

			config.components.light = spotLight;
			return loader.update(config.id, config);
		}).then(function (entity) {
			expect(entity.lightComponent).toBe(component);
			expect(entity.lightComponent.light).toEqual(jasmine.any(SpotLight));
			done();
		});
	});
});


var World = require("../../src/goo/entities/World");
var Material = require("../../src/goo/renderer/Material");
var Shader = require("../../src/goo/renderer/Shader");
var Texture = require("../../src/goo/renderer/Texture");
var ShaderLib = require("../../src/goo/renderer/shaders/ShaderLib");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var Configs = require("./loaders/Configs");

require("../../src/goo/loaders/handlers/MaterialHandler");

describe('MaterialHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: typeof(window) !== 'undefined' && window.__karma__ ? './' : 'loaders/res'
		});
	});

	it('loads a material with a shader', function (done) {
		var config = Configs.material();
		loader.preload(Configs.get());
		loader.load(config.id).then(function (material) {
			expect(material).toEqual(jasmine.any(Material));
			expect(material.shader).toEqual(jasmine.any(Shader));
			done();
		});
	});

	it('loads a material with a shader and a texture', function (done) {
		var config = Configs.material();
		config.texturesMapping.DIFFUSE_MAP = {
			enabled: true,
			textureRef: Configs.texture().id
		};
		loader.preload(Configs.get());
		loader.load(config.id).then(function (material) {
			var texture = material.getTexture('DIFFUSE_MAP');
			expect(material.shader).toEqual(jasmine.any(Shader));
			expect(texture).toEqual(jasmine.any(Texture));
			expect(texture.image).toEqual(jasmine.any(Image));
			done();
		});
	});

	it('loads a material with an engine shader', function (done) {
		var config = Configs.material();
		config.shaderRef = 'GOO_ENGINE_SHADERS/uber';
		loader.preload(Configs.get());
		loader.load(config.id).then(function (material) {
			expect(material.shader.shaderDefinition).toBe(ShaderLib.uber);
			done();
		});
	});
});


var World = require("../../src/goo/entities/World");
var MeshDataComponent = require("../../src/goo/entities/components/MeshDataComponent");
var MeshData = require("../../src/goo/renderer/MeshData");
var SkeletonPose = require("../../src/goo/animationpack/SkeletonPose");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var Configs = require("./loaders/Configs");

require("../../src/goo/animationpack/handlers/AnimationHandlers");
require("../../src/goo/loaders/handlers/MeshDataComponentHandler");
require("../../src/goo/loaders/handlers/MeshDataHandler");

describe('MeshDataComponentHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: './'
		});
	});

	it('loads an entity with a meshDataComponent', function (done) {
		var config = Configs.entity(['meshData']);
		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			expect(entity.meshDataComponent).toEqual(jasmine.any(MeshDataComponent));
			expect(entity.meshDataComponent.meshData).toEqual(jasmine.any(MeshData));
			expect(entity.meshDataComponent.currentPose).toEqual(jasmine.any(SkeletonPose));
			done();
		});
	});

	it('loads a meshDatacomponent with a shape', function (done) {
		var config = Configs.entity();
		config.components.meshData = Configs.component.meshData('Sphere');
		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			expect(entity.meshDataComponent).toEqual(jasmine.any(MeshDataComponent));
			expect(entity.meshDataComponent.meshData).toEqual(jasmine.any(MeshData));
			done();
		});
	});
});


var MeshData = require("../../src/goo/renderer/MeshData");
var GooRunner = require("../../src/goo/entities/GooRunner");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var Configs = require("./loaders/Configs");

describe('MeshDataHandler', function () {
	var gooRunner, loader;

	beforeEach(function () {
		gooRunner = new GooRunner({
			logo: false,
			manuallyStartGameLoop: true
		});
		loader = new DynamicLoader({
			world: gooRunner.world,
			rootPath: 'loaders/res/'
		});
	});

	afterEach(function () {
		gooRunner.clear();
	});

	it('loads a meshdata object', function (done) {
		var config = Configs.mesh();
		loader.preload(Configs.get());
		loader.load(config.id).then(function (mesh) {
			expect(mesh).toEqual(jasmine.any(MeshData));
			for (var key in config.attributes) {
				var view = mesh.dataViews[key];
				expect(view).toEqual(jasmine.any(Float32Array));

				var length = config.vertexCount * config.attributes[key].dimensions;
				expect(view.length).toBe(length);
			}
			done();
		}, function () {
			expect('').toEqual('Should never reach this');
			done();
		});
	});

	it('clears meshdata from the GPU', function (done) {
		var config = Configs.mesh();
		loader.preload(Configs.get());
		var m;
		loader.load(config.id).then(function (meshdata) {
			m = meshdata;
			m.vertexData.glBuffer = gooRunner.renderer.context.createBuffer();
			m.indexData.glBuffer = gooRunner.renderer.context.createBuffer();
			return loader.clear();
		}).then(function () {
			expect(m.vertexData.glBuffer).toBeFalsy();
			expect(m.indexData.glBuffer).toBeFalsy();
			done();
		});
	});
});


var MeshRendererComponent = require("../../src/goo/entities/components/MeshRendererComponent");
var Material = require("../../src/goo/renderer/Material");
var World = require("../../src/goo/entities/World");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var Configs = require("./loaders/Configs");

describe('MeshRendererComponentHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads an entity with a meshRendererComponent', function (done) {
		var config = Configs.entity(['meshRenderer']);
		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			expect(entity.meshRendererComponent).toEqual(jasmine.any(MeshRendererComponent));
			expect(entity.meshRendererComponent.materials[0]).toEqual(jasmine.any(Material));
			done();
		});
	});

	it('loads materials in right order', function (done) {
		var config = Configs.entity(['meshRenderer']);
		var materialConfigs = config.components.meshRenderer.materials;
		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			var materials = entity.meshRendererComponent.materials;
			var sortMaterials = {};

			for (var key in materialConfigs) {
				var sortValue = materialConfigs[key].sortValue;
				sortMaterials[sortValue] = key;
			}

			var keys = Object.keys(sortMaterials).sort();
			for (var i = 0; i < keys.length; i++) {
				expect(sortMaterials[keys[i]]).toBe(materials[i].id);
			}
			expect(entity.meshRendererComponent).toEqual(jasmine.any(MeshRendererComponent));
			expect(entity.meshRendererComponent.materials[0]).toEqual(jasmine.any(Material));
			done();
		});
	});
});


var World = require("../../src/goo/entities/World");
var Entity = require("../../src/goo/entities/Entity");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var Configs = require("./loaders/Configs");
require("../../src/goo/animationpack/handlers/AnimationHandlers");

describe('ProjectHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads a project with scene', function (done) {
		var config = Configs.project();
		loader.preload(Configs.get());
		loader.load(config.id).then(function (project) {
			expect(project.mainScene).toBeDefined();
			expect(project.mainScene.entities).toEqual(jasmine.any(Object));
			done();
		});
	});

	it('loads a slightly more complex project', function (done) {
		var config = Configs.project(true);
		loader.preload(Configs.get());
		loader.load(config.id).then(function (project) {
			expect(project.mainScene).toBeDefined();
			var entity;
			for (var key in project.mainScene.entities) {
				entity = project.mainScene.entities[key];
			}
			expect(entity).toEqual(jasmine.any(Entity));
			done();
		});
	});
});


var World = require("../../src/goo/entities/World");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var Entity = require("../../src/goo/entities/Entity");
var Configs = require("./loaders/Configs");

require("../../src/goo/loaders/handlers/SceneHandler");

describe('SceneHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads a scene with entities', function (done) {
		var config = Configs.scene();
		loader.preload(Configs.get());
		loader.load(config.id).then(function (scene) {
			expect(scene.entities).toEqual(jasmine.any(Object));
			var entity;
			for (var key in scene.entities) {
				entity = scene.entities[key];
				break;
			}
			expect(entity).toEqual(jasmine.any(Entity));
			expect(entity._world._addedEntities).toContain(entity);
			done();
		});
	});
});




var ScriptHandler = require("../../src/goo/scriptpack/ScriptHandler");

describe('ScriptHandler', function () {
	describe('validateParameter', function () {
		var validateParameter = ScriptHandler.validateParameter;

		it('validates a minimal parameter (key, type only)', function () {
			expect(validateParameter({
				key: 'asd',
				type: 'float'
			})).toBeUndefined();
		});

		it('validates a parameter with more properties', function () {
			expect(validateParameter({
				key: 'asd',
				name: 'blaha',
				type: 'float',
				min: 10,
				max: 20,
				exponential: true
			})).toBeUndefined();
		});

		it('returns an error object if the key is missing or is a non-string', function () {
			expect(validateParameter({
				type: 'float'
			})).toEqual({ message: 'Property "key" must be of type string' });

			expect(validateParameter({
				key: 123,
				type: 'float'
			})).toEqual({ message: 'Property "key" must be of type string' });
		});

		it('returns an error object if the key is an empty string', function () {
			expect(validateParameter({
				key: '',
				type: 'float'
			})).toEqual({ message: 'Property "key" must be longer than 0' });
		});

		it('returns an error object if the type is missing or bad', function () {
			expect(validateParameter({
				key: 'asd'
			})).toEqual({ message: 'Property "type" must be one of: string, int, float, vec2, vec3, vec4, boolean, texture, sound, camera, entity, animation, json, text' });

			expect(validateParameter({
				key: 'asd',
				type: 'unicorn'
			})).toEqual({ message: 'Property "type" must be one of: string, int, float, vec2, vec3, vec4, boolean, texture, sound, camera, entity, animation, json, text' });
		});
	});
});


var GooRunner = require("../../src/goo/entities/GooRunner");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var Shader = require("../../src/goo/renderer/Shader");
var Configs = require("./loaders/Configs");

describe('ShaderHandler', function () {
	var gooRunner, loader;

	beforeEach(function () {
		gooRunner = new GooRunner({
			logo: false,
			manuallyStartGameLoop: true
		});
		loader = new DynamicLoader({
			world: gooRunner.world,
			rootPath: 'loaders/res/'
		});
	});

	afterEach(function () {
		gooRunner.clear();
	});

	it('loads a shader', function (done) {
		var config = Configs.shader();
		loader.preload(Configs.get());
		loader.load(config.id).then(function (shader) {
			expect(shader).toEqual(jasmine.any(Shader));
			done();
		});
	});

	it('clears shader from the GPU', function (done) {
		var config = Configs.shader();
		loader.preload(Configs.get());
		var s;
		loader.load(config.id).then(function (shader) {
			s = shader;
			shader.compile(gooRunner.renderer);
			expect(s.shaderProgram).toBeTruthy();
			expect(s.fragmentShader).toBeTruthy();
			expect(s.vertexShader).toBeTruthy();
			return loader.clear();
		}).then(function () {
			expect(s.shaderProgram).toBeFalsy();
			expect(s.fragmentShader).toBeFalsy();
			expect(s.vertexShader).toBeFalsy();
			done();
		});
	});
});


var Entity = require("../../src/goo/entities/Entity");
var TransformComponent = require("../../src/goo/entities/components/TransformComponent");
var MeshDataComponent = require("../../src/goo/entities/components/MeshDataComponent");
var MeshRendererComponent = require("../../src/goo/entities/components/MeshRendererComponent");
var RenderSystem = require("../../src/goo/entities/systems/RenderSystem");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var EnvironmentHandler = require("../../src/goo/loaders/handlers/EnvironmentHandler");
var World = require("../../src/goo/entities/World");
var Texture = require("../../src/goo/renderer/Texture");
var Material = require("../../src/goo/renderer/Material");
var Box = require("../../src/goo/shapes/Box");
var Sphere = require("../../src/goo/shapes/Sphere");
var Configs = require("./loaders/Configs");

describe('SkyboxHandler', function () {
	var loader, world;
	beforeEach(function () {
		world = new World();

		// Pretending to be gooRunner
		world.registerComponent(TransformComponent);
		world.registerComponent(MeshDataComponent);
		world.registerComponent(MeshRendererComponent);
		world.setSystem(new RenderSystem());

		loader = new DynamicLoader({
			world: world,
			rootPath: typeof(window) !== 'undefined' && window.__karma__ ? './' : 'loaders/res'
		});
	});

	it('loads a skybox', function (done) {
		var config = Configs.skybox();
		loader.preload(Configs.get());
		var renderSystem = world.getSystem('RenderSystem');
		spyOn(renderSystem, 'added');

		EnvironmentHandler.currentSkyboxRef = config.id;

		loader.load(config.id).then(function (skyboxes) {
			var skybox = skyboxes[0];
			expect(skybox).toEqual(jasmine.any(Entity));

			// expect(renderSystem.added).toHaveBeenCalledWith(skybox); //! AT: this causes problems in jasmine 2.0
			// seems like a bug in their pretty printer (skybox can't be pretty printed)
			// will comment it out for now and replace with just an id check (which is enough in this case)
			expect(renderSystem.added.calls.mostRecent().args[0].id).toEqual(skybox.id);

			expect(skybox.isSkybox).toBeTruthy();

			// Texture and material
			var material = skybox.meshRendererComponent.materials[0];
			expect(material).toEqual(jasmine.any(Material));
			var texture = material.getTexture('DIFFUSE_MAP');
			expect(texture).toEqual(jasmine.any(Texture));
			expect(texture.image.data.length).toBe(6);

			// Mesh
			var mesh = skybox.meshDataComponent.meshData;
			expect(mesh).toEqual(jasmine.any(Box));
			done();
		});
	});

	it('loads a skysphere', function (done) {
		var config = Configs.skybox('sphere');
		loader.preload(Configs.get());

		EnvironmentHandler.currentSkyboxRef = config.id;

		loader.load(config.id).then(function (skyboxes) {
			var skybox = skyboxes[0];
			expect(skybox).toEqual(jasmine.any(Entity));
			expect(skybox.isSkybox).toBeTruthy();

			// Texture and material
			var material = skybox.meshRendererComponent.materials[0];
			expect(material).toEqual(jasmine.any(Material));
			var texture = material.getTexture('DIFFUSE_MAP');
			expect(texture).toEqual(jasmine.any(Texture));
			expect(texture.image).toEqual(jasmine.any(Image));

			// Mesh
			var mesh = skybox.meshDataComponent.meshData;
			expect(mesh).toEqual(jasmine.any(Sphere));
			done();
		});
	});
});






var GooRunner = require("../../src/goo/entities/GooRunner");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var Texture = require("../../src/goo/renderer/Texture");
var Configs = require("./loaders/Configs");

describe('TextureHandler', function () {
	var gooRunner, loader;

	beforeEach(function () {
		gooRunner = new GooRunner({
			logo: false,
			manuallyStartGameLoop: true
		});
		loader = new DynamicLoader({
			world: gooRunner.world,
			rootPath: typeof(window) !== 'undefined' && window.__karma__ ? './' : 'loaders/res/'
		});
	});

	afterEach(function () {
		gooRunner.clear();
	});

	it('loads a texture with an image', function (done) {
		var config = Configs.texture();
		loader.preload(Configs.get());
		loader.load(config.id).then(function (texture) {
			expect(texture).toEqual(jasmine.any(Texture));
			expect(texture.image).toEqual(jasmine.any(Image));
			done();
		});
	});

	it('loads a texture with an SVG', function (done) {
		var config = Configs.textureSVG();
		loader.preload(Configs.get());
		loader.load(config.id).then(function (texture) {
			expect(texture).toEqual(jasmine.any(Texture));
			done();
		});
	});

	it('clears a texture from the context', function (done) {
		var config = Configs.texture();
		loader.preload(Configs.get());
		var t;
		loader.load(config.id).then(function (texture) {
			t = texture;
			// Allocate a dummy texture on the context
			texture.glTexture = gooRunner.renderer.context.createTexture();
			gooRunner.renderer.preloadTexture(gooRunner.renderer.context, texture);
			return loader.clear();
		}).then(function () {
			expect(t.glTexture).toBeFalsy();
			done();
		});
	});
});


var TransformComponent = require("../../src/goo/entities/components/TransformComponent");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var World = require("../../src/goo/entities/World");
var Configs = require("./loaders/Configs");
var Vector3 = require("../../src/goo/math/Vector3");
var CustomMatchers = require("./CustomMatchers");

describe('TransformComponentHandler', function () {
	var loader;

	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);

		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads an entity with a transformComponent', function (done) {
		var config = Configs.entity(['transform']);
		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			expect(entity.transformComponent).toEqual(jasmine.any(TransformComponent));
			done();
		});
	});

	it('loads the correct transform', function (done) {
		var config = Configs.entity(['transform']);
		config.components.transform.translation = [1, 2, 3];
		config.components.transform.rotation = [4, 5, 6];
		config.components.transform.scale = [7, 8, 9];

		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			var t = entity.transformComponent.transform;
			var ct = config.components.transform;
			expect(t.translation).toBeCloseToVector(Vector3.fromArray(ct.translation));
			expect(t.scale).toBeCloseToVector(Vector3.fromArray(ct.scale));
			var rotation = t.rotation.toAngles();
			rotation.scale(180 / Math.PI);
			expect(rotation).toBeCloseToVector(Vector3.fromArray(ct.rotation));
			done();
		});
	});

	it('updates existing transformcomponent', function (done) {
		//var component;
		var config = Configs.entity(['transform']);

		var newConfig = Configs.entity(['transform']);
		newConfig.components.transform.translation = [1, 2, 3];
		newConfig.id = config.id;

		loader.preload(Configs.get());
		loader.load(config.id).then(function (/*entity*/) {
			//component = entity.transformComponent;

			return loader.update(config.id, newConfig);
		}).then(function (entity) {
//				expect(entity.transformComponent).toEqual(component);

			var t = entity.transformComponent.transform;
			var ct = newConfig.components.transform;
			expect(t.translation).toBeCloseToVector(Vector3.fromArray(ct.translation));
			expect(t.scale).toBeCloseToVector(Vector3.fromArray(ct.scale));
			var rotation = t.rotation.toAngles();
			rotation.scale(180 / Math.PI);
			expect(rotation).toBeCloseToVector(Vector3.fromArray(ct.rotation));
			done();
		});
	});

	function inScene(id) {
		if (loader._world.entityManager.getEntityById(id)) {
			return true;
		}
		var addedEntities = loader._world._addedEntities;
		for (var i = 0; i < addedEntities.length; i++) {
			var entity = addedEntities[i];
			if (entity.id === id) {
				return true;
			}
		}
		return false;
	}

	xit('adds hierarchy correctly outside of scene', function (done) {
		var parentConfig = Configs.entity(['transform']);
		var childConfig = Configs.entity(['transform']);
		Configs.attachChild(parentConfig, childConfig);

		loader.preload(Configs.get());

		loader.load(parentConfig.id).then(function (entity) {
			loader._world.process();
			expect(entity.transformComponent.children.length).toBeGreaterThan(0);

			var child = entity.transformComponent.children[0];
			expect(child).toEqual(jasmine.any(TransformComponent));
			expect(child.entity.id).toBe(childConfig.id);
			expect(child.parent).toBe(entity.transformComponent);
			expect(inScene(parentConfig.id)).toBeFalsy();
			expect(inScene(childConfig.id)).toBeFalsy();
			done();
		});
	});

	it('adds hierarchy correctly inside of scene', function (done) {
		var sceneConfig = Configs.scene();
		var childConfig = Configs.entity();
		var parentId = Object.keys(sceneConfig.entities)[0];
		var parentConfig = Configs.get()[parentId];

		Configs.attachChild(parentConfig, childConfig);
		loader.preload(Configs.get());
		loader.load(sceneConfig.id).then(function () {
			loader._world.process();
			expect(inScene(childConfig.id)).toBeTruthy();
			expect(inScene(parentConfig.id)).toBeTruthy();
			done();
		});
	});
});


module.exports = {
	skeleton: function () {
		var skeleton = this.gooObject('skeleton', 'Dummy');
		skeleton.joints = {};
		for (var i = 0; i < 6; i++) {
			skeleton.joints[this.randomRef()] = {
				index: i,
				parentIndex: i > 0 ? i - 1 : -32768,
				name: 'Joint_' + i,
				inverseBindPose: [
					1, 0, 0, 0,
					0, 1, 0, 0,
					0, 0, 1, 0,
					0, 0, 0, 1
				]
			};
		}
		return skeleton;
	},
	animation: function () {
		var layers = this.gooObject('animation', 'Dummy');

		layers.layers = {};

		for (var i = 5; i >= 0; i--) {
			var layerKey = this.randomRef('layer');

			var state = this.animstate();
			layers.layers[layerKey] = {
				id: layerKey,
				sortValue: i,
				blendWeight: 1,
				initialStateRef: state.id,
				states: {},
				transitions: {
					'*': {
						type: 'Fade',
						fadeTime: 1.2
					}
				}
			};
			layers.layers[layerKey].states[state.id] = {
				sortValue: 0,
				stateRef: state.id
			};
		}
		return layers;
	},
	animstate: function () {
		var state = this.gooObject('animstate', 'Dummy');

		state.clipSource = {
			type: 'Clip',
			clipRef: this.clip().id,
			loopCount: -1,
			timeScale: 1
		};
		return state;
	},
	clip: function () {
		var clip = this.gooObject('clip', 'Dummy');
		clip.binaryRef = this.binary(128);

		clip.channels = {};
		for (var i = 0; i < 6; i++) {
			clip.channels[this.randomRef()] = this.clipChannel(i);
		}
		return clip;
	},
	clipChannel: function (index, samples) {
		index = (index !== undefined) ? index : 0;
		samples = samples || 4;

		var channel = {
			blendType: 'Linear',
			jointIndex: index,
			name: 'dummy_joint_' + index,
			times: [0, samples, 'float32'],
			translationSamples: [4, samples * 3, 'float32'],
			rotationSamples: [16, samples * 4, 'float32'],
			scaleSamples: [32, samples * 3, 'float32'],
			type: 'Joint'
		};
		return channel;
	}
};

var _ = require("../../src/goo/util/ObjectUtil");

module.exports = {
	entity: function (components) {
		components = components || ['transform'];
		var entity = this.gooObject('entity', 'Dummy');
		entity.components = {};
		for (var i = 0; i < components.length; i++) {
			entity.components[components[i]] = this.component[components[i]]();
		}
		this.addToBundle(entity);
		return entity;
	},
	component: {
		transform: function (translation, rotation, scale) {
			translation = translation ? translation.slice() : [0, 0, 0];
			rotation = rotation ? rotation.slice() : [0, 0, 0];
			scale = scale ? scale.slice() : [1, 1, 1];

			return {
				translation: translation,
				rotation: rotation,
				scale: scale
			};
		},
		camera: function (aspect, lockedRatio, far, fov, near) {
			return {
				aspect: aspect || 1,
				lockedRatio: !!lockedRatio,
				far: far || 1000,
				fov: fov || 45,
				near: near || 1
			};
		},
		light: function (type, options) {
			var config = _.copyOptions({}, options, {
				type: type || 'PointLight',
				color: [1, 1, 1],
				intensity: 1,
				shadowCaster: false,
				specularIntensity: 1
			});
			if (type !== 'DirectionalLight') {
				config.range = config.range || 1000;
			}
			if (type === 'SpotLight') {
				config.angle = config.angle || 55;
			}
			if (config.shadowCaster) {
				config.shadowSettings = config.shadowSettings || {};
				_.defaults(config.shadowSettings, {
					type: 'Blur',
					projection: (config.type === 'DirectionalLight') ? 'Parallel' : 'Perspective',
					near: 1,
					far: 1000,
					resolution: [512, 512],
					upVector: [0, 1, 0],
					darkness: 0.5
				});
			}
			return config;
		},
		animation: function () {
			return {
				layersRef: this.animation().id,
				poseRef: this.skeleton().id
			};
		},
		particleSystem: function () {
			function particleCurve() {
				return [{
					type: 'linear',
					offset: 0,
					options: {
						m: 0,
						k: 1
					}
				}];
			}
			return {
				seed: -1,
				shapeType: 'cone',
				sphereRadius: 1,
				sphereEmitFromShell: false,
				randomDirection: false,
				coneEmitFrom: 'base',
				boxExtents: [1, 1, 1],
				coneRadius: 1,
				coneAngle: 10,
				coneLength: 1,
				startColorR: particleCurve(),
				startColorG: particleCurve(),
				startColorB: particleCurve(),
				startColorA: particleCurve(),
				colorR: particleCurve(),
				colorG: particleCurve(),
				colorB: particleCurve(),
				colorA: particleCurve(),
				duration: 5,
				localSpace: true,
				startSpeed: particleCurve(),
				localVelocityX: particleCurve(),
				localVelocityY: particleCurve(),
				localVelocityZ: particleCurve(),
				worldVelocityX: particleCurve(),
				worldVelocityY: particleCurve(),
				worldVelocityZ: particleCurve(),
				maxParticles: 100,
				emissionRate: particleCurve(),
				startLifeTime: 5,
				renderQueue: 3010,
				alphakill: 0.5,
				loop: false,
				blending: 'TransparencyBlending',
				depthWrite: true,
				depthTest: true,
				textureTilesX: 1,
				textureTilesY: 1,
				textureAnimationSpeed: 1,
				startSize: particleCurve(),
				sortMode: 'none',
				billboard: true,
				sizeCurve: particleCurve(),
				startAngle: particleCurve(),
				rotationSpeed: particleCurve(),
				textureRef: this.texture().id
			};
		},
		meshRenderer: function () {
			var config = {
				cullMode: 'Dynamic',
				castShadows: true,
				receiveShadow: true,
				reflectable: true,
				materials: {}
			};
			for (var i = 2; i >= 0; i--) {
				var material = this.material();
				config.materials[material.id] = {
					sortValue: Math.random(),
					materialRef: material.id
				};
			}
			return config;
		},
		meshData: function (shape, options) {
			if (shape) {
				return {
					shape: shape,
					shadeOptions: options
				};
			}
			return {
				meshRef: this.mesh().id,
				poseRef: this.skeleton().id
			};
		},
		timeline: function () {
			return {
				channels: {
					'c1': {
						id: 'c1',
						sortValue: 0,
						propertyKey: 'scaleX',
						keyframes: {
							'k1': {
								time: 10,
								value: 20,
								easing: 'Linear.None'
							},
							'k2': {
								time: 100,
								value: 50,
								easing: 'Linear.None'
							},
							'k3': {
								time: 200,
								value: 50,
								easing: 'Linear.None'
							}
						}
					},
					'c2': {
						id: 'c2',
						sortValue: 1,
						propertyKey: 'translationY',
						keyframes: {
							'k1': {
								time: 200,
								value: 20,
								easing: 'Linear.None'
							},
							'k2': {
								time: 100,
								value: 50,
								easing: 'Linear.None'
							}
						}
					}
				},
				loop: {
					enabled: false
				}
			};
		},
		quad: function () {
			return {
				materialRef: this.material().id
			};
		},
		html: function () {
			return {
				innerHTML: 'some html'
			};
		},
		collider: function (type) {
			return _.defaults({}, {
				shape: type || 'Box', // Box, Cylinder, Plane, Sphere
				isTrigger: false,
				friction: 0.3,
				restitution: 0.0,
				shapeOptions: {
					halfExtents: [1, 1, 1], // Box
					radius: 0.5, // Sphere, Cylinder
					height: 1 // Cylinder
				}
			});
		},
		rigidBody: function () {
			return {
				mass: 1,
				isKinematic: false,
				velocity: [0, 0, 0],
				angularVelocity: [0, 0, 0],
				linearDrag: 0,
				angularDrag: 0
			};
		}
	},
	attachChild: function (parent, child) {
		if (!parent.components.transform.children) {
			parent.components.transform.children = {};
		}
		var size = Object.keys(parent.components.transform.children).length;
		parent.components.transform.children[child.id] = {
			entityRef: child.id,
			sortValue: size
		};
	}
};


var _ = require("../../src/goo/util/ObjectUtil");

module.exports = {
	material: function () {
		var material = this.gooObject('material', 'Dummy');
		_.extend(material, {
			uniforms: {
				materialAmbient: {
					value: [0, 0, 0, 1],
					enabled: true
				},
				materialDiffuse: {
					value: [1, 1, 1, 1],
					enabled: true
				}
			},
			texturesMapping: {},
			shaderRef: this.shader().id,
			blendState: {
				blending: 'NoBlending',
				blendEquation: 'AddEquation',
				blendSrc: 'SrcAlphaFactor',
				blendDst: 'OneMinusSrcAlhphaFactor'
			},
			cullState: {
				enabled: true,
				cullFace: 'Back',
				frontFace: 'CCW'
			},
			depthState: {
				enabled: true,
				write: true
			},
			renderQueue: -1
		});
		return material;
	},
	texture: function () {
		var texture = this.gooObject('texture', 'Dummy');
		_.extend(texture, {
			magFilter: 'Bilinear',
			minFilter: 'Trilinear',
			offset: [0, 0],
			repeat: [1, 1],
			imageRef: (typeof(window) !== 'undefined' && window.__karma__ ? 'base/test/unit/loaders/res/' : '') + 'checker.png',
			wrapS: 'Repeat',
			wrapT: 'Repeat',
			anisotropy: 1,
			flipY: true
		});
		return texture;
	},
	textureSVG: function () {
		var texture = this.gooObject('texture', 'Dummy');
		_.extend(texture, {
			magFilter: 'Bilinear',
			minFilter: 'Trilinear',
			offset: [0, 0],
			repeat: [1, 1],
			svgData: "<svg xmlns='http://www.w3.org/2000/svg' width='200' height='100'><rect x='0' y='0' width='200' height='100' fill='blue' /></svg>",
			wrapS: 'Repeat',
			wrapT: 'Repeat',
			anisotropy: 1,
			flipY: true
		});
		return texture;
	},
	shader: function () {
		var shader = this.gooObject('shader', 'Dummy');
		_.extend(shader, {
			attributes: {
				vertexPoisition: 'POSITION',
				vertexNormal: 'NORMAL',
				vertexUV0: 'TEXCOORD0'
			},
			uniforms: {
				viewMatrix: 'VIEW_MATRIX',
				projectionMatrix: 'PROJECTION_MATRIX',
				worldMatrix: 'WORLD_MATRIX',
				cameraPosition: 'CAMERA'
			},
			vshaderRef: this.vshader(),
			fshaderRef: this.fshader(),
			processors: [
				'uber'
			]
		});
		return shader;
	},
	vshader: function () {
		var ref = this.randomRef('vert');
		var code = "void main() { gl_Position = vec4(1.0); }";
		this.addToBundle(code, ref);
		return ref;
	},
	fshader: function () {
		var ref = this.randomRef('frag');
		var code = "void main() { gl_FragColor = vec4(1.0); }";
		this.addToBundle(code, ref);
		return ref;
	}
};

var _ = require("../../src/goo/util/ObjectUtil");

module.exports = {
	mesh: function () {
		var config = this.gooObject('mesh', 'Dummy');
		var samples = 3;
		_.extend(config, {
			binaryRef: this.binary(128),
			type: 'Mesh',
			indexLengths: [samples],
			indexModes: ['Triangles'],
			attributes: {
				POSITION: {
					value: [0, samples * 3, 'float32'],
					dimensions: 3
				},
				NORMAL: {
					value: [36, samples * 3, 'float32'],
					dimensions: 3
				},
				TEXCOORD0: {
					value: [72, samples * 2, 'float32'],
					dimensions: 2
				}
			},
			vertexCount: samples,
			indices: [96, samples, 'uint16']
		});
		return config;
	}
};


var _ = require("../../src/goo/util/ObjectUtil");

module.exports = {
	posteffects: function () {
		var config = this.gooObject('posteffects', 'Dummy');
		_.extend(config, {
			posteffects: {
				myBloomEffect: {
					name: 'Bloom',
					type: 'Bloom',
					sortValue: 1,
					id: 'myBloomEffect',
					enabled: true,
					options: {}
				}
			}
		});
		return config;
	}
};


var _ = require("../../src/goo/util/ObjectUtil");

module.exports = {
	scene: function (complex) {
		var entities = {};
		var components = complex ? ['transform', 'meshRenderer', 'meshData', 'animation', 'camera', 'light'] : null;
		for (var i = 0; i < 5; i++) {
			var entity = this.entity(components);
			entities[entity.id] = {
				sortValue: i,
				entityRef: entity.id
			};
		}
		var scene = this.gooObject('scene', 'Dummy');
		scene.entities = entities;
		return scene;
	},
	project: function (complex) {
		var project = this.gooObject('project', 'Dummy');
		project.scenes = {};

		var sceneWrapper;
		for (var i = 0; i < 3; i++) {
			var scene = this.scene(complex);
			sceneWrapper = {
				sortValue: Math.random(),
				sceneRef: scene.id
			};
			project.scenes[scene.id] = sceneWrapper;
		}
		project.mainSceneRef = sceneWrapper.sceneRef;
		return project;
	},
	skybox: function (type) {
		var config = this.gooObject('skybox', 'Dummy');
		if (type === 'sphere') {
			config.sphere = {
				enabled: true,
				sphereRef: this.texture().id
			};
		} else {
			config.box = {
				enabled: true,
				topRef: this.texture().id,
				bottomRef: this.texture().id,
				leftRef: this.texture().id,
				rightRef: this.texture().id,
				frontRef: this.texture().id,
				backRef: this.texture().id
			};
		}
		return config;
	},
	environment: function () {
		var config = this.gooObject('environment', 'Dummy');
		_.extend(config, {
			backgroundColor: [1, 1, 1],
			globalAmbient: [0.5, 0.5, 0.5],
			skyboxRef: this.skybox().id,
			fog: {
				enabled: true,
				color: [1, 0, 0],
				near: 1,
				far: 100
			},
			weather: {
				snow: {
					velocity: 10,
					rate: 2,
					enabled: true,
					height: 100
				}
			}
		});
		return config;
	}
};




var MathUtils = require("../../src/goo/math/MathUtils");
var Vector3 = require("../../src/goo/math/Vector3");
var Vector2 = require("../../src/goo/math/Vector2");

describe('MathUtils', function () {
	it('can convert to radians from degrees', function () {
		expect(MathUtils.radFromDeg(90)).toEqual(Math.PI * 0.5);
	});

	it('can convert to degrees from radians', function () {
		expect(MathUtils.degFromRad(Math.PI * 0.5)).toEqual(90);
	});

	it('can perform linear interpolation', function () {
		expect(MathUtils.lerp(-1.0, 10.0, 20.0)).toEqual( 0.0);
		expect(MathUtils.lerp(0.0, 10.0, 20.0)).toEqual(10.0);
		expect(MathUtils.lerp(0.5, 10.0, 20.0)).toEqual(15.0);
		expect(MathUtils.lerp(1.0, 10.0, 20.0)).toEqual(20.0);
		expect(MathUtils.lerp(2.0, 10.0, 20.0)).toEqual(30.0);
		expect(MathUtils.lerp(1.0, 5.0, 5.0)).toEqual(5.0);
	});

	it('can clamp a value to a given interval', function () {
		expect(MathUtils.clamp(1.0, 2.0, 3.0)).toEqual(2.0);
		expect(MathUtils.clamp(1.0, 3.0, 2.0)).toEqual(2.0);
		expect(MathUtils.clamp(4.0, 2.0, 3.0)).toEqual(3.0);
		expect(MathUtils.clamp(4.0, 3.0, 2.0)).toEqual(3.0);
		expect(MathUtils.clamp(2.5, 2.0, 3.0)).toEqual(2.5);
	});

	it('can compute values on cubic s-curves', function () {
		expect(MathUtils.scurve3(0.00)).toEqual(0.0);
		expect(MathUtils.scurve3(0.25)).toEqual((-2.0 * 0.25 + 3.0) * 0.25 * 0.25);
		expect(MathUtils.scurve3(0.50)).toEqual(0.5);
		expect(MathUtils.scurve3(0.75)).toEqual((-2.0 * 0.75 + 3.0) * 0.75 * 0.75);
		expect(MathUtils.scurve3(1.00)).toEqual(1.0);
	});

	it('can compute values on quintic s-curves', function () {
		expect(MathUtils.scurve5(0.00)).toEqual(0.0);
		expect(MathUtils.scurve5(0.25)).toEqual(((6.0 * 0.25 - 15.0) * 0.25 + 10.0) * 0.25 * 0.25 * 0.25);
		expect(MathUtils.scurve5(0.50)).toEqual(0.5);
		expect(MathUtils.scurve5(0.75)).toEqual(((6.0 * 0.75 - 15.0) * 0.75 + 10.0) * 0.75 * 0.75 * 0.75);
		expect(MathUtils.scurve5(1.00)).toEqual(1.0);
	});

	it('can convert to cartesian coordinates from spherical coordinates', function (){
		var c = new Vector3();

		MathUtils.sphericalToCartesian(16, 0, 0, c);
		expect(c.x).toBeCloseTo(16);
		expect(c.y).toBeCloseTo(0);
		expect(c.z).toBeCloseTo(0);

		MathUtils.sphericalToCartesian(16, Math.PI / 2, 0, c);
		expect(c.x).toBeCloseTo(0);
		expect(c.y).toBeCloseTo(0);
		expect(c.z).toBeCloseTo(16);

		MathUtils.sphericalToCartesian(4, Math.PI / 2, Math.PI / 4, c);
		expect(c.x).toBeCloseTo(0);
		expect(c.y).toBeCloseTo(Math.sqrt(8));
		expect(c.z).toBeCloseTo(Math.sqrt(8));
	});

	describe('isPowerOfTwo', function () {
		[
			[0, true],
			[1, true],
			[2, true],
			[3, false],
			[8, true],
			[13, false],
			[255, false],
			[256, true],
			[257, false]
		].forEach(function (pair) {
			it(pair[0] + ' is ' + (pair[1] ? '' : 'not ') + 'a power of two', function () {
				expect(MathUtils.isPowerOfTwo(pair[0])).toEqual(pair[1]);
			});
		});
	});

	describe('nearestPowerOfTwo', function () {
		[
			[0, 0],
			[1, 1],
			[2, 2],
			[3, 4],
			[8, 8],
			[13, 16],
			[255, 256],
			[256, 256],
			[257, 512]
		].forEach(function (pair) {
			it('the nearest power of two of ' + pair[0] + ' is ' + pair[1], function () {
				expect(MathUtils.nearestPowerOfTwo(pair[0])).toEqual(pair[1]);
			});
		});
	});

	it('can compute the area of a triangle', function () {
		expect(MathUtils.triangleArea(new Vector2(5, 5), new Vector2(5, 6), new Vector2(7, 5))).toBeCloseTo(1.0);
	});

	it('can do barycentric interpolation', function () {
		var t1 = new Vector3(2, 2, 30);
		var t2 = new Vector3(4, 2, 40);
		var t3 = new Vector3(2, 6, 50);

		expect(MathUtils.barycentricInterpolation(t1, t2, t3, new Vector3(2, 4, 123)).z).toBeCloseTo(40);
		expect(MathUtils.barycentricInterpolation(t1, t2, t3, new Vector3(3, 2, 123)).z).toBeCloseTo(35);
		expect(MathUtils.barycentricInterpolation(
			t1, t2, t3, new Vector3((t1.x + t2.x + t3.x) / 3, (t1.y + t2.y + t3.y) / 3, 123)).z
		).toBeCloseTo(40);
	});

	it('gets the correct triangle normal', function () {
		var p1 = [0, 0, 0];
		var p2 = [0, 1, 0];
		var p3 = [1, 1, 0];
		expect(MathUtils.getTriangleNormal(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2], p3[0], p3[1], p3[2]))
			.toEqual([0, 0, -1]);

		p1 = [0, 0, 0];
		p2 = [0, 0, 1];
		p3 = [1, 0, 1];
		expect(MathUtils.getTriangleNormal(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2], p3[0], p3[1], p3[2]))
			.toEqual([0, 1, 0]);

		p1 = [1, 0, 0];
		p2 = [0, 1, 0];
		p3 = [0, 0, 1];
		expect(MathUtils.getTriangleNormal(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2], p3[0], p3[1], p3[2]))
			.toEqual([1, 1, 1]);
	});

	it('can do positive modulo', function () {
		expect(MathUtils.moduloPositive(-Math.PI / 2, 2 * Math.PI)).toBeCloseTo(3 * Math.PI / 2);
	});

	it('can check if a value is close to another', function () {
		expect(MathUtils.closeTo(1, 1)).toBeTruthy();
		expect(MathUtils.closeTo(1, 2)).toBeFalsy();
		expect(MathUtils.closeTo(1, 1.01, 0.02)).toBeTruthy();
		expect(MathUtils.closeTo(1, 1.02, 0.01)).toBeFalsy();
	});

	it('can get the sign of a number', function () {
		expect(MathUtils.sign(1)).toBe(1);
		expect(MathUtils.sign(-1)).toBe(-1);
		expect(MathUtils.sign(1.4)).toBe(1);
		expect(MathUtils.sign(-1.4)).toBe(-1);
		expect(MathUtils.sign(0)).toBe(0);
	});

	it('can do radial clamping', function () {
		var a = -1;
		a = MathUtils.radialClamp(a, 0, 9);
		expect(a).toBe(0);
	});
});


var Matrix = require("../../src/goo/math/Matrix");
var CustomMatchers = require("./CustomMatchers");

describe('Matrix', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	// SHIM START

	describe('add', function () {
		it('can perform component-wise addition between two matrices', function () {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(2, 4, 6, 8);

			a.add(a);

			expect(a).toBeCloseToMatrix(new Matrix(2, 2).set(4, 8, 12, 16));
			expect(Matrix.add(b, b)).toBeCloseToMatrix(new Matrix(2, 2).set(4, 8, 12, 16));
		});

		it('performs partial addition when applied to matrices of different size', function () {
			var m2 = new Matrix(2, 2).set(1, 2, 3, 4);
			var m3 = new Matrix(3, 3).set(1, 2, 3, 4, 5, 6, 7, 8, 9);

			var expected1 = new Matrix(2, 2).set(2, 4, 6, 8);
			expect(Matrix.add(m2, m3)).toBeCloseToMatrix(expected1);

			var expected2 = new Matrix(3, 3).set(2, 4, 6, 8, NaN, NaN, NaN, NaN, NaN);
			expect(Matrix.add(m3, m2)).toBeCloseToMatrix(expected2);
		});
	});

	describe('sub', function () {
		it('can perform component-wise subtraction between two matrices', function () {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(2, 4, 6, 8);

			a.sub(a);

			expect(a).toBeCloseToMatrix(new Matrix(2, 2).set(0, 0, 0, 0));
			expect(Matrix.sub(b, b)).toBeCloseToMatrix(new Matrix(2, 2).set(0, 0, 0, 0));
		});

		it('performs partial subtraction when applied to matrices of different size', function () {
			var m2 = new Matrix(2, 2).set(1, 2, 3, 4);
			var m3 = new Matrix(3, 3).set(1, 2, 3, 4, 5, 6, 7, 8, 9);

			var expected1 = new Matrix(2, 2).set(0, 0, 0, 0);
			expect(Matrix.sub(m2, m3)).toBeCloseToMatrix(expected1);

			var expected2 = new Matrix(3, 3).set(0, 0, 0, 0, NaN, NaN, NaN, NaN, NaN);
			expect(Matrix.sub(m3, m2)).toBeCloseToMatrix(expected2);
		});
	});

	describe('mul', function () {
		it('can perform component-wise multiplication between two matrices', function () {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(2, 4, 6, 8);

			a.mul(a);

			expect(a).toBeCloseToMatrix(new Matrix(2, 2).set(4, 16, 36, 64));
			expect(Matrix.mul(b, b)).toBeCloseToMatrix(new Matrix(2, 2).set(4, 16, 36, 64));
		});

		it('performs partial multiplication when applied to matrices of different size', function () {
			var m2 = new Matrix(2, 2).set(1, 2, 3, 4);
			var m3 = new Matrix(3, 3).set(1, 2, 3, 4, 5, 6, 7, 8, 9);

			var expected1 = new Matrix(2, 2).set(1, 4, 9, 16);
			expect(Matrix.mul(m2, m3)).toBeCloseToMatrix(expected1);

			var expected2 = new Matrix(3, 3).set(1, 4, 9, 16, NaN, NaN, NaN, NaN, NaN);
			expect(Matrix.mul(m3, m2)).toBeCloseToMatrix(expected2);
		});
	});

	describe('div', function () {
		it('can perform component-wise division between two matrices', function () {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(2, 4, 6, 8);

			a.div(a);

			expect(a).toBeCloseToMatrix(new Matrix(2, 2).set(1, 1, 1, 1));
			expect(Matrix.div(b, b)).toBeCloseToMatrix(new Matrix(2, 2).set(1, 1, 1, 1));
		});

		it('performs partial multiplication when applied to matrices of different size', function () {
			var m2 = new Matrix(2, 2).set(1, 2, 3, 4);
			var m3 = new Matrix(3, 3).set(1, 2, 3, 4, 5, 6, 7, 8, 9);

			var expected1 = new Matrix(2, 2).set(1, 1, 1, 1);
			expect(Matrix.div(m2, m3)).toBeCloseToMatrix(expected1);

			var expected2 = new Matrix(3, 3).set(1, 1, 1, 1, NaN, NaN, NaN, NaN, NaN);
			expect(Matrix.div(m3, m2)).toBeCloseToMatrix(expected2);
		});
	});

	it('Can perform component-wise addition between a matrix and a scalar', function () {
		var a = new Matrix(2, 2).set(2, 4, 6, 8);
		var b = new Matrix(2, 2).set(2, 4, 6, 8);

		a.add(2);

		expect(a).toBeCloseToMatrix(new Matrix(2, 2).set(4, 6, 8, 10));
		expect(Matrix.add(b, 2)).toBeCloseToMatrix(new Matrix(2, 2).set(4, 6, 8, 10));
	});

	it('can perform component-wise subtraction between a matrix and a scalar', function () {
		var a = new Matrix(2, 2).set(2, 4, 6, 8);
		var b = new Matrix(2, 2).set(2, 4, 6, 8);

		a.sub(2);

		expect(a).toBeCloseToMatrix(new Matrix(2, 2).set(0, 2, 4, 6));
		expect(Matrix.sub(b, 2)).toBeCloseToMatrix(new Matrix(2, 2).set(0, 2, 4, 6));
	});

	it('can perform component-wise multiplication between a matrix and a scalar', function () {
		var a = new Matrix(2, 2).set(2, 4, 6, 8);
		var b = new Matrix(2, 2).set(2, 4, 6, 8);

		a.mul(2);

		expect(a).toBeCloseToMatrix(new Matrix(2, 2).set(4, 8, 12, 16));
		expect(Matrix.mul(b, 2)).toBeCloseToMatrix(new Matrix(2, 2).set(4, 8, 12, 16));
	});

	it('can perform component-wise division between a matrix and a scalar', function () {
		var a = new Matrix(2, 2).set(2, 4, 6, 8);
		var b = new Matrix(2, 2).set(2, 4, 6, 8);

		a.div(2);

		expect(a).toBeCloseToMatrix(new Matrix(2, 2).set(1, 2, 3, 4));
		expect(Matrix.div(b, 2)).toBeCloseToMatrix(new Matrix(2, 2).set(1, 2, 3, 4));
	});

	describe('combine', function () {
		it('can combine multiple matrices into a single matrix', function () {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(2, 4, 6, 8);

			a.combine(a);

			expect(a).toBeCloseToMatrix(new Matrix(2, 2).set(28, 40, 60, 88));
			expect(Matrix.combine(b, b)).toBeCloseToMatrix(new Matrix(2, 2).set(28, 40, 60, 88));
		});

		it('performs partial combination when applied to matrices of different size', function () {
			var m2 = new Matrix(2, 2).set(1, 2, 3, 4);
			var m3 = new Matrix(3, 3).set(1, 2, 3, 4, 5, 6, 7, 8, 9);

			// reusults are unpredictable - they're surely going to be some matrices partially filled with NaN
			expect(Matrix.combine(m2, m3)).toEqual(jasmine.any(Matrix));
			expect(Matrix.combine(m3, m2)).toEqual(jasmine.any(Matrix));
		});
	});

	describe('transpose', function () {
		it('can be transposed', function () {
			var a = new Matrix(2, 2).set(0, 1, 2, 3);
			var b = new Matrix(2, 2).set(0, 1, 2, 3);
			var c = new Matrix(3, 2).set(0, 1, 2, 3, 4, 5);

			a.transpose();

			expect(a).toBeCloseToMatrix(new Matrix(2, 2).set(0, 2, 1, 3));
			expect(Matrix.transpose(b, b)).toBeCloseToMatrix(new Matrix(2, 2).set(0, 2, 1, 3));
			expect(Matrix.transpose(c)).toBeCloseToMatrix(new Matrix(2, 3).set(0, 3, 1, 4, 2, 5));
		});

		it('performs partial combination when applied to matrices of different size', function () {
			var m32 = new Matrix(3, 2).set(0, 1, 2, 3, 4, 5);

			// reusults are unpredictable - they're surely going to be some matrices partially filled with NaN
			expect(Matrix.transpose(m32, m32)).toEqual(jasmine.any(Matrix));
		});
	});

	it('can be copied', function () {
		var a = new Matrix(2, 2).set(0, 1, 2, 3);
		var b = new Matrix(2, 2).set();

		b.copy(a);

		expect(b).toEqual(a);
		expect(Matrix.copy(b, a)).toEqual(a);
	});

	it('can be set', function () {
		var a = new Matrix(2, 2);
		var b = new Matrix(2, 2);
		var c = new Matrix(2, 2);

		expect(a.set(0, 1, 2, 3)).toBeCloseToMatrix(new Matrix(2, 2).set(0, 1, 2, 3));
		expect(b.set(a)).toEqual(a);
		expect(c.set([0, 1, 2, 3])).toBeCloseToMatrix(new Matrix(2, 2).set(0, 1, 2, 3));
	});

	it('can be converted to a string', function () {
		var a = new Matrix(2, 2).set(0, 1, 2, 3);

		expect(a.toString()).toEqual('[0, 1], [2, 3]');
	});

	it('can determine orthogonality', function () {
		var a = new Matrix(2, 2).set(2, 4, 6, 8);
		var b = new Matrix(2, 2).set(0, 1, -1, 0);

		expect(a.isOrthogonal()).toEqual(false);
		expect(b.isOrthogonal()).toEqual(true);
	});

	it('can determine normality', function () {
		var a = new Matrix(2, 2).set(2, 4, 6, 8);
		var b = new Matrix(2, 2).set(0, 1, -1, 0);

		expect(a.isNormal()).toEqual(false);
		expect(b.isNormal()).toEqual(true);
	});

	it('can determine orthonormality', function () {
		var a = new Matrix(2, 2).set(2, 4, 6, 8);
		var b = new Matrix(2, 2).set(0, 1, -1, 0);

		expect(a.isOrthonormal()).toEqual(false);
		expect(b.isOrthonormal()).toEqual(true);
	});

	describe('', function () {
		it('can be tested for approximate equaltiy', function () {
			var a = new Matrix(2, 2).set(1, 2, 3, 4);
			var b = new Matrix(2, 2).set(1, 2, 3, 4);
			var c = new Matrix(2, 2).set(0, 1, 2, 3);

			expect(a.equals(b)).toEqual(true);
			expect(Matrix.equals(a, b)).toEqual(true);
			expect(a.equals(c)).toEqual(false);
			expect(Matrix.equals(a, c)).toEqual(false);
		});

		it('preserves behaviour of comparing with NaN', function () {
			// 1 === NaN // false in JS, so (1, 2) === (1, NaN) should return the same
			var m1 = new Matrix(2, 2).set(1, 2, 3, 4);
			var m2 = new Matrix(2, 2).set(1, 2, 3, NaN);

			expect(m1.equals(m2)).toBeFalsy();
		});
	});

	// SHIM END
});


var Matrix2 = require("../../src/goo/math/Matrix2");
var CustomMatchers = require("./CustomMatchers");

describe('Matrix2', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	describe('constructor', function () {
		it('creates an identity matrix when given no parameters', function () {
			expect(new Matrix2()).toBeCloseToMatrix(Matrix2.IDENTITY);
		});

		it('creates a matrix when given 4 parameters', function () {
			var matrix = new Matrix2(11, 22, 33, 44);
			var expected = new Matrix2();

			for (var i = 0; i < 4; i++) {
				expected.data[i] = (i + 1) * 11;
			}

			expect(matrix).toBeCloseToMatrix(expected);
		});

		it('creates a matrix when given an array', function () {
			var matrix = new Matrix2([11, 22, 33, 44]);
			var expected = new Matrix2();

			for (var i = 0; i < 4; i++) {
				expected.data[i] = (i + 1) * 11;
			}

			expect(matrix).toBeCloseToMatrix(expected);
		});

		it('creates a matrix when given another matrix', function () {
			var expected = new Matrix2(11, 22, 33, 44);
			var matrix = new Matrix2(expected);

			expect(matrix).toBeCloseToMatrix(expected);
		});
	});

	describe('mul', function () {
		it('can multiply this matrix with another matrix', function () {
			var a = new Matrix2(1, 2, 3, 4);
			var b = new Matrix2(2, 3, 5, 7);

			a.mul(b);

			expect(a).toBeCloseToMatrix(new Matrix2(12, 17, 24, 37));
		});
	});

	describe('mul2', function () {
		it('can multiply 2 matrices and store the result in this matrix', function () {
			var a = new Matrix2(1, 2, 3, 4);
			var b = new Matrix2(2, 3, 5, 7);
			var result = new Matrix2();

			result.mul2(a, b);

			expect(result).toBeCloseToMatrix(new Matrix2(11, 16, 24, 38));
		});
	});

	it('can be transposed', function () {
		var a = new Matrix2(1, 2, 3, 4);

		a.transpose();

		expect(a).toBeCloseToMatrix(new Matrix2(1, 3, 2, 4));
	});

	it('can be inverted', function () {
		var a = new Matrix2(1, 2, 3, 4);

		a.invert();

		expect(a).toBeCloseToMatrix(new Matrix2(-2, 1, 1.5, -0.5));
	});

	it('can determine orthogonality', function () {
		var a = new Matrix2(1, 2, 3, 4);
		var b = new Matrix2(0, 1, -1, 0);

		expect(a.isOrthogonal()).toEqual(false);
		expect(b.isOrthogonal()).toEqual(true);
	});

	it('can determine normality', function () {
		var a = new Matrix2(1, 2, 3, 4);
		var b = new Matrix2(0, 1, -1, 0);

		expect(a.isNormal()).toEqual(false);
		expect(b.isNormal()).toEqual(true);
	});

	it('can determine orthonormality', function () {
		var a = new Matrix2(1, 2, 3, 4);
		var b = new Matrix2(0, 1, -1, 0);

		expect(a.isOrthonormal()).toEqual(false);
		expect(b.isOrthonormal()).toEqual(true);
	});

	it('can compute determinants', function () {
		var a = new Matrix2(1, 2, 3, 4);

		expect(a.determinant()).toEqual(-2);
	});

	it('can be set to identity', function () {
		var a = new Matrix2();
		var b = new Matrix2(1, 2, 3, 4);

		b.setIdentity();

		expect(a).toEqual(Matrix2.IDENTITY);
		expect(b).toEqual(Matrix2.IDENTITY);
	});

	describe('add', function () {
		it('can add 2 matrices', function () {
			var a = new Matrix2(1, 2, 3, 4);
			var b = new Matrix2(2, 3, 5, 7);

			a.add(b);

			expect(a).toBeCloseToMatrix(new Matrix2(1 + 2, 2 + 3, 3 + 5, 4 + 7));
		});
	});

	describe('sub', function () {
		it('can subtract one matrix from another', function () {
			var a = new Matrix2(1, 2, 3, 4);
			var b = new Matrix2(2, 3, 5, 7);

			b.sub(a);

			expect(b).toBeCloseToMatrix(new Matrix2(2 - 1, 3 - 2, 5 - 3, 7 - 4));
		});
	});

	describe('equals', function () {
		it('can be tested for approximate equaltiy', function () {
			var a = new Matrix2(1, 2, 3, 4);
			var b = new Matrix2(1, 2, 3, 4);
			var c = new Matrix2(0, 1, 2, 3);

			expect(a.equals(b)).toBe(true);
			expect(a.equals(c)).toBe(false);
		});

		it('preserves behaviour of comparing with NaN', function () {
			// 1 === NaN // false in JS, so (1, 2) === (1, NaN) should return the same
			var m1 = new Matrix2(1, 2, 3, 4);
			var m2 = new Matrix2(1, 2, 3, NaN);

			expect(m1.equals(m2)).toBe(false);
		});
	});

	describe('copy', function () {
		it('can copy from another matrix', function () {
			var original = new Matrix2(11, 22, 33, 44);
			var copy = new Matrix2(55, 66, 77, 88);
			copy.copy(original);
			expect(copy).toBeCloseToMatrix(new Matrix2(11, 22, 33, 44));
		});
	});

	describe('clone', function () {
		it('clones a matrix', function () {
			var original = new Matrix2(11, 22, 33, 44);
			var clone = original.clone();

			expect(clone).toBeCloseToMatrix(original);
			expect(clone).not.toBe(original);
		});
	});

	describe('deprecated shim added 2015-10-07 (v1.0)', function () {
		it('can add', function () {
			var a = new Matrix2(1, 2, 3, 4);
			var b = new Matrix2();
			Matrix2.add(a, a, b);
			expect(b).toBeCloseToMatrix(new Matrix2(2, 4, 6, 8));
			expect(Matrix2.add(a, a)).toBeCloseToMatrix(new Matrix2(2, 4, 6, 8));
			expect(a.add(a)).toBeCloseToMatrix(new Matrix2(2, 4, 6, 8));
		});

		it('can add scalar', function () {
			var a = new Matrix2(1, 2, 3, 4);
			var b = new Matrix2();
			Matrix2.add(a, 1, b);
			expect(b).toBeCloseToMatrix(new Matrix2(2, 3, 4, 5));
		});

		it('can combine multiple matrices into a single matrix', function () {
			var a = new Matrix2(1, 2, 3, 4);
			var b = new Matrix2(1, 2, 3, 4);

			a.combine(a);

			expect(a).toBeCloseToMatrix(new Matrix2(7, 10, 15, 22));
			expect(Matrix2.combine(b, b)).toBeCloseToMatrix(new Matrix2(7, 10, 15, 22));
		});
		it('can divide', function () {
			var a = new Matrix2(1, 2, 3, 4);
			var b = new Matrix2(1, 2, 3, 4);

			a.div(a);

			expect(a).toBeCloseToMatrix(new Matrix2(1, 1, 1, 1));
			expect(Matrix2.div(b, b)).toBeCloseToMatrix(new Matrix2(1, 1, 1, 1));
		});
		it('can divide with scalar', function () {
			var a = new Matrix2(2, 2, 2, 2);
			var b = 2;

			a.div(b);

			expect(a).toBeCloseToMatrix(new Matrix2(1, 1, 1, 1));
		});
		it('can be transposed', function () {
			var a = new Matrix2(1, 2, 3, 4);
			Matrix2.transpose(a, a);
			expect(a).toBeCloseToMatrix(new Matrix2(1, 3, 2, 4));
		});
		it('can subtract one matrix from another', function () {
			var a = new Matrix2(1, 2, 3, 4);
			var b = new Matrix2(2, 3, 5, 7);

			Matrix2.sub(b, a, b);

			expect(b).toBeCloseToMatrix(new Matrix2(2 - 1, 3 - 2, 5 - 3, 7 - 4));
		});
	});
});


var Quaternion = require("../../src/goo/math/Quaternion");
var Matrix3 = require("../../src/goo/math/Matrix3");
var Vector3 = require("../../src/goo/math/Vector3");
var CustomMatchers = require("./CustomMatchers");

describe('Matrix3', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	describe('constructor', function () {
		it('creates an identity matrix when given no parameters', function () {
			expect(new Matrix3()).toBeCloseToMatrix(Matrix3.IDENTITY);
		});

		it('creates a matrix when given 9 parameters', function () {
			var matrix = new Matrix3(11, 22, 33, 44, 55, 66, 77, 88, 99);
			var expected = new Matrix3();

			for (var i = 0; i < 9; i++) {
				expected.data[i] = (i + 1) * 11;
			}

			expect(matrix).toBeCloseToMatrix(expected);
		});

		it('creates a matrix when given an array', function () {
			var matrix = new Matrix3([11, 22, 33, 44, 55, 66, 77, 88, 99]);
			var expected = new Matrix3();

			for (var i = 0; i < 9; i++) {
				expected.data[i] = (i + 1) * 11;
			}

			expect(matrix).toBeCloseToMatrix(expected);
		});

		it('creates a matrix when given another matrix', function () {
			var expected = new Matrix3(11, 22, 33, 44, 55, 66, 77, 88, 99);
			var matrix = new Matrix3(expected);

			expect(matrix).toBeCloseToMatrix(expected);
		});
	});

	describe('mul', function () {
		it('multiplies this matrix with another matrix', function () {
			var a = new Matrix3(1, 2, 3, 4, 5, 6, 7, 8, 9);
			var b = new Matrix3(2, 3, 5, 7, 11, 13, 17, 19, 23);

			a.mul(b);

			expect(a).toBeCloseToMatrix(new Matrix3(67, 82, 100, 145, 181, 223, 223, 280, 346));
		});
	});

	describe('mul2', function () {
		it('multiplies another matrix with this matrix', function () {
			var a = new Matrix3(1, 2, 3, 4, 5, 6, 7, 8, 9);
			var b = new Matrix3(2, 3, 5, 7, 11, 13, 17, 19, 23);
			var result = new Matrix3();

			result.mul2(a, b);

			expect(result).toBeCloseToMatrix(new Matrix3(49, 59, 69, 142, 173, 204, 254, 313, 372));
		});
	});

	it('can be transposed', function () {
		var a = new Matrix3(1, 2, 3, 4, 5, 6, 7, 8, 9);

		a.transpose();

		expect(a).toBeCloseToMatrix(new Matrix3(1, 4, 7, 2, 5, 8, 3, 6, 9));
	});

	it('can be inverted', function () {
		var a = new Matrix3(0, 0, 1, -1, 2, 0, 0, 1, -2);
		var b = new Matrix3(0, 0, 1, -1, 2, 0, 0, 1, -2);
		var c = new Matrix3(0, 0, 0, 1, 2, 3, 4, 5, 6);

		a.invert();

		expect(a).toBeCloseToMatrix(new Matrix3(4, -1, 2, 2, 0, 1, 1, 0, 0));
		expect(Matrix3.invert(b)).toBeCloseToMatrix(new Matrix3(4, -1, 2, 2, 0, 1, 1, 0, 0));
		expect(c.invert()).toBeCloseToMatrix(c);
	});

	it('can determine orthogonality', function () {
		var a = new Matrix3(0, 0, 1, -1, 2, 0, 0, 1, -2);
		var b = new Matrix3(0, -1, 0, 1, 0, 0, 0, 0, -1);

		expect(a.isOrthogonal()).toBeFalsy();
		expect(b.isOrthogonal()).toBeTruthy();
	});

	it('can determine normality', function () {
		var a = new Matrix3(0, 0, 1, -1, 2, 0, 0, 1, -2);
		var b = new Matrix3(0, -1, 0, 1, 0, 0, 0, 0, -1);

		expect(a.isNormal()).toBeFalsy();
		expect(b.isNormal()).toBeTruthy();
	});

	it('can determine orthonormality', function () {
		var a = new Matrix3(0, 0, 1, -1, 2, 0, 0, 1, -2);
		var b = new Matrix3(0, -1, 0, 1, 0, 0, 0, 0, -1);

		expect(a.isOrthonormal()).toBeFalsy();
		expect(b.isOrthonormal()).toBeTruthy();
	});

	it('can compute determinants', function () {
		var a = new Matrix3(1, 2, 3, 4, 5, 6, 7, 8, 9);

		expect(a.determinant()).toBeCloseTo(0);
	});

	it('can be set to identity', function () {
		var a = new Matrix3();
		var b = new Matrix3(1, 2, 3, 4, 5, 6, 7, 8, 9);

		b.setIdentity();

		expect(a).toBeCloseToMatrix(Matrix3.IDENTITY);
		expect(b).toBeCloseToMatrix(Matrix3.IDENTITY);
	});

	it('can set the scale part', function () {
		var a = new Matrix3();
		var b = new Matrix3();

		a.multiplyDiagonalPost(new Vector3(1, 2, 3), b);

		expect(b).toBeCloseToMatrix(new Matrix3(1, 0, 0, 0, 2, 0, 0, 0, 3));
	});

	it('can be set from a vector of angles', function () {
		var a = 1.0 / Math.sqrt(2.0);

		expect(new Matrix3().fromAngles(0, Math.PI / 4, 0))
			.toBeCloseToMatrix(new Matrix3(a, 0, -a, 0, 1, 0, a, 0, a));
	});

	it('can be set from an axis and angle', function () {
		var a = 1.0 / Math.sqrt(2.0);

		expect(new Matrix3().fromAngleNormalAxis(Math.PI / 4, 0, 1, 0))
			.toBeCloseToMatrix(new Matrix3(a, 0, -a, 0, 1, 0, a, 0, a));
	});

	it('can be set to look in a specific direction', function () {
		var a = new Matrix3().lookAt(new Vector3(0.0, 0.0, -1.0), new Vector3(0.0, 1.0, 0.0));
		var b = new Matrix3(1, 0, 0, 0, 1, 0, 0, 0, 1);

		expect(a).toBeCloseToMatrix(b);
	});

	it('can be set from a quaternion', function () {
		var a = 1.0 / Math.sqrt(2.0);

		expect(new Matrix3().copyQuaternion(new Quaternion(0.0, Math.sin(Math.PI / 8), 0.0, Math.cos(Math.PI / 8))))
			.toBeCloseToMatrix(new Matrix3(a, 0, -a, 0, 1, 0, a, 0, a));
	});

	it('can retrieve euler angles', function () {
		var testVec = new Vector3(1.4, -1.4, 1.4);
		var testMatrix = new Matrix3().fromAngles(testVec.x, testVec.y, testVec.z);
		var store = new Vector3();
		testMatrix.toAngles(store);
		expect(testVec).toBeCloseToVector(store);
	});

	describe('rotateX', function () {
		it('returns itself when no store matrix is given', function () {
			var a = new Matrix3();
			expect(a.rotateX(1)).toBe(a);
		});
	});

	describe('rotateY', function () {
		it('returns itself when no store matrix is given', function () {
			var a = new Matrix3();
			expect(a.rotateY(1)).toBe(a);
		});
	});

	describe('rotateZ', function () {
		it('returns itself when no store matrix is given', function () {
			var a = new Matrix3();
			expect(a.rotateZ(1)).toBe(a);
		});
	});

	describe('equals', function () {
		it('can be tested for approximate equaltiy', function () {
			var a = new Matrix3(1, 2, 3, 4, 5, 6, 7, 8, 9);
			var b = new Matrix3(1, 2, 3, 4, 5, 6, 7, 8, 9);
			var c = new Matrix3(0, 1, 2, 3, 4, 5, 6, 7, 8);

			expect(a.equals(b)).toBe(true);
			expect(a.equals(c)).toBe(false);
		});

		it('preserves behaviour of comparing with NaN', function () {
			// 1 === NaN // false in JS, so (1, 2) === (1, NaN) should return the same
			var m1 = new Matrix3(1, 2, 3, 4, 5, 6, 7, 8, 9);
			var m2 = new Matrix3(1, 2, 3, NaN, 5, 6, 7, 8, 9);

			expect(m1.equals(m2)).toBe(false);
		});
	});

	describe('copy', function () {
		it('can copy from another matrix', function () {
			var original = new Matrix3(11, 22, 33, 44, 55, 66, 77, 88, 99);
			var copy = new Matrix3(110, 220, 330, 440, 550, 660, 770, 880, 990);
			copy.copy(original);
			expect(copy).toBeCloseToMatrix(new Matrix3(11, 22, 33, 44, 55, 66, 77, 88, 99));
		});
	});

	describe('clone', function () {
		it('clones a matrix', function () {
			var original = new Matrix3(11, 22, 33, 44, 55, 66, 77, 88, 99);
			var clone = original.clone();

			expect(clone).toBeCloseToMatrix(new Matrix3(11, 22, 33, 44, 55, 66, 77, 88, 99));
			expect(clone).not.toBe(original);
		});
	});

	describe('NaN checks (only in dev)', function () {
		it('throws an exception when trying to set a matrix component to NaN', function () {
			var matrix1 = new Matrix3();
			expect(function () { matrix1.e12 = NaN; })
				.toThrow(new Error('Tried setting NaN to matrix component e12'));

			var matrix2 = new Matrix3();
			expect(function () { matrix2[4] = NaN; })
				.toThrow(new Error('Tried setting NaN to matrix component 4'));
		});

		it('throws an exception when trying to corrupt a matrix by using methods', function () {
			var matrix1 = new Matrix3();
			expect(function () { matrix1.add(new Matrix3(NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN)); })
				.toThrow(new Error('Matrix contains NaN at index 0'));

			var matrix2 = new Matrix3();
			expect(function () { matrix2.fromAngles(); })
				.toThrow(new Error('Matrix contains NaN at index 0'));
		});

		it('throws an exception when a corrupt matrix would return NaN', function () {
			var matrix = new Matrix3();
			// manually corrupting this matrix
			// this is the only non-traceable way
			matrix.data[0] = NaN;
			expect(function () { matrix.determinant(); })
				.toThrow(new Error('Matrix method determinant returned NaN'));
		});
	});

	describe('deprecated shim added 2015-10-07 (v1.0)', function () {
		it('Matrix3.add', function () {
			var a = new Matrix3(1, 1, 1, 1, 1, 1, 1, 1, 1);
			Matrix3.add(a, a, a);
			expect(a).toBeCloseToMatrix(new Matrix3(2, 2, 2, 2, 2, 2, 2, 2, 2));
		});

		it('Matrix3.sub', function () {
			var a = new Matrix3(1, 1, 1, 1, 1, 1, 1, 1, 1);
			Matrix3.sub(a, a, a);
			expect(a).toBeCloseToMatrix(new Matrix3(0, 0, 0, 0, 0, 0, 0, 0, 0));
		});

		it('Matrix3.combine', function () {
			var a = new Matrix3(2, 0, 0, 0, 2, 0, 0, 0, 2);
			var b = new Matrix3(3, 0, 0, 0, 3, 0, 0, 0, 3);
			Matrix3.combine(a, b, a);
			expect(a).toBeCloseToMatrix(new Matrix3(6, 0, 0, 0, 6, 0, 0, 0, 6));
		});

		it('Matrix3.prototype.combine', function () {
			var a = new Matrix3(1, 2, 3, 4, 5, 6, 7, 8, 9);
			var b = new Matrix3(1, 2, 3, 4, 5, 6, 7, 8, 9);

			a.combine(a);

			expect(a).toBeCloseToMatrix(new Matrix3(30, 36, 42, 66, 81, 96, 102, 126, 150));
			expect(Matrix3.combine(b, b)).toBeCloseToMatrix(new Matrix3(30, 36, 42, 66, 81, 96, 102, 126, 150));
		});

		it('can be transposed', function () {
			var a = new Matrix3(1, 2, 3, 4, 5, 6, 7, 8, 9);

			expect(Matrix3.transpose(a)).toBeCloseToMatrix(new Matrix3(1, 4, 7, 2, 5, 8, 3, 6, 9));
		});

		it('can transform three-dimensional vectors', function () {
			var a = new Matrix3(1, 2, 3, 4, 5, 6, 7, 8, 9);

			expect(a.applyPost(new Vector3(1, 2, 3))).toBeCloseToVector(new Vector3(30, 36, 42));
		});
	});
});


var Quaternion = require("../../src/goo/math/Quaternion");
var Matrix3 = require("../../src/goo/math/Matrix3");
var Matrix4 = require("../../src/goo/math/Matrix4");
var Vector3 = require("../../src/goo/math/Vector3");
var Vector4 = require("../../src/goo/math/Vector4");
var CustomMatchers = require("./CustomMatchers");

describe('Matrix4', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	describe('constructor', function () {
		it('creates an identity matrix when given no parameters', function () {
			expect(new Matrix4()).toBeCloseToMatrix(Matrix4.IDENTITY);
		});

		it('creates a matrix when given 9 parameters', function () {
			var matrix = new Matrix4(11, 22, 33, 44, 55, 66, 77, 88, 99, 110, 121, 132, 143, 154, 165, 176);
			var expected = new Matrix4();

			for (var i = 0; i < 16; i++) {
				expected.data[i] = (i + 1) * 11;
			}

			expect(matrix).toBeCloseToMatrix(expected);
		});

		it('creates a matrix when given an array', function () {
			var matrix = new Matrix4([11, 22, 33, 44, 55, 66, 77, 88, 99, 110, 121, 132, 143, 154, 165, 176]);
			var expected = new Matrix4();

			for (var i = 0; i < 16; i++) {
				expected.data[i] = (i + 1) * 11;
			}

			expect(matrix).toBeCloseToMatrix(expected);
		});

		it('creates a matrix when given another matrix', function () {
			var expected = new Matrix4(11, 22, 33, 44, 55, 66, 77, 88, 99, 110, 121, 132, 143, 154, 165, 176);
			var matrix = new Matrix4(expected);

			expect(matrix).toBeCloseToMatrix(expected);
		});
	});


	it('can combine multiple matrices into a single matrix', function () {
		var a = new Matrix4(
			1, 2, 3, 4,
			5, 6, 7, 8,
			9, 10, 11, 12,
			13, 14, 15, 16
		);

		var b = new Matrix4(
			2, 3, 5, 7,
			11, 13, 17, 19,
			23, 29, 31, 37,
			41, 43, 47, 53
		);

		a.mul(b);

		expect(a).toBeCloseToMatrix(new Matrix4(
			153, 170, 187, 204,
			476, 536, 596, 656,
			928, 1048, 1168, 1288,
			1368, 1552, 1736, 1920
		));
	});

	it('can be transposed', function () {
		var a = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

		a.transpose();

		expect(a).toBeCloseToMatrix(new Matrix4(1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16));
	});

	it('can be inverted', function () {
		var a = new Matrix4(-1, 2, 0, 1, 1, 0, 2, -1, 0, 0, 1, -1, 1, -2, 1, 0);
		var c = new Matrix4(0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);

		a.invert();

		expect(a).toBeCloseToMatrix(new Matrix4(-0.5, 1, -1.5, -0.5, 0, 0.5, -0.5, -0.5, 0.5, 0, 0.5, 0.5, 0.5, 0, -0.5, 0.5));
		expect(c.invert()).toBeCloseToMatrix(c);
	});

	it('can determine orthogonality', function () {
		var a = new Matrix4(-1, 2, 0, 1, 1, 0, 2, -1, 0, 0, 1, -1, 1, -2, 1, 0);
		var b = new Matrix4(0, -1, 0, 0, 1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1);

		expect(a.isOrthogonal()).toBeFalsy();
		expect(b.isOrthogonal()).toBeTruthy();
	});

	it('can determine normality', function () {
		var a = new Matrix4(-1, 2, 0, 1, 1, 0, 2, -1, 0, 0, 1, -1, 1, -2, 1, 0);
		var b = new Matrix4(0, -1, 0, 0, 1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1);

		expect(a.isNormal()).toBeFalsy();
		expect(b.isNormal()).toBeTruthy();
	});

	it('can determine orthonormality', function () {
		var a = new Matrix4(-1, 2, 0, 1, 1, 0, 2, -1, 0, 0, 1, -1, 1, -2, 1, 0);
		var b = new Matrix4(0, -1, 0, 0, 1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1);

		expect(a.isOrthonormal()).toBeFalsy();
		expect(b.isOrthonormal()).toBeTruthy();
	});

	it('can compute determinants', function () {
		var a = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

		expect(a.determinant()).toEqual(0);
	});

	it('can be set to identity', function () {
		var a = new Matrix4();
		var b = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

		b.setIdentity();

		expect(a).toBeCloseToMatrix(Matrix4.IDENTITY);
		expect(b).toBeCloseToMatrix(Matrix4.IDENTITY);
	});

	it('can be set from a vector of angles', function () {
		var a = 1.0 / Math.sqrt(2.0);

		expect(new Matrix4().setRotationFromVector(new Vector3(0, Math.PI / 4, 0))).toBeCloseToMatrix(new Matrix4(a, 0, -a, 0, 0, 1, 0, 0, a, 0, a, 0, 0, 0, 0, 1));
	});

	it('can be set from a quaternion', function () {
		var a = 1.0 / Math.sqrt(2.0);

		expect(new Matrix4().setRotationFromQuaternion(new Quaternion(0.0, Math.sin(Math.PI / 8), 0.0, Math.cos(Math.PI / 8)))).toBeCloseToMatrix(new Matrix4(a, 0, -a, 0, 0, 1, 0, 0, a, 0, a, 0, 0, 0, 0, 1));
	});

	it('can set the translation part', function () {
		expect(new Matrix4().setTranslation(new Vector3(1, 2, 3))).toBeCloseToMatrix(new Matrix4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1));
	});

	it('can set the scale part', function () {
		expect(new Matrix4().setScale(new Vector3(1, 2, 3))).toBeCloseToMatrix(new Matrix4(1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1));
	});

	it('can set scale the matrix', function () {
		expect(new Matrix4().setScale(new Vector3(1, 2, 3)).scale(new Vector3(1, 2, 3))).toBeCloseToMatrix(new Matrix4(1, 0, 0, 0, 0, 4, 0, 0, 0, 0, 9, 0, 0, 0, 0, 1));
	});

	it('can get rotational part', function () {
		var original = new Matrix4(10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160);
		var rotation = new Matrix3();
		original.getRotation(rotation);
		expect(rotation).toBeCloseToMatrix(new Matrix3(10, 20, 30, 50, 60, 70, 90, 100, 110));
	});

	describe('decompose', function () {
		it('can decompose with translation', function () {
			var matrix = new Matrix4();
			matrix.setTranslation(new Vector3(1, 2, 3));

			var position = new Vector3();
			var rotation = new Matrix3();
			var scale = new Vector3();
			matrix.decompose(position, rotation, scale);

			expect(position).toBeCloseToVector(new Vector3(1, 2, 3));
			expect(rotation).toBeCloseToMatrix(new Matrix3());
			expect(scale).toBeCloseToVector(new Vector3(1, 1, 1));
		});

		it('can decompose with rotation', function () {
			var matrix = new Matrix4();
			matrix.setRotationFromVector(new Vector3(0, Math.PI / 4, 0));

			var position = new Vector3();
			var rotation = new Matrix3();
			var scale = new Vector3();
			matrix.decompose(position, rotation, scale);

			expect(position).toBeCloseToVector(new Vector3(0, 0, 0));
			var a = 1.0 / Math.sqrt(2.0);
			expect(rotation).toBeCloseToMatrix(new Matrix3(a, 0, -a, 0, 1, 0, a, 0, a));
			expect(scale).toBeCloseToVector(new Vector3(1, 1, 1));
		});

		it('can decompose with scale', function () {
			var matrix = new Matrix4();
			matrix.setScale(new Vector3(1, 2, 3));

			var position = new Vector3();
			var rotation = new Matrix3();
			var scale = new Vector3();
			matrix.decompose(position, rotation, scale);

			expect(position).toBeCloseToVector(new Vector3(0, 0, 0));
			expect(rotation).toBeCloseToMatrix(new Matrix3());
			expect(scale).toBeCloseToVector(new Vector3(1, 2, 3));
		});

		it('can decompose with rotation and translation', function () {
			var matrix = new Matrix4();
			matrix.setRotationFromVector(new Vector3(0, Math.PI / 4, 0));
			matrix.setTranslation(new Vector3(1, 2, 3));

			var position = new Vector3();
			var rotation = new Matrix3();
			var scale = new Vector3();
			matrix.decompose(position, rotation, scale);

			expect(position).toBeCloseToVector(new Vector3(1, 2, 3));
			var a = 1.0 / Math.sqrt(2.0);
			expect(rotation).toBeCloseToMatrix(new Matrix3(a, 0, -a, 0, 1, 0, a, 0, a));
			expect(scale).toBeCloseToVector(new Vector3(1, 1, 1));
		});
	});

	describe('add', function () {
		it('can add two matrices component-wise', function () {
			var a = new Matrix4(
				1, 2, 3, 4,
				5, 6, 7, 8,
				9, 10, 11, 12,
				13, 14, 15, 16
			);

			var b = new Matrix4(
				2, 3, 5, 7,
				11, 13, 17, 19,
				23, 29, 31, 37,
				41, 43, 47, 53
			);

			expect(a.add(b)).toBeCloseToMatrix(new Matrix4(
				1 + 2,
				2 + 3,
				3 + 5,
				4 + 7,
				5 + 11,
				6 + 13,
				7 + 17,
				8 + 19,
				9 + 23,
				10 + 29,
				11 + 31,
				12 + 37,
				13 + 41,
				14 + 43,
				15 + 47,
				16 + 53
			));
		});
	});

	describe('sub', function () {
		it('can subtract two matrices component-wise', function () {
			var a = new Matrix4(
				1, 2, 3, 4,
				5, 6, 7, 8,
				9, 10, 11, 12,
				13, 14, 15, 16
			);

			var b = new Matrix4(
				2, 3, 5, 7,
				11, 13, 17, 19,
				23, 29, 31, 37,
				41, 43, 47, 53
			);

			expect(b.sub(a)).toBeCloseToMatrix(new Matrix4(
				2 - 1,
				3 - 2,
				5 - 3,
				7 - 4,
				11 - 5,
				13 - 6,
				17 - 7,
				19 - 8,
				23 - 9,
				29 - 10,
				31 - 11,
				37 - 12,
				41 - 13,
				43 - 14,
				47 - 15,
				53 - 16
			));
		});
	});

	describe('equals', function () {
		it('can be tested for approximate equality', function () {
			var a = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
			var b = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
			var c = new Matrix4(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);

			expect(a.equals(b)).toBe(true);
			expect(a.equals(c)).toBe(false);
		});

		it('can be tested for equality', function () {
			var a = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
			var b = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
			var c = new Matrix4(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);

			expect(a.equals(b, 0)).toBe(true);
			expect(a.equals(c, 0)).toBe(false);
		});

		it('preserves behaviour of comparing with NaN', function () {
			// 1 === NaN // false in JS, so (1, 2) === (1, NaN) should return the same
			var m1 = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
			var m2 = new Matrix4(1, 2, 3, NaN, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			expect(m1.equals(m2)).toBe(false);
		});
	});

	describe('copy', function () {
		it('can copy from another matrix', function () {
			var original = new Matrix4(10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160);
			var copy = new Matrix4(100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600);
			copy.copy(original);
			expect(copy).toBeCloseToMatrix(new Matrix4(10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160));
		});
	});

	describe('clone', function () {
		it('clones a matrix', function () {
			var original = new Matrix4(10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160);
			var clone = original.clone();

			expect(clone).toBeCloseToMatrix(new Matrix4(10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160));
			expect(clone).not.toBe(original);
		});
	});

	describe('deprecated shim added 2015-10-07 (v1.0)', function () {
		it('can add two matrices component-wise', function () {
			var a = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			expect(Matrix4.add(a, a)).toBeCloseToMatrix(Matrix4.mul(a, 2));
		});

		it('can add a scalar to all components of a matrix', function () {
			var a = new Matrix4(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);

			expect(Matrix4.add(a, 1)).toBeCloseToMatrix(Matrix4.mul(a, 2));
		});

		it('can combine multiple matrices into a single matrix', function () {
			var a = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
			var b = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			a.combine(a);

			expect(a).toBeCloseToMatrix(new Matrix4(90, 100, 110, 120, 202, 228, 254, 280, 314, 356, 398, 440, 426, 484, 542, 600));
			expect(Matrix4.combine(b, b)).toBeCloseToMatrix(new Matrix4(90, 100, 110, 120, 202, 228, 254, 280, 314, 356, 398, 440, 426, 484, 542, 600));
		});

		it('can divide two matrices component-wise', function () {
			var a = new Matrix4(2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2);

			expect(Matrix4.div(a, a)).toBeCloseToMatrix(Matrix4.div(a, 2));
		});

		it('can add two matrices component-wise', function () {
			var a = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			expect(Matrix4.add(a, a)).toBeCloseToMatrix(Matrix4.mul(a, 2));
		});

		it('can add a scalar to all components of a matrix', function () {
			var a = new Matrix4(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);

			expect(Matrix4.add(a, 1)).toBeCloseToMatrix(Matrix4.mul(a, 2));
		});

		it('can subtract two matrices component-wise', function () {
			var a = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			expect(Matrix4.sub(a, a)).toBeCloseToMatrix(Matrix4.mul(a, 0));
		});

		it('can subtract a scalar to all components of a matrix', function () {
			var a = new Matrix4(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);

			expect(Matrix4.sub(a, 1)).toBeCloseToMatrix(Matrix4.mul(a, 0));
		});

		it('can multiply two matrices component-wise', function () {
			var a = new Matrix4(2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2);

			expect(Matrix4.mul(a, a)).toBeCloseToMatrix(Matrix4.mul(a, 2));
		});

		it('can transform four-dimensional vectors (y = (x*M)^T)', function () {
			var a = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			expect(a.applyPre(new Vector4(1, 2, 3, 4))).toBeCloseToVector(new Vector4(30, 70, 110, 150));
		});

		it('can transform four-dimensional vectors (y = M*x)', function () {
			var a = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			expect(a.applyPost(new Vector4(1, 2, 3, 4))).toBeCloseToVector(new Vector4(90, 100, 110, 120));
		});

		it('can transform three-dimensional vectors', function () {
			var a = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			expect(a.applyPostPoint(new Vector3(1, 2, 3))).toBeCloseToVector(new Vector3(51, 58, 65));
		});

		it('can transform three-dimensional normals', function () {
			var a = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			expect(a.applyPostVector(new Vector3(1, 2, 3))).toBeCloseToVector(new Vector3(38, 44, 50));
		});
	});
});

var Vector3 = require("../../src/goo/math/Vector3");
var Plane = require("../../src/goo/math/Plane");
var Ray = require("../../src/goo/math/Ray");
var CustomMatchers = require("./CustomMatchers");

describe('Plane', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	describe('constructor', function () {
		it('creates a new vector pointing upwards if no parameters were passed', function () {
			var plane = new Plane();
			expect(plane.normal).toBeCloseToVector(Vector3.UNIT_Y);
			expect(plane.constant).toBeCloseTo(0);
		});
	});

	it('computes pseudodistance', function () {
		var p = new Plane();
		var dist = p.pseudoDistance(new Vector3(0, 1, 0));
		expect(dist).toEqual(1);
	});

	it('can set from points', function () {
		var p = new Plane();
		p.setPlanePoints(
			new Vector3(1, 0, 0),
			new Vector3(0, 1, 0),
			new Vector3(0, 0, 0)
		);
		expect(p.normal).toEqual(new Vector3(0, 0, 1));
	});

	it('can reflect vector', function () {
		var p = new Plane();
		var store = new Vector3();
		p.reflectVector(new Vector3(0, 1, 0), store);
		expect(store).toEqual(new Vector3(0, -1, 0));

		// Without precreating store
		store = p.reflectVector(new Vector3(0, 1, 0));
		expect(store).toEqual(new Vector3(0, -1, 0));
	});

	it('can ray intersect', function () {
		var p = new Plane(new Vector3(0, 1, 0), 1);
		var ray = new Ray(new Vector3(0, 0, 0), new Vector3(0, 1, 0));
		var store = new Vector3();
		p.rayIntersect(ray, store);
		expect(store).toEqual(new Vector3(0, 1, 0));

		ray.direction.setDirect(0, 0, 1);
		var result = p.rayIntersect(ray, store);
		expect(result).toBe(null);
	});

	describe('copy', function () {
		it('can copy everything from another plane', function () {
			var original = new Plane(new Vector3(1, 2, 3), 123);
			var copy = new Plane();
			copy.copy(original);

			expect(copy).toBeCloned(original);
		});
	});

	describe('clone', function () {
		it('can clone a plane', function () {
			var original = new Plane(new Vector3(1, 2, 3), 123);
			var clone = original.clone();

			expect(clone).toBeCloned(original);
		});
	});
});


var Vector3 = require("../../src/goo/math/Vector3");
var Matrix3 = require("../../src/goo/math/Matrix3");
var Quaternion = require("../../src/goo/math/Quaternion");
var CustomMatchers = require("./CustomMatchers");

describe('Quaternion', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	describe('constructor', function () {
		it('creates a zero quaternion when given no parameters', function () {
			var quaternion = new Quaternion();
			expect(quaternion.equals(new Quaternion(0, 0, 0, 1))).toBeTruthy();
		});

		it('creates a quaternion when given 4 parameters', function () {
			var quaternion = new Quaternion(11, 22, 33, 44);

			var expected = new Quaternion();
			expected.x = 11;
			expected.y = 22;
			expected.z = 33;
			expected.w = 44;

			expect(quaternion).toBeCloseToVector(expected);
		});

		it('creates a vector when given an array', function () {
			var vector = new Quaternion([1, 2, 3, 4]);
			var expected = new Quaternion(1, 2, 3, 4);

			expect(vector).toBeCloseToVector(expected);
		});

		it('creates a vector when given a vector', function () {
			var original = new Quaternion(1, 2, 3, 4);
			var vector = new Quaternion(original);
			var expected = new Quaternion(1, 2, 3, 4);

			expect(vector).toBeCloseToVector(expected);
		});
	});

	describe('mul', function () {
		it('can multiply two quaternions', function () {
			var p = new Quaternion(1, 0, 0, 0);
			var q = new Quaternion(0, 1, 0, 0);
			p.mul(q);

			expect(p.equals(new Quaternion(0, 0, 1, 0))).toBeTruthy();
		});
	});

	it('can slerp', function () {
		var angle1 = Math.PI / 2;
		var angle2 = Math.PI;
		var half = (angle1 + angle2) / 2;

		var quat1 = new Quaternion(Math.sin(angle1), 0, 0, Math.cos(angle1));
		var quat2 = new Quaternion(Math.sin(angle2), 0, 0, Math.cos(angle2));

		var result = new Quaternion();
		var expectedResult = new Quaternion(Math.sin(half), 0, 0, Math.cos(half));

		Quaternion.slerp(quat1, quat2, 0.5, result);
		expect(result.equals(expectedResult)).toBeTruthy();
	});

	it('can slerp via prototype method', function () {
		var startQuat = new Quaternion();
		var endQuat = new Quaternion();
		var result = new Quaternion();
		startQuat.slerp(endQuat, 0.5, result);
		expect(result).toEqual(new Quaternion());
	});

	describe('negate', function () {
		it('can negate', function () {
			var q = new Quaternion(1, 1, 1, 1);
			q.negate();
			expect(q).toEqual(new Quaternion(-1, -1, -1, -1));
		});
	});

	describe('conjugate', function () {
		it('conjugates a quaternion', function () {
			var original = new Quaternion(1, 2, 3, 4);
			var conjugate = new Quaternion().copy(original).conjugate();
			expect(conjugate.equals(new Quaternion(-1, -2, -3, 4))).toBeTruthy();
		});
	});

	describe('invert', function () {
		it('inverts a quaternion', function () {
			var original = new Quaternion(1, 2, 3, 4).normalize();
			var inverse = new Quaternion().copy(original).invert();
			expect(inverse.equals(new Quaternion(-1 / 30, -2 / 30, -3 / 30, 4 / 30).normalize())).toBeTruthy();
		});
	});

	it('can dot', function () {
		var q = new Quaternion(1, 1, 1, 1);
		expect(q.dot(q)).toEqual(4);
	});

	it('can be set from rotation matrix', function () {
		var matrix = new Matrix3(
			-1, 0, 0,
			0, -1, 0,
			0, 0, 1
		);

		var quaternion = new Quaternion();
		quaternion.fromRotationMatrix(matrix);

		expect(quaternion.equals(new Quaternion(0, 0, 1, 0))).toBeTruthy();
	});

	it('can convert to rotation matrix', function () {
		var matrix = new Matrix3();

		var quaternion = new Quaternion(0, 0, 1, 0);
		quaternion.toRotationMatrix(matrix);

		expect(matrix).toBeCloseToMatrix(new Matrix3(
			-1, 0, 0,
			0, -1, 0,
			0, 0, 1
		));
	});

	it('can be set from vector to vector', function () {
		var p = new Quaternion();
		var q = new Quaternion();
		q.fromVectorToVector(new Vector3(1, 0, 0), new Vector3(0, 1, 0));
		p.fromAngleAxis(Math.PI / 2, new Vector3(0, 0, 1));
		expect(p).toBeCloseToVector(q);
	});

	it('can be normalized', function () {
		var q = new Quaternion(0, 0, 0, 2);
		q.normalize();
		expect(q.length()).toEqual(1);
	});

	it('can get length', function () {
		var q = new Quaternion(0, 0, 0, 2);
		expect(q.length()).toEqual(2);
	});

	it('can get squared length', function () {
		var q = new Quaternion(0, 0, 0, 2);
		expect(q.lengthSquared()).toEqual(4);
	});

	it('can be set from axis angle', function () {
		var q = new Quaternion();
		var axis = new Vector3(1, 0, 0);
		var angle = 0;
		q.fromAngleAxis(angle, axis);
		expect(q).toEqual(new Quaternion());
	});

	it('can be set from a normal axis and angle', function () {
		var q = new Quaternion();
		var axis = new Vector3(1, 0, 0);
		var angle = 0;
		q.fromAngleNormalAxis(angle, axis);
		expect(q).toEqual(new Quaternion());
	});

	it('can be set from a zero axis and angle', function () {
		var q = new Quaternion();
		var axis = new Vector3(0, 0, 0);
		var angle = 0;
		q.fromAngleNormalAxis(angle, axis);
		expect(q).toEqual(new Quaternion());
	});

	it('can generate axis and angle 1', function () {
		var q = new Quaternion();
		var axis = new Vector3(0, 0, 0);
		var angle = q.toAngleAxis(axis);
		expect(typeof angle).toEqual('number');
	});

	it('can generate axis and angle 2', function () {
		var q = new Quaternion();
		var axis = new Vector3(1, 0, 0);
		var axisResult = new Vector3();
		var angle = Math.PI / 2;
		q.fromAngleNormalAxis(angle, axis);
		var angleResult = q.toAngleAxis(axisResult);
		expect(angleResult).toBeCloseTo(angle);
		expect(axisResult).toEqual(axis);
	});

	it('can set all components via other quaternion', function () {
		var q = new Quaternion();
		var p = new Quaternion(1, 2, 3, 4);
		q.set(p);
		expect(q.equals(p)).toBeTruthy();
	});

	describe('clone', function () {
		it('clones a quaternion', function () {
			var original = new Quaternion(1, 2, 3, 4);
			var clone = original.clone();

			expect(clone).toEqual(jasmine.any(Quaternion));
			expect(clone).not.toBe(original);
			expect(clone).toBeCloseToVector(original);
		});
	});


	describe('NaN checks (only in dev)', function () {
		it('throws an exception when trying to set a quaternion component to NaN', function () {
			var quaternion1 = new Quaternion();
			expect(function () { quaternion1.z = NaN; })
				.toThrow(new Error('Tried setting NaN to vector component z'));

			//var quaternion2 = new Quaternion();
			//expect(function () { quaternion2[1] = NaN; })
			//	.toThrow(new Error('Tried setting NaN to vector component 1'));
		});

		it('throws an exception when trying to corrupt a vector by using methods', function () {
			var quaternion1 = new Quaternion();
			expect(function () { quaternion1.mul({}); })
				.toThrow(new Error('Tried setting NaN to vector component x'));

			var quaternion2 = new Quaternion();
			expect(function () { quaternion2.setDirect(); })
				.toThrow(new Error('Tried setting NaN to vector component x'));
		});

		it('throws an exception when a corrupt quaternion would return NaN', function () {
			var quaternion = new Quaternion();
			// manually corrupting this quaternion
			// this is the only non-traceable way
			quaternion._x = NaN;
			expect(function () { quaternion.lengthSquared(); })
				.toThrow(new Error('Vector method lengthSquared returned NaN'));
		});
	});

	describe('deprecated shim added 2015-10-07 (v1.0)', function () {

		it('can add two quaternions',function () {
			var p = new Quaternion(1,1,1,1);
			var q = new Quaternion(2,2,2,2);
			var result = new Quaternion();
			Quaternion.add(p,q,result);
			expect(result).toEqual(new Quaternion(3,3,3,3));
		});

		it('can subtract two quaternions',function () {
			var p = new Quaternion(1,1,1,1);
			var q = new Quaternion(2,2,2,2);
			var result = new Quaternion();
			Quaternion.sub(p,q,result);
			expect(result).toEqual(new Quaternion(-1,-1,-1,-1));
		});

		it('can multiply two quaternions',function () {
			var p = new Quaternion();
			var q = new Quaternion();
			var result = new Quaternion();
			Quaternion.mul(p,q,result);

			//! schteppe: TODO: How to check result?
			expect(result).toEqual(new Quaternion());
		});

		it('can divide component-wise',function () {
			var p = new Quaternion(2,2,2,2);
			var q = new Quaternion(2,2,2,2);
			var result = new Quaternion();
			Quaternion.div(p,q,result);
			expect(result).toEqual(new Quaternion(1,1,1,1));
		});

		it('can add a scalar to a quaternion',function () {
			var p = new Quaternion(1,1,1,1);
			var result = new Quaternion();
			Quaternion.scalarAdd(p,1,result);
			expect(result).toEqual(new Quaternion(2,2,2,2));
		});

		it('can subtract a scalar from a quaternion',function () {
			var p = new Quaternion(1,1,1,1);
			var result = new Quaternion();
			Quaternion.scalarSub(p,1,result);
			expect(result).toEqual(new Quaternion(0,0,0,0));
		});

		it('can multiply a scalar with a quaternion',function () {
			var p = new Quaternion(1,1,1,1);
			var result = new Quaternion();
			Quaternion.scalarMul(p,2,result);
			expect(result).toEqual(new Quaternion(2,2,2,2));
		});

		it('can divide a quaternion with a scalar',function () {
			var p = new Quaternion(2,2,2,2);
			var result = new Quaternion();
			Quaternion.scalarDiv(p,2,result);
			expect(result).toEqual(new Quaternion(1,1,1,1));
		});

		it('can slerp',function () {
			var angle1 = Math.PI / 2;
			var angle2 = Math.PI;
			var half = (angle1 + angle2) / 2;

			var quat1 = new Quaternion(Math.sin(angle1), 0, 0, Math.cos(angle1));
			var quat2 = new Quaternion(Math.sin(angle2), 0, 0, Math.cos(angle2));

			var result = new Quaternion();
			var expectedResult = new Quaternion(Math.sin(half), 0, 0, Math.cos(half));

			Quaternion.slerp(quat1, quat2, 0.5, result);
			expect(result.equals(expectedResult)).toBeTruthy();
		});

		it('can slerp via prototype method',function () {
			var startQuat = new Quaternion();
			var endQuat = new Quaternion();
			var result = new Quaternion();
			startQuat.slerp(endQuat,0.5,result);
			expect(result).toEqual(new Quaternion());
		});

		it('can negate',function () {
			var q = new Quaternion(1,1,1,1);
			q.negate();
			expect(q).toEqual(new Quaternion(-1,-1,-1,-1));
		});

		describe('conjugate', function () {
			it('conjugates a quaternion', function () {
				var original = new Quaternion(1, 2, 3, 4);
				var conjugate = new Quaternion().copy(original).conjugate();
				expect(conjugate).toBeCloseToVector(new Quaternion(-1, -2, -3, 4));
			});
		});

		describe('invert', function () {
			it('inverts a quaternion', function () {
				var original = new Quaternion(1, 2, 3, 4).normalize();
				var inverse = new Quaternion().copy(original).invert();
				expect(inverse).toBeCloseToVector(new Quaternion(-1/30, -2/30, -3/30, 4/30).normalize());
			});
		});

		it('can be set from rotation matrix', function () {
			var matrix = new Matrix3(
				-1, 0, 0,
				0, -1, 0,
				0, 0, 1
			);

			var quaternion = new Quaternion();
			quaternion.fromRotationMatrix(matrix);

			expect(quaternion).toBeCloseToVector(new Quaternion(0, 0, 1, 0));
		});

		it('can convert to rotation matrix', function () {
			var matrix = new Matrix3();

			var quaternion = new Quaternion(0, 0, 1, 0);
			quaternion.toRotationMatrix(matrix);

			expect(matrix).toBeCloseToMatrix(new Matrix3(
				-1, 0, 0,
				0, -1, 0,
				0, 0, 1
			));
		});

		it('can be set from vector to vector', function () {
			var p = new Quaternion();
			var q = new Quaternion();
			q.fromVectorToVector(new Vector3(1, 0, 0), new Vector3(0, 1, 0));
			p.fromAngleAxis(Math.PI / 2, new Vector3(0, 0, 1));
			expect(p).toEqual(q);
		});

		it('can be normalized', function () {
			var q = new Quaternion(0,0,0,2);
			q.normalize();
			expect(q.magnitude()).toEqual(1);
		});

		it('can get magnitude', function () {
			var q = new Quaternion(0,0,0,2);
			expect(q.magnitude()).toEqual(2);
		});

		it('can get squared magnitude', function () {
			var q = new Quaternion(0,0,0,2);
			expect(q.magnitudeSquared()).toEqual(4);
		});

		it('can be set from axis angle', function () {
			var q = new Quaternion();
			var axis = new Vector3(1,0,0);
			var angle = 0;
			q.fromAngleAxis(angle,axis);
			expect(q).toEqual(new Quaternion());
		});

		it('can be set from a normal axis and angle', function () {
			var q = new Quaternion();
			var axis = new Vector3(1,0,0);
			var angle = 0;
			q.fromAngleNormalAxis(angle,axis);
			expect(q).toEqual(new Quaternion());
		});

		it('can be set from a zero axis and angle', function () {
			var q = new Quaternion();
			var axis = new Vector3(0,0,0);
			var angle = 0;
			q.fromAngleNormalAxis(angle,axis);
			expect(q).toEqual(new Quaternion());
		});

		it('can generate axis and angle 1', function () {
			var q = new Quaternion();
			var axis = new Vector3(0,0,0);
			var angle = q.toAngleAxis(axis);
			expect(typeof angle).toEqual('number');
		});

		it('can generate axis and angle 2', function () {
			var q = new Quaternion();
			var axis = new Vector3(1,0,0);
			var axisResult = new Vector3();
			var angle = Math.PI/2;
			q.fromAngleNormalAxis(angle,axis);
			var angleResult = q.toAngleAxis(axisResult);
			expect(angleResult).toBeCloseTo(angle);
			expect(axisResult).toEqual(axis);
		});

		it('can check for equality', function () {
			var q = new Quaternion();
			expect(q.equals(q)).toBeTruthy();
		});

		it('can check for equality with foreign object', function () {
			var q = new Quaternion();
			expect(q.equals(1)).toBeFalsy();
		});

		describe('clone', function () {
			it('clones a quaternion', function () {
				var original = new Quaternion(1, 2, 3, 4);
				var clone = original.clone();

				expect(clone).toEqual(jasmine.any(Quaternion));
				expect(clone).not.toBe(original);
				expect(clone.data[0]).toBeCloseTo(original.data[0]);
				expect(clone.data[1]).toBeCloseTo(original.data[1]);
				expect(clone.data[2]).toBeCloseTo(original.data[2]);
				expect(clone.data[3]).toBeCloseTo(original.data[3]);
			});
		});

	});
});


var Ray = require("../../src/goo/math/Ray");
var Plane = require("../../src/goo/math/Plane");
var Vector3 = require("../../src/goo/math/Vector3");
var CustomMatchers = require("./CustomMatchers");

describe('Ray', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	describe('constructor', function () {
		it('creates a ray given no parameters', function () {
			var ray = new Ray();

			expect(ray.origin).toBeCloseToVector(Vector3.ZERO);
			expect(ray.direction).toBeCloseToVector(Vector3.UNIT_Z);
		});

		it('creates a ray given only the origin', function () {
			var origin = new Vector3(1, 2, 3);
			var ray = new Ray(origin);

			expect(ray.origin).toBeCloseToVector(origin);
			expect(ray.origin).not.toBe(origin);

			expect(ray.direction).toBeCloseToVector(Vector3.UNIT_Z);
		});

		it('creates a ray given the origin and direction', function () {
			var origin = new Vector3(1, 2, 3);
			var direction = new Vector3(123, 234, 345);
			var ray = new Ray(origin, direction);

			expect(ray.origin).toBeCloseToVector(origin);
			expect(ray.origin).not.toBe(origin);

			expect(ray.direction).toBeCloseToVector(direction);
			expect(ray.direction).not.toBe(direction);
		});
	});

	it('intersects triangle', function () {
		var ray = new Ray(new Vector3(0, 0, -1), new Vector3(0, 0, 1));
		var triangle = [
			new Vector3(-0.1, -0.1, 0),
			new Vector3(1.0, -0.1, 0),
			new Vector3(1.0, 1.0, 0)
		];
		var store = new Vector3(1, 1, 1);
		ray.intersects(triangle, false, store);
		expect(store).toEqual(new Vector3(0, 0, 0));
	});

	it('intersects quad', function () {
		var ray = new Ray(new Vector3(0, 0, -1), new Vector3(0, 0, 1));
		var quad = [
			new Vector3(-1, -1, 0),
			new Vector3(1, -1, 0),
			new Vector3(1, 1, 0),
			new Vector3(-1, 1, 0)
		];
		var store = new Vector3(1, 1, 1);
		ray.intersects(quad, false, store);
		expect(store).toEqual(new Vector3(0, 0, 0));
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

	describe('copy', function () {
		it('can copy everything from another ray', function () {
			var original = new Ray(new Vector3(1, 2, 3), new Vector3(4, 5, 6));
			var copy = new Ray();
			copy.copy(original);

			expect(copy).toBeCloned(original);
		});
	});

	describe('clone', function () {
		it('can clone a ray', function () {
			var original = new Ray(new Vector3(1, 2, 3), new Vector3(4, 5, 6));
			var clone = original.clone();

			expect(clone).toBeCloned(original);
		});
	});
});


var Spline = require("../../src/goo/math/splines/Spline");
var Vector2 = require("../../src/goo/math/Vector2");
var Vector3 = require("../../src/goo/math/Vector3");
var Vector4 = require("../../src/goo/math/Vector4");
var CustomMatchers = require("./CustomMatchers");

describe('Spline', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	describe('quadraticInterpolation', function () {
		it('retrieves a point for t = 0', function () {
			var point = new Vector2();
			var start = new Vector2(2, 4);
			var mid = new Vector2(10, 20);
			var end = new Vector2(8, 6);
			Spline.quadraticInterpolation(start, mid, end, 0, point);
			expect(point).toBeCloseToVector(start);
		});

		it('retrieves a point for t = 1', function () {
			var point = new Vector2();
			var start = new Vector2(2, 4);
			var mid = new Vector2(10, 20);
			var end = new Vector2(8, 6);
			Spline.quadraticInterpolation(start, mid, end, 1, point);
			expect(point).toBeCloseToVector(end);
		});

		it('works with Vector3', function () {
			var point = new Vector3();
			var start = new Vector3(1,2,3);
			var mid = new Vector3(1,2,3);
			var end = new Vector3(1,2,3);
			Spline.quadraticInterpolation(start, mid, end, 1, point);
			expect(point).toBeCloseToVector(end);
		});

		it('works with Vector4', function () {
			var point = new Vector4();
			var start = new Vector4(1,2,3,4);
			var mid = new Vector4(1,2,3,4);
			var end = new Vector4(1,2,3,4);
			Spline.quadraticInterpolation(start, mid, end, 1, point);
			expect(point).toBeCloseToVector(end);
		});
	});

	describe('cubicInterpolation', function () {
		it('retrieves a point for t = 0', function () {
			var point = new Vector2();
			var start = new Vector2(2, 4);
			var mid1 = new Vector2(10, 20);
			var mid2 = new Vector2(30, 40);
			var end = new Vector2(8, 6);
			Spline.cubicInterpolation(start, mid1, mid2, end, 0, point);
			expect(point).toBeCloseToVector(start);
		});

		it('retrieves a point for t = 1', function () {
			var point = new Vector2();
			var start = new Vector2(2, 4);
			var mid1 = new Vector2(10, 20);
			var mid2 = new Vector2(30, 40);
			var end = new Vector2(8, 6);
			Spline.cubicInterpolation(start, mid1, mid2, end, 1, point);
			expect(point).toBeCloseToVector(end);
		});
	});

	describe('getPoint', function () {
		it('retrieves a point for t = 0', function () {
			var point = new Vector2();
			var start = new Vector2(123, 456);
			var mid1 = new Vector2(1, 2);
			var mid2 = new Vector2(3, 4);
			var mid3 = new Vector2(5, 6);
			var mid4 = new Vector2(7, 8);
			var mid5 = new Vector2(9, 10);
			var end = new Vector2(321, 654);
			new Spline([start, mid1, mid2, mid3, mid4, mid5, end]).getPoint(0, point);
			expect(point).toBeCloseToVector(start);
		});

		it('retrieves a point for t = 1', function () {
			var point = new Vector2();
			var start = new Vector2(123, 456);
			var mid1 = new Vector2(1, 2);
			var mid2 = new Vector2(3, 4);
			var mid3 = new Vector2(5, 6);
			var mid4 = new Vector2(7, 8);
			var mid5 = new Vector2(9, 10);
			var end = new Vector2(321, 654);
			new Spline([start, mid1, mid2, mid3, mid4, mid5, end]).getPoint(1, point);
			expect(point).toBeCloseToVector(end);
		});

		it('retrieves a point for t = 0.5', function () {
			var point = new Vector2();
			var start = new Vector2(123, 456);
			var mid1 = new Vector2(1, 2);
			var mid2 = new Vector2(3, 4);
			var mid3 = new Vector2(5, 6);
			var mid4 = new Vector2(7, 8);
			var mid5 = new Vector2(9, 10);
			var end = new Vector2(321, 654);
			new Spline([start, mid1, mid2, mid3, mid4, mid5, end]).getPoint(0.5, point);
			expect(point).toBeCloseToVector(mid3);
		});
	});
});


var Vector3 = require("../../src/goo/math/Vector3");
var Transform = require("../../src/goo/math/Transform");
var CustomMatchers = require("./CustomMatchers");

/**
 * Checks whether Transform.invert works on a test vector.
 */
function checkInversion(transform) {
	var vec1 = new Vector3(100, 200, 300);
	var vec2 = new Vector3();
	var vec3 = new Vector3();
	var inverted = transform.invert();
	transform.applyForward(vec1, vec2);
	inverted.applyForward(vec2, vec3);
	expect(vec3).toBeCloseToVector(vec1);
}

/**
 * Numerically checks whether a transform changes a vector.
 */
function expectNotIdentity(transform) {
	var vec1 = new Vector3(100, 200, 300);
	var vec2 = new Vector3();
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
		jasmine.addMatchers(CustomMatchers);
		t = new Transform();
		v1 = new Vector3(10, 20, 30);
		v2 = new Vector3(0, 0, 0);
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
		expect(v2).toBeCloseToVector(new Vector3(10 * 2, 20 * 3, 30 * 4));
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
		expect(v2).toBeCloseToVector(new Vector3(10, -30, 20));
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
		var t2 = new Transform();
		t2.translation.setDirect(rnd(5), rnd(5), rnd(5));
		t2.setRotationXYZ(rnd(5), rnd(5), rnd(5));
		t2.scale.setDirect(rnd(5), rnd(5), rnd(5));
		t2.update();
		var t3 = Transform.combine(t, t2);
		t3.update();
		t.matrix.mul(t2.matrix);
		expect(t3.matrix).toBeCloseToMatrix(t.matrix);
	});

	describe('lookAt', function () {
		it('centers the lookAt point in the view', function () {
			var lookAt = new Vector3(5, 0, -10);
			var up = new Vector3(0, 1, 0);
			var distance = lookAt.length();
			t.lookAt(lookAt, up);
			t.update();
			t.invert().applyForwardVector(lookAt, v2);
			expect(v2).toBeCloseToVector(new Vector3(0, 0, -distance));
		});

		it('defaults up parameter of lookAt to UNIT_Y', function () {
			var transform1 = new Transform();
			var transform2 = new Transform();

			transform1.lookAt(new Vector3(1, 2, 3));
			transform2.lookAt(new Vector3(1, 2, 3), Vector3.UNIT_Y);

			transform1.update();
			transform2.update();

			expect(transform1.matrix.equals(transform2.matrix)).toBeTruthy();

			// --- check to see if other up vector can be set
			var transform1 = new Transform();
			var transform2 = new Transform();

			transform1.lookAt(new Vector3(1, 2, 3));
			transform2.lookAt(new Vector3(1, 2, 3), Vector3.UNIT_Z);

			transform1.update();
			transform2.update();

			expect(transform1.matrix.equals(transform2.matrix)).toBeFalsy();
		});

		it('does nothing when trying to look at itself', function () {
			var transform = new Transform();
			transform.translation.setDirect(11, 22, 33);
			transform.lookAt(new Vector3(11, 22, 33));
			transform.update();

			var expected = new Transform();
			expected.translation.setDirect(11, 22, 33);
			expected.update();

			expect(transform.rotation).toBeCloseToMatrix(expected.rotation);
			expect(transform.matrix).toBeCloseToMatrix(expected.matrix);
		});
	});

	describe('combine', function () {
		it('combines and updates the resulting transform', function () {
			var transform1 = new Transform();
			transform1.translation.setDirect(1, 2, 3);

			var transform2 = new Transform();
			transform2.translation.setDirect(11, 22, 33);

			var result = Transform.combine(transform1, transform2);
			expect(result.translation.equals(new Vector3(1, 2, 3).add(new Vector3(11, 22, 33)))).toBeTruthy();

			expect(result.matrix[12]).toBeCloseTo(1 + 11);
			expect(result.matrix[13]).toBeCloseTo(2 + 22);
			expect(result.matrix[14]).toBeCloseTo(3 + 33);
		});
	});


	describe('multiply', function () {
		it('can multiply and keep scaling correct', function () {
			var transform1 = new Transform();
			transform1.scale.setDirect(1, 2, 3);

			var transform2 = new Transform();
			transform2.scale.setDirect(4, 5, 6);

			transform1.multiply(transform1, transform2);

			expect(transform1.scale).toBeCloseToVector(new Vector3(1 * 4, 2 * 5, 3 * 6));
		});
	});

	describe('clone', function () {
		it('clones a transform', function () {
			var original = new Transform();

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


var Vector = require("../../src/goo/math/Vector");
var Matrix = require("../../src/goo/math/Matrix");
var CustomMatchers = require("./CustomMatchers");

describe('Vector', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	describe('add', function () {
		it('can perform addition', function () {
			var a = new Vector(2).set(1, 2);
			var b = new Vector(2).set(1, 2);
			a.add(a);

			expect(a).toBeCloseToVector(new Vector(2).set(2, 4));
			expect(Vector.add(b, b)).toBeCloseToVector(new Vector(2).set(2, 4));
		});
	});

	describe('sub', function () {
		it('can perform subtraction', function () {
			var a = new Vector(2).set(1, 2);
			var b = new Vector(2).set(1, 2);

			a.sub(a);

			expect(a).toBeCloseToVector(new Vector(2).set(0, 0));
			expect(Vector.sub(b, b)).toBeCloseToVector(new Vector(2).set(0, 0));
		});
	});

	describe('mul', function () {
		it('can perform multiplication', function () {
			var a = new Vector(2).set(1, 2);
			var b = new Vector(2).set(1, 2);

			a.mul(a);

			expect(a).toBeCloseToVector(new Vector(2).set(1, 4));
			expect(Vector.mul(b, b)).toBeCloseToVector(new Vector(2).set(1, 4));
		});
	});

	describe('div', function () {
		it('can perform division', function () {
			var a = new Vector(2).set(1, 2);
			var b = new Vector(2).set(1, 2);

			a.div(a);

			expect(a).toBeCloseToVector(new Vector(2).set(1, 1));
			expect(Vector.div(b, b)).toBeCloseToVector(new Vector(2).set(1, 1));
		});
	});

	describe('copy', function () {
		it('can copy values', function () {
			var source = new Vector(2).set(1, 2);
			var target = new Vector(2);

			var result = target.copy(source);

			expect(target).toBeCloseToVector(new Vector(2).set(1, 2));
			expect(result).toBe(target);
			expect(Vector.copy(source)).toBeCloseToVector(new Vector(2).set(1, 2));
		});
	});

	it('can calculate dot products', function () {
		var a = new Vector(2).set(1, 2);
		var b = new Vector(2).set(1, 2);

		expect(a.dot(b)).toEqual(5);
		expect(Vector.dot(a, b)).toEqual(5);
	});

	it('can apply matrices', function () {
		var a = new Vector(2).set(1, 2);
		var c = new Matrix(2, 2).set(1, 2, 3, 4);

		a.apply(c);

		expect(a).toBeCloseToVector(new Vector(2).set(7, 10));
	});


	describe('equals', function () {
		it('can be tested for approximate equaltiy', function () {
			var a = new Vector(2).set(1, 2);
			var b = new Vector(2).set(1, 2);
			var c = new Vector(2).set(2, 3);

			expect(a.equals(b)).toEqual(true);
			expect(Vector.equals(a, b)).toEqual(true);
			expect(a.equals(c)).toEqual(false);
			expect(Vector.equals(a, c)).toEqual(false);
		});

		it('preserves behaviour of comparing with NaN', function () {
			// 1 === NaN // false in JS, so (1, 2) === (1, NaN) should return the same
			var v1 = new Vector(2).set(1, 2);
			var v2 = new Vector(2).set(1, NaN);

			expect(v1.equals(v2)).toBeFalsy();
		});
	});

	it('can calculate lengths', function () {
		var a = new Vector(2).set(3, 4);

		expect(a.length()).toEqual(5);
		expect(a.lengthSquared()).toEqual(25);
	});

	it('can calculate distances', function () {
		var a = new Vector(2).set(3, 4);
		var b = new Vector(2).set(6, 8);

		expect(a.distance(b)).toEqual(5);
		expect(Vector.distance(a, b)).toEqual(5);
		expect(a.distanceSquared(b)).toEqual(25);
		expect(Vector.distanceSquared(a, b)).toEqual(25);
	});

	it('can be inverted', function () {
		var a = new Vector(2).set(1, 2);

		a.invert();

		expect(a).toBeCloseToVector(new Vector(2).set(-1, -2));
	});

	it('can be normalized', function () {
		var a = new Vector(2).set(3, 4);

		a.normalize();

		expect(a).toBeCloseToVector(new Vector(2).set(0.6, 0.8));
	});

	it('can be cloned', function () {
		var a = new Vector(2).set(1, 2);
		var b = a.clone();

		b.set(2, 3);

		expect(a).toBeCloseToVector(new Vector(2).set(1, 2));
		expect(b).toBeCloseToVector(new Vector(2).set(2, 3));
	});

	it('can be set', function () {
		var a = new Vector(2).set(1, 2);
		var b = new Vector(2).set([1, 2]);
		var c = new Vector(2).set(a);

		expect(a).toBeCloseToVector(new Vector(2).set(1, 2));
		expect(b).toBeCloseToVector(new Vector(2).set(1, 2));
		expect(c).toBeCloseToVector(new Vector(2).set(1, 2));
	});

	it('can be printed', function () {
		var a = new Vector(2).set(1, 2);

		expect(a.toString()).toEqual('[1, 2]');
	});
});


var Vector2 = require("../../src/goo/math/Vector2");
var CustomMatchers = require("./CustomMatchers");

describe('Vector2', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	describe('constructor', function () {
		it('creates a zero vector when given no parameters', function () {
			expect(new Vector2()).toBeCloseToVector(Vector2.ZERO);
		});

		it('creates a vector when given 2 parameters', function () {
			var vector = new Vector2(11, 22);
			var expected = new Vector2();

			expected.x = 11;
			expected.y = 22;

			expect(vector).toBeCloseToVector(expected);
		});

		it('creates a vector when given an array', function () {
			var vector = new Vector2([11, 22]);
			var expected = new Vector2(11,22);

			expect(vector).toBeCloseToVector(expected);
		});

		it('creates a vector when given a vector', function () {
			var original = new Vector2(1, 2);
			var vector = new Vector2(original);
			var expected = new Vector2(1, 2);

			expect(vector).toBeCloseToVector(expected);
		});
	});

	describe('indices', function () {
		it('can be accessed through indices (debug only)', function () {
			var a = new Vector2(11, 22);

			expect(function () { a[0]; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
			expect(function () { a[1]; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
		});

		it('can be modified through indices (debug only)', function () {
			var a = new Vector2();

			expect(function () { a[0] = 11; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
			expect(function () { a[1] = 22; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
		});
	});

	describe('aliases', function () {
		it('can be accessed through aliases', function () {
			var a = new Vector2(11, 22);

			expect(a.x).toEqual(11);
			expect(a.y).toEqual(22);
			expect(a.u).toEqual(11);
			expect(a.v).toEqual(22);
		});

		it('can be modified through aliases', function () {
			var v1 = new Vector2();
			v1.x = 11;
			v1.y = 22;
			expect(v1).toBeCloseToVector(new Vector2(11, 22));

			var v2 = new Vector2();
			v2.u = 22;
			v2.v = 33;
			expect(v2).toBeCloseToVector(new Vector2(22, 33));
		});
	});

	describe('scale', function () {
		it('scales a vector', function () {
			var vector = new Vector2(1, 2);
			vector.scale(123);
			expect(vector).toBeCloseToVector(new Vector2(1 * 123, 2 * 123));
		});
	});

	describe('dot', function () {
		it('can calculate dot products', function () {
			var a = new Vector2(1, 2);
			var b = new Vector2(1, 2);

			expect(a.dot(b)).toEqual(5);
		});
	});

	describe('normalize', function () {
		it('can be normalized', function () {
			var a = new Vector2();
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
			var plane = new Vector2(-1, 1).normalize(); // more like a vector
			var original = new Vector2(1, 0);
			var reflection = original.clone().reflect(plane);

			expect(reflection).toBeCloseToVector(new Vector2(0, 1));
		});
	});

	describe('copy', function () {
		it('can copy values from a vector', function () {
			var vector = new Vector2(11, 22);
			vector.set(new Vector2(55, 66));
			expect(vector).toBeCloseToVector(new Vector2(55, 66));
		});
	});

	describe('clone', function () {
		it('clones a vector', function () {
			var original = new Vector2(11, 22);
			var clone = original.clone();

			expect(original).toBeCloseToVector(clone);
			expect(original).not.toBe(clone);
		});
	});

	describe('setDirect', function () {
		it('can set a vector', function () {
			var vector = new Vector2(11, 22);
			vector.setDirect(55, 66);
			expect(vector).toBeCloseToVector(new Vector2(55, 66));
		});
	});

	describe('setArray', function () {
		it('can set a vector', function () {
			var vector = new Vector2(11, 22);
			vector.setArray([55, 66]);
			expect(vector).toBeCloseToVector(new Vector2(55, 66));
		});
	});

	describe('set', function () {
		it('can set a vector', function () {
			var vector = new Vector2(11, 22);
			vector.set(new Vector2(55, 66));
			expect(vector).toBeCloseToVector(new Vector2(55, 66));
		});
	});

	describe('addDirect', function () {
		it('can add to a vector', function () {
			var vector = new Vector2(11, 22);
			vector.addDirect(55, 66);
			expect(vector).toBeCloseToVector(new Vector2(66, 88));
		});
	});

	describe('add', function () {
		it('can add to a vector', function () {
			var vector = new Vector2(11, 22);
			vector.add(new Vector2(55, 66));
			expect(vector).toBeCloseToVector(new Vector2(66, 88));
		});
	});


	describe('subDirect', function () {
		it('can subtract from a vector', function () {
			var vector = new Vector2(11, 22);
			vector.subDirect(55, 66);
			expect(vector).toBeCloseToVector(new Vector2(11 - 55, 22 - 66));
		});
	});

	describe('sub', function () {
		it('can subtract from a vector', function () {
			var vector = new Vector2(11, 22);
			vector.sub(new Vector2(55, 66));
			expect(vector).toBeCloseToVector(new Vector2(11 - 55, 22 - 66));
		});
	});


	describe('mulDirect', function () {
		it('can multiply with 2 numbers', function () {
			var vector = new Vector2(11, 22);
			vector.mulDirect(55, 66);
			expect(vector).toBeCloseToVector(new Vector2(11 * 55, 22 * 66));
		});
	});

	describe('mul', function () {
		it('can multiply with a vector', function () {
			var vector = new Vector2(11, 22);
			vector.mul(new Vector2(55, 66));
			expect(vector).toBeCloseToVector(new Vector2(11 * 55, 22 * 66));
		});
	});


	describe('divDirect', function () {
		it('can multiply with 2 numbers', function () {
			var vector = new Vector2(11, 22);
			vector.divDirect(55, 66);
			expect(vector).toBeCloseToVector(new Vector2(11 / 55, 22 / 66));
		});
	});

	describe('div', function () {
		it('can multiply with a vector', function () {
			var vector = new Vector2(11, 22);
			vector.div(new Vector2(55, 66));
			expect(vector).toBeCloseToVector(new Vector2(11 / 55, 22 / 66));
		});
	});

	describe('fromArray', function () {
		it('creates a Vector2 from an array', function () {
			expect(Vector2.fromArray([11, 22]))
				.toBeCloseToVector(new Vector2(11, 22));
		});
	});

	describe('fromAny', function () {
		it('creates a Vector2 from 2 numbers', function () {
			expect(Vector2.fromAny(11, 22))
				.toBeCloseToVector(new Vector2(11, 22));
		});

		it('creates a Vector2 from an array of 2 numbers', function () {
			expect(Vector2.fromAny([11, 22]))
				.toBeCloseToVector(new Vector2(11, 22));
		});

		it('creates a Vector2 from an { x, y } object', function () {
			expect(Vector2.fromAny({ x: 11, y: 22 }))
				.toBeCloseToVector(new Vector2(11, 22));
		});

		it('clones a Vector2', function () {
			var original = new Vector2(11, 22);
			var clone = Vector2.fromAny(original);

			expect(clone).toBeCloseToVector(original);
			expect(clone).not.toBe(original);
		});
	});

	describe('toArray', function () {
		it('converts to array', function () {
			expect(Vector2.fromArray([1, 2]).toArray()).toEqual([1, 2]);
		});
	});

	describe('deprecated shim added 2015-10-07 (v1.0)', function () {
		describe('.data', function () {
			it('has working getters', function () {
				var v = new Vector2(1, 2);
				expect(v.data[0]).toEqual(1);
				expect(v.data[1]).toEqual(2);
			});

			it('has working setters', function () {
				var v = new Vector2();
				v.data[0] = 1;
				v.data[1] = 2;
				expect(v.x).toEqual(1);
				expect(v.y).toEqual(2);
			});

			it('distinguishes vectors', function () {
				var u = new Vector2(1, 2);
				var v = new Vector2(4, 5);
				expect(u.data[0]).toEqual(1);
				expect(v.data[0]).toEqual(4);
			});
		});

		describe('add', function () {
			it('can perform addition', function () {
				var a = new Vector2(1, 2);
				var b = new Vector2(1, 2);

				a.add(a);

				expect(a).toBeCloseToVector(new Vector2(2, 4));
				expect(Vector2.add(b, b)).toBeCloseToVector(new Vector2(2, 4));

				expect(Vector2.add(b, 1)).toBeCloseToVector(new Vector2(2, 3));
				expect(Vector2.add(1, b)).toBeCloseToVector(new Vector2(2, 3));

				expect(Vector2.add(b, [1, 2])).toBeCloseToVector(new Vector2(2, 4));
				expect(Vector2.add([1, 2], b)).toBeCloseToVector(new Vector2(2, 4));
			});
		});

		describe('sub', function () {
			it('can perform subtraction', function () {
				var a = new Vector2(1, 2);
				var b = new Vector2(1, 2);

				a.sub(a);

				expect(a).toBeCloseToVector(new Vector2(0, 0));
				expect(Vector2.sub(b, b)).toBeCloseToVector(new Vector2(0, 0));

				expect(Vector2.sub(b, 1)).toBeCloseToVector(new Vector2(0, 1));
				expect(Vector2.sub(1, b)).toBeCloseToVector(new Vector2(0, -1));

				expect(Vector2.sub(b, [1, 2])).toBeCloseToVector(new Vector2(0, 0));
				expect(Vector2.sub([1, 2], b)).toBeCloseToVector(new Vector2(0, 0));
			});
		});

		describe('mul', function () {
			it('can perform multiplication', function () {
				var a = new Vector2(1, 2);
				var b = new Vector2(1, 2);

				a.mul(a);

				expect(a).toBeCloseToVector(new Vector2(1, 4));
				expect(Vector2.mul(b, b)).toBeCloseToVector(new Vector2(1, 4));

				expect(Vector2.mul(b, 1)).toBeCloseToVector(new Vector2(1, 2));
				expect(Vector2.mul(1, b)).toBeCloseToVector(new Vector2(1, 2));

				expect(Vector2.mul(b, [1, 2])).toBeCloseToVector(new Vector2(1, 4));
				expect(Vector2.mul([1, 2], b)).toBeCloseToVector(new Vector2(1, 4));
			});
		});

		describe('scale', function () {
			it('scales a vector', function () {
				var vector = new Vector2(1, 2);
				vector.scale(123);
				expect(vector).toBeCloseToVector(new Vector2(1 * 123, 2 * 123));
			});
		});

		describe('div', function () {
			it('can perform division', function () {
				var a = new Vector2(1, 2);
				var b = new Vector2(1, 2);

				a.div(a);

				expect(a).toBeCloseToVector(new Vector2(1, 1));
				expect(Vector2.div(b, b)).toBeCloseToVector(new Vector2(1, 1));

				expect(Vector2.div(b, 1)).toBeCloseToVector(new Vector2(1, 2));
				expect(Vector2.div(1, b)).toBeCloseToVector(new Vector2(1, 1/2));

				expect(Vector2.div(b, [1, 2])).toBeCloseToVector(new Vector2(1, 1));
				expect(Vector2.div([1, 2], b)).toBeCloseToVector(new Vector2(1, 1));
			});
		});

		describe('dot', function () {
			it('can calculate dot products', function () {
				var a = new Vector2(1, 2);
				var b = new Vector2(1, 2);

				expect(a.dot(b)).toEqual(5);
				expect(Vector2.dot(a, b)).toEqual(5);
			});

			it('returns garbage if supplied with garbage', function () {
				expect(Vector2.dot([1, 2], [5])).toEqual(NaN);
			});
		});

		describe('dotVector', function () {
			it('can calculate dot products', function () {
				var a = new Vector2(1, 2);
				var b = new Vector2(1, 2);

				expect(a.dotVector(b)).toEqual(5);
			});
		});

		it('can be normalized', function () {
			var a = new Vector2();

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
				var plane = new Vector2(-1, 1).normalize(); // more like a vector
				var original = new Vector2(1, 0);
				var reflection = original.clone().reflect(plane);

				expect(reflection).toBeCloseToVector(new Vector2(0, 1));
			});
		});

		describe('copy', function () {
			it('can copy values from a vector', function () {
				var vector = new Vector2(11, 22);
				vector.setVector(new Vector2(55, 66));
				expect(vector).toBeCloseToVector(new Vector2(55, 66));
			});
		});

		describe('clone', function () {
			it('clones a vector', function () {
				var original = new Vector2(11, 22);
				var clone = original.clone();

				expect(original).toBeCloseToVector(clone);
				expect(original).not.toBe(clone);
			});
		});

		describe('setDirect', function () {
			it('can set a vector', function () {
				var vector = new Vector2(11, 22);
				vector.setDirect(55, 66);
				expect(vector).toBeCloseToVector(new Vector2(55, 66));
			});
		});

		describe('setVector', function () {
			it('can set a vector', function () {
				var vector = new Vector2(11, 22);
				vector.setVector(new Vector2(55, 66));
				expect(vector).toBeCloseToVector(new Vector2(55, 66));
			});
		});


		describe('addDirect', function () {
			it('can add to a vector', function () {
				var vector = new Vector2(11, 22);
				vector.addDirect(55, 66);
				expect(vector).toBeCloseToVector(new Vector2(66, 88));
			});
		});

		describe('addVector', function () {
			it('can add to a vector', function () {
				var vector = new Vector2(11, 22);
				vector.addVector(new Vector2(55, 66));
				expect(vector).toBeCloseToVector(new Vector2(66, 88));
			});
		});


		describe('mulDirect', function () {
			it('can multiply with 2 numbers', function () {
				var vector = new Vector2(11, 22);
				vector.mulDirect(55, 66);
				expect(vector).toBeCloseToVector(new Vector2(11 * 55, 22 * 66));
			});
		});

		describe('mulVector', function () {
			it('can multiply with a vector', function () {
				var vector = new Vector2(11, 22);
				vector.mulVector(new Vector2(55, 66));
				expect(vector).toBeCloseToVector(new Vector2(11 * 55, 22 * 66));
			});
		});


		describe('subDirect', function () {
			it('can subtract from a vector', function () {
				var vector = new Vector2(11, 22);
				vector.subDirect(55, 66);
				expect(vector).toBeCloseToVector(new Vector2(11 - 55, 22 - 66));
			});
		});

		describe('subVector', function () {
			it('can subtract from a vector', function () {
				var vector = new Vector2(11, 22);
				vector.subVector(new Vector2(55, 66));
				expect(vector).toBeCloseToVector(new Vector2(11 - 55, 22 - 66));
			});
		});
	});
});


var Matrix3 = require("../../src/goo/math/Matrix3");
var Vector3 = require("../../src/goo/math/Vector3");
var Matrix4 = require("../../src/goo/math/Matrix4");
var CustomMatchers = require("./CustomMatchers");

describe('Vector3', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	describe('constructor', function () {
		it('creates a zero vector when given no parameters', function () {
			expect(new Vector3()).toBeCloseToVector(Vector3.ZERO);
		});

		it('creates a vector when given 3 parameters', function () {
			var vector = new Vector3(11, 22, 33);
			var expected = new Vector3();

			expected.x = 11;
			expected.y = 22;
			expected.z = 33;

			expect(vector).toBeCloseToVector(expected);
		});

		it('creates a vector when given an array', function () {
			var vector = new Vector3([1, 2, 3]);
			var expected = new Vector3(1, 2, 3);

			expect(vector).toBeCloseToVector(expected);
		});

		it('creates a vector when given a vector', function () {
			var original = new Vector3(1, 2, 3);
			var vector = new Vector3(original);
			var expected = new Vector3(1, 2, 3);

			expect(vector).toBeCloseToVector(expected);
		});
	});

	describe('indices', function () {
		it('can be accessed through indices (debug only)', function () {
			var a = new Vector3(11, 22, 33);

			expect(function () { a[0]; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
			expect(function () { a[1]; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
			expect(function () { a[2]; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
		});

		it('can be modified through indices (debug only)', function () {
			var a = new Vector3();

			expect(function () { a[0] = 11; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
			expect(function () { a[1] = 22; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
			expect(function () { a[2] = 33; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
		});
	});

	describe('aliases', function () {
		it('can be accessed through aliases', function () {
			var vector = new Vector3(11, 22, 33);

			expect(vector.x).toBeCloseTo(11);
			expect(vector.y).toBeCloseTo(22);
			expect(vector.z).toBeCloseTo(33);

			expect(vector.u).toBeCloseTo(11);
			expect(vector.v).toBeCloseTo(22);
			expect(vector.w).toBeCloseTo(33);

			expect(vector.r).toBeCloseTo(11);
			expect(vector.g).toBeCloseTo(22);
			expect(vector.b).toBeCloseTo(33);
		});

		it('can be modified through aliases', function () {
			var vector = new Vector3();

			vector.x = 11;
			vector.y = 22;
			vector.z = 33;

			expect(vector).toBeCloseToVector(new Vector3(11, 22, 33));

			vector.u = 22;
			vector.v = 33;
			vector.w = 44;

			expect(vector).toBeCloseToVector(new Vector3(22, 33, 44));

			vector.r = 33;
			vector.g = 44;
			vector.b = 55;

			expect(vector).toBeCloseToVector(new Vector3(33, 44, 55));
		});
	});

	describe('set', function () {
		it('can set a vector', function () {
			var vector = new Vector3(11, 22, 33);
			vector.set(new Vector3(55, 66, 77));
			expect(vector).toBeCloseToVector(new Vector3(55, 66, 77));
		});
	});

	describe('setDirect', function () {
		it('can set a vector', function () {
			var vector = new Vector3(11, 22, 33);
			vector.setDirect(55, 66, 77);
			expect(vector).toBeCloseToVector(new Vector3(55, 66, 77));
		});
	});

	describe('setArray', function () {
		it('can set a vector', function () {
			var vector = new Vector3(11, 22, 33);
			vector.setArray([55, 66, 77]);
			expect(vector).toBeCloseToVector(new Vector3(55, 66, 77));
		});
	});

	describe('add', function () {
		it('can add to a vector', function () {
			var vector = new Vector3(11, 22, 33);
			vector.add(new Vector3(55, 66, 77));
			expect(vector).toBeCloseToVector(new Vector3(11 + 55, 22 + 66, 33 + 77));
		});
	});

	describe('addDirect', function () {
		it('can add to a vector', function () {
			var vector = new Vector3(11, 22, 33);
			vector.addDirect(55, 66, 77);
			expect(vector).toBeCloseToVector(new Vector3(11 + 55, 22 + 66, 33 + 77));
		});
	});


	describe('sub', function () {
		it('can subtract from a vector', function () {
			var vector = new Vector3(11, 22, 33);
			vector.sub(new Vector3(55, 66, 77));
			expect(vector).toBeCloseToVector(new Vector3(11 - 55, 22 - 66, 33 - 77));
		});
	});

	describe('subDirect', function () {
		it('can subtract from a vector', function () {
			var vector = new Vector3(11, 22, 33);
			vector.subDirect(55, 66, 77);
			expect(vector).toBeCloseToVector(new Vector3(11 - 55, 22 - 66, 33 - 77));
		});
	});


	describe('negate', function () {
		it('negates a vector', function () {
			var vector = new Vector3(123, 345, -567);
			vector.negate();
			expect(vector).toBeCloseToVector(new Vector3(-123, -345, 567));
		});
	});


	describe('mul', function () {
		it('can multiply with a vector', function () {
			var vector = new Vector3(11, 22, 33);
			vector.mul(new Vector3(55, 66, 77));
			expect(vector).toBeCloseToVector(new Vector3(11 * 55, 22 * 66, 33 * 77));
		});
	});

	describe('mulDirect', function () {
		it('can multiply with 3 numbers', function () {
			var vector = new Vector3(11, 22, 33);
			vector.mulDirect(55, 66, 77);
			expect(vector).toBeCloseToVector(new Vector3(11 * 55, 22 * 66, 33 * 77));
		});
	});


	describe('scale', function () {
		it('scales a vector', function () {
			var vector = new Vector3(1, 2, 3);
			vector.scale(123);
			expect(vector).toBeCloseToVector(new Vector3(1 * 123, 2 * 123, 3 * 123));
		});
	});

	describe('dot', function () {
		it('can calculate dot products', function () {
			var a = new Vector3(1, 2, 0);
			var b = new Vector3(1, 2, 0);

			expect(a.dot(b)).toEqual(5);
		});
	});

	describe('cross', function () {
		it('can calculate cross products', function () {
			var a = new Vector3(3, 2, 1);
			var b = new Vector3(1, 2, 3);

			a.cross(b);

			expect(a).toBeCloseToVector(new Vector3(4, -8, 4));
		});
	});

	describe('reflect', function () {
		it('can reflect a vector', function () {
			var plane = new Vector3(-1, 0, 1).normalize();
			var original = new Vector3(1, 0, 0);
			var reflection = original.clone().reflect(plane);

			expect(reflection).toBeCloseToVector(new Vector3(0, 0, 1));
		});
	});

	it('can calculate the distance', function () {
		var a = new Vector3(3, 2, 1);
		var b = new Vector3(1, 2, 3);

		var dist = a.distanceSquared(b);

		expect(dist).toEqual(8);
	});

	describe('normalize', function () {
		it('can be normalized', function () {
			var v1 = new Vector3(0, 0, 0);
			v1.normalize();
			expect(v1).toBeCloseToVector(new Vector3(0, 0, 0));

			var v2 = new Vector3(1, 1, 1);
			v2.normalize();
			expect(v2).toBeCloseToVector(new Vector3(
				1 / Math.sqrt(3),
				1 / Math.sqrt(3),
				1 / Math.sqrt(3)
			));

			var v3 = new Vector3(12, 34, 56);
			v3.normalize();
			expect(v3).toBeCloseToVector(new Vector3(
				12 / Math.sqrt(12 * 12 + 34 * 34 + 56 * 56),
				34 / Math.sqrt(12 * 12 + 34 * 34 + 56 * 56),
				56 / Math.sqrt(12 * 12 + 34 * 34 + 56 * 56)
			));
		});
	});

	describe('applyPost', function () {
		it('can transformed by a Matrix3', function () {
			var vector = new Vector3(1, 2, 3);
			var matrix = new Matrix3(1, 2, 3, 4, 5, 6, 7, 8, 9);

			expect(vector.applyPost(matrix)).toBeCloseToVector(new Vector3(30, 36, 42));
		});
	});

	describe('applyPostPoint', function () {
		it('can transform three-dimensional vectors', function () {
			var vector = new Vector3(1, 2, 3);
			var matrix = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			expect(vector.applyPostPoint(matrix)).toBeCloseToVector(new Vector3(51, 58, 65));
		});
	});

	describe('applyPostVector', function () {
		it('can transform three-dimensional normals', function () {
			var vector = new Vector3(1, 2, 3);
			var matrix = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			expect(vector.applyPostVector(matrix)).toBeCloseToVector(new Vector3(38, 44, 50));
		});
	});

	describe('copy', function () {
		it('can copy values from a vector', function () {
			var vector = new Vector3(11, 22, 33);
			vector.set(new Vector3(55, 66, 77));
			expect(vector).toBeCloseToVector(new Vector3(55, 66, 77));
		});
	});

	describe('clone', function () {
		it('clones a vector', function () {
			var original = new Vector3(11, 22, 33);
			var clone = original.clone();

			expect(original).toBeCloseToVector(clone);
			expect(original).not.toBe(clone);
		});
	});

	describe('NaN checks (only in dev)', function () {
		it('throws an exception when trying to set a vector component to NaN', function () {
			var vector1 = new Vector3();
			expect(function () { vector1.z = NaN; })
				.toThrow(new Error('Tried setting NaN to vector component z'));

			//var vector2 = new Vector3();
			//expect(function () { vector2[1] = NaN; })
			//	.toThrow(new Error('Tried setting NaN to vector component 1'));
		});

		it('throws an exception when trying to corrupt a vector by using methods', function () {
			var vector1 = new Vector3();
			expect(function () { vector1.add(NaN); })
				.toThrow(new Error('Tried setting NaN to vector component x'));

			var vector2 = new Vector3();
			expect(function () { vector2.addDirect(); })
				.toThrow(new Error('Tried setting NaN to vector component x'));

			var vector3 = new Vector3();
			expect(function () { vector3.scale(); })
				.toThrow(new Error('Tried setting NaN to vector component x'));
		});

		it('throws an exception when a corrupt vector would return NaN', function () {
			var vector = new Vector3();
			// manually corrupting this vector
			// this is the only non-traceable way
			vector._x = NaN;
			expect(function () { vector.lengthSquared(); })
				.toThrow(new Error('Vector method lengthSquared returned NaN'));
		});
	});

	describe('fromArray', function () {
		it('creates a Vector3 from an array', function () {
			expect(Vector3.fromArray([11, 22, 33]))
				.toBeCloseToVector(new Vector3(11, 22, 33));
		});
	});

	describe('fromAny', function () {
		it('creates a Vector3 from 3 numbers', function () {
			expect(Vector3.fromAny(11, 22, 33))
				.toBeCloseToVector(new Vector3(11, 22, 33));
		});

		it('creates a Vector3 from an array of 3 numbers', function () {
			expect(Vector3.fromAny([11, 22, 33]))
				.toBeCloseToVector(new Vector3(11, 22, 33));
		});

		it('creates a Vector3 from an { x, y, z } object', function () {
			expect(Vector3.fromAny({ x: 11, y: 22, z: 33 }))
				.toBeCloseToVector(new Vector3(11, 22, 33));
		});

		it('clones a Vector3', function () {
			var original = new Vector3(11, 22, 33);
			var clone = Vector3.fromAny(original);

			expect(clone).toBeCloseToVector(original);
			expect(clone).not.toBe(original);
		});
	});

	describe('toArray', function () {
		it('converts to array', function () {
			expect(Vector3.fromArray([1, 2, 3]).toArray()).toEqual([1, 2, 3]);
		});
	});

	describe('deprecated shim added 2015-10-07 (v1.0)', function () {
		describe('.data', function () {
			it('has working getters', function () {
				var v = new Vector3(1, 2, 3);
				expect(v.data[0]).toEqual(1);
				expect(v.data[1]).toEqual(2);
				expect(v.data[2]).toEqual(3);
			});

			it('has working setters', function () {
				var v = new Vector3();
				v.data[0] = 1;
				v.data[1] = 2;
				v.data[2] = 3;
				expect(v.x).toEqual(1);
				expect(v.y).toEqual(2);
				expect(v.z).toEqual(3);
			});

			it('distinguishes vectors', function () {
				var u = new Vector3(1, 2, 3);
				var v = new Vector3(4, 5, 6);
				expect(u.data[0]).toEqual(1);
				expect(v.data[0]).toEqual(4);
			});
		});

		describe('add', function () {
			it('can perform addition', function () {
				var a = new Vector3(1, 2, 3);
				var b = new Vector3(1, 2, 3);

				a.add(a);

				expect(a).toBeCloseToVector(new Vector3(2, 4, 6));
				expect(Vector3.add(b, b)).toBeCloseToVector(new Vector3(2, 4, 6));

				expect(Vector3.add(b, 1)).toBeCloseToVector(new Vector3(2, 3, 4));
				expect(Vector3.add(1, b)).toBeCloseToVector(new Vector3(2, 3, 4));

				expect(Vector3.add(b, [1, 2, 3])).toBeCloseToVector(new Vector3(2, 4, 6));
				expect(Vector3.add([1, 2, 3], b)).toBeCloseToVector(new Vector3(2, 4, 6));
			});
		});

		describe('sub', function () {
			it('can perform subtraction', function () {
				var a = new Vector3(1, 2, 3);
				var b = new Vector3(1, 2, 3);

				a.sub(a);

				expect(a).toBeCloseToVector(new Vector3(0, 0, 0));
				expect(Vector3.sub(b, b)).toBeCloseToVector(new Vector3(0, 0, 0));

				expect(Vector3.sub(b, 1)).toBeCloseToVector(new Vector3(0, 1, 2));
				expect(Vector3.sub(1, b)).toBeCloseToVector(new Vector3(0, -1, -2));

				expect(Vector3.sub(b, [1, 2, 3])).toBeCloseToVector(new Vector3(0, 0, 0));
				expect(Vector3.sub([1, 2, 3], b)).toBeCloseToVector(new Vector3(0, 0, 0));
			});
		});

		it('can be negated', function () {
			var vector = new Vector3(123, 345, -567);

			vector.invert();

			expect(vector).toBeCloseToVector(new Vector3(-123, -345, 567));
		});

		describe('mul', function () {
			it('can perform multiplication', function () {
				var a = new Vector3(1, 2, 3);
				var b = new Vector3(1, 2, 3);

				a.mul(a);

				expect(a).toBeCloseToVector(new Vector3(1, 4, 9));
				expect(Vector3.mul(b, b)).toBeCloseToVector(new Vector3(1, 4, 9));

				expect(Vector3.mul(b, 1)).toBeCloseToVector(new Vector3(1, 2, 3));
				expect(Vector3.mul(1, b)).toBeCloseToVector(new Vector3(1, 2, 3));

				expect(Vector3.mul(b, [1, 2, 3])).toBeCloseToVector(new Vector3(1, 4, 9));
				expect(Vector3.mul([1, 2, 3], b)).toBeCloseToVector(new Vector3(1, 4, 9));
			});
		});

		describe('scale', function () {
			it('scales a vector', function () {
				var vector = new Vector3(1, 2, 3);
				vector.scale(123);
				expect(vector).toBeCloseToVector(new Vector3(1 * 123, 2 * 123, 3 * 123));
			});
		});

		describe('div', function () {
			it('can perform division', function () {
				var a = new Vector3(1, 2, 3);
				var b = new Vector3(1, 2, 3);

				a.div(a);

				expect(a).toBeCloseToVector(new Vector3(1, 1, 1));
				expect(Vector3.div(b, b)).toBeCloseToVector(new Vector3(1, 1, 1));

				expect(Vector3.div(b, 1)).toBeCloseToVector(new Vector3(1, 2, 3));
				expect(Vector3.div(1, b)).toBeCloseToVector(new Vector3(1, 1/2, 1/3));

				expect(Vector3.div(b, [1, 2, 3])).toBeCloseToVector(new Vector3(1, 1, 1));
				expect(Vector3.div([1, 2, 3], b)).toBeCloseToVector(new Vector3(1, 1, 1));
			});
		});

		describe('dot', function () {
			it('can calculate dot products', function () {
				var a = new Vector3(1, 2, 0);
				var b = new Vector3(1, 2, 0);

				expect(a.dot(b)).toEqual(5);
				expect(Vector3.dot(a, b)).toEqual(5);
			});

			it('returns garbage if supplied with garbage', function () {
				expect(Vector3.dot([1, 2], [5])).toEqual(NaN);
			});
		});

		describe('dotVector', function () {
			it('can calculate dot products', function () {
				var a = new Vector3(1, 2, 0);
				var b = new Vector3(1, 2, 0);

				expect(a.dotVector(b)).toEqual(5);
			});
		});

		describe('cross', function () {
			it('can calculate cross products', function () {
				var a = new Vector3(3, 2, 1);
				var b = new Vector3(3, 2, 1);
				var c = new Vector3(1, 2, 3);

				a.cross(c);

				expect(a).toBeCloseToVector(new Vector3(4, -8, 4));
				expect(Vector3.cross(b, c)).toBeCloseToVector(new Vector3(4, -8, 4));
			});

			it('can calculate cross products of two vectors given as arrays', function () {
				expect(Vector3.cross([3, 2, 1], [1, 2, 3])).toBeCloseToVector(new Vector3(4, -8, 4));
			});
		});

		describe('reflect', function () {
			it('can reflect a vector', function () {
				var plane = new Vector3(-1, 0, 1).normalize();
				var original = new Vector3(1, 0, 0);
				var reflection = original.clone().reflect(plane);

				expect(reflection).toBeCloseToVector(new Vector3(0, 0, 1));
			});
		});

		it('can calculate the distance', function () {
			var a = new Vector3(3, 2, 1);
			var b = new Vector3(1, 2, 3);

			var dist = a.distanceSquared(b);

			expect(dist).toEqual(8);
		});

		it('can be normalized', function () {
			var a = new Vector3();

			a.set(0, 0, 0).normalize();
			expect(a.x).toBeCloseTo(0);
			expect(a.y).toBeCloseTo(0);
			expect(a.z).toBeCloseTo(0);

			a.set(1, 1, 1).normalize();
			expect(a.x).toBeCloseTo(1/Math.sqrt(3));
			expect(a.y).toBeCloseTo(1/Math.sqrt(3));
			expect(a.z).toBeCloseTo(1/Math.sqrt(3));

			a.set(12, 34, 56).normalize();
			expect(a.x).toBeCloseTo(12/Math.sqrt(12*12+34*34+56*56));
			expect(a.y).toBeCloseTo(34/Math.sqrt(12*12+34*34+56*56));
			expect(a.z).toBeCloseTo(56/Math.sqrt(12*12+34*34+56*56));
		});

		describe('copy', function () {
			it('can copy values from a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.setVector(new Vector3(55, 66, 77));
				expect(vector).toBeCloseToVector(new Vector3(55, 66, 77));
			});
		});

		describe('clone', function () {
			it('clones a vector', function () {
				var original = new Vector3(11, 22, 33);
				var clone = original.clone();

				expect(original).toBeCloseToVector(clone);
				expect(original).not.toBe(clone);
			});
		});

		describe('setDirect', function () {
			it('can set a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.setDirect(55, 66, 77);
				expect(vector).toBeCloseToVector(new Vector3(55, 66, 77));
			});
		});

		describe('setVector', function () {
			it('can set a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.setVector(new Vector3(55, 66, 77));
				expect(vector).toBeCloseToVector(new Vector3(55, 66, 77));
			});
		});

		describe('addDirect', function () {
			it('can add to a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.addDirect(55, 66, 77);
				expect(vector).toBeCloseToVector(new Vector3(11 + 55, 22 + 66, 33 + 77));
			});
		});

		describe('addVector', function () {
			it('can add to a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.addVector(new Vector3(55, 66, 77));
				expect(vector).toBeCloseToVector(new Vector3(11 + 55, 22 + 66, 33 + 77));
			});
		});

		describe('mulDirect', function () {
			it('can multiply with 3 numbers', function () {
				var vector = new Vector3(11, 22, 33);
				vector.mulDirect(55, 66, 77);
				expect(vector).toBeCloseToVector(new Vector3(11 * 55, 22 * 66, 33 * 77));
			});
		});

		describe('mulVector', function () {
			it('can multiply with a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.mulVector(new Vector3(55, 66, 77));
				expect(vector).toBeCloseToVector(new Vector3(11 * 55, 22 * 66, 33 * 77));
			});
		});

		describe('subDirect', function () {
			it('can subtract from a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.subDirect(55, 66, 77);
				expect(vector).toBeCloseToVector(new Vector3(11 - 55, 22 - 66, 33 - 77));
			});
		});

		describe('subVector', function () {
			it('can subtract from a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.subVector(new Vector3(55, 66, 77));
				expect(vector).toBeCloseToVector(new Vector3(11 - 55, 22 - 66, 33 - 77));
			});
		});
	});
});


var Vector4 = require("../../src/goo/math/Vector4");
var Matrix4 = require("../../src/goo/math/Matrix4");
var CustomMatchers = require("./CustomMatchers");

describe('Vector4', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	describe('constructor', function () {
		it('creates a zero vector when given no parameters', function () {
			expect(new Vector4()).toBeCloseToVector(Vector4.ZERO);
		});

		it('creates a vector when given 4 parameters', function () {
			var vector = new Vector4(11, 22, 33, 44);

			var expected = new Vector4();
			expected.x = 11;
			expected.y = 22;
			expected.z = 33;
			expected.w = 44;

			expect(vector).toBeCloseToVector(expected);
		});

		it('creates a vector when given an array', function () {
			var vector = new Vector4([1, 2, 3, 4]);
			var expected = new Vector4(1, 2, 3, 4);

			expect(vector).toBeCloseToVector(expected);
		});

		it('creates a vector when given a vector', function () {
			var original = new Vector4(1, 2, 3, 4);
			var vector = new Vector4(original);
			var expected = new Vector4(1, 2, 3, 4);

			expect(vector).toBeCloseToVector(expected);
		});
	});

	describe('indices', function () {
		it('can be accessed through indices (debug only)', function () {
			var a = new Vector4(11, 22, 33, 44);

			expect(function () { a[0]; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
			expect(function () { a[1]; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
			expect(function () { a[2]; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
			expect(function () { a[3]; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
		});

		it('can be modified through indices (debug only)', function () {
			var a = new Vector4();

			expect(function () { a[0] = 11; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
			expect(function () { a[1] = 22; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
			expect(function () { a[2] = 33; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
			expect(function () { a[3] = 44; })
				.toThrow(new Error('Vector component access through indices is not supported anymore'));
		});
	});

	describe('aliases', function () {
		it('can be accessed through aliases', function () {
			var a = new Vector4(1, 2, 3, 4);

			expect(a.x).toEqual(1);
			expect(a.y).toEqual(2);
			expect(a.z).toEqual(3);
			expect(a.w).toEqual(4);

			expect(a.r).toEqual(1);
			expect(a.g).toEqual(2);
			expect(a.b).toEqual(3);
			expect(a.a).toEqual(4);
		});

		it('can be modified through aliases', function () {
			var a = new Vector4();

			a.x = 1;
			a.y = 2;
			a.z = 3;
			a.w = 4;

			expect(a).toBeCloseToVector(new Vector4(1, 2, 3, 4));

			a.r = 2;
			a.g = 3;
			a.b = 4;
			a.a = 5;

			expect(a).toBeCloseToVector(new Vector4(2, 3, 4, 5));
		});
	});

	describe('scale', function () {
		it('scales a vector', function () {
			var vector = new Vector4(1, 2, 3, 4);
			vector.scale(123);
			expect(vector).toBeCloseToVector(new Vector4(1 * 123, 2 * 123, 3 * 123, 4 * 123));
		});
	});

	describe('dot', function () {
		it('can calculate dot products', function () {
			var a = new Vector4(1, 2, 3, 4);
			var b = new Vector4(2, 3, 4, 5);

			expect(a.dot(b)).toEqual(40);
		});
	});

	it('can linearly interpolate', function () {
		var a = new Vector4(0, 0, 0, 0);
		var b = new Vector4(1, 1, 1, 1);

		expect(a.lerp(b, 0.0)).toBeCloseToVector(new Vector4(0, 0, 0, 0));
		expect(a.lerp(b, 1.0)).toBeCloseToVector(new Vector4(1, 1, 1, 1));
		a.setDirect(0, 0, 0, 0);
		expect(a.lerp(b, 0.5)).toBeCloseToVector(new Vector4(0.5, 0.5, 0.5, 0.5));
	});

	describe('copy', function () {
		it('can copy values from a vector', function () {
			var vector = new Vector4(11, 22, 33, 44);
			vector.copy(new Vector4(55, 66, 77, 88));
			expect(vector).toBeCloseToVector(new Vector4(55, 66, 77, 88));
		});
	});

	describe('clone', function () {
		it('clones a vector', function () {
			var original = new Vector4(11, 22, 33, 44);
			var clone = original.clone();

			expect(original).toBeCloseToVector(clone);
			expect(original).not.toBe(clone);
		});
	});

	describe('setDirect', function () {
		it('can set a vector', function () {
			var vector = new Vector4(11, 22, 33, 44);
			vector.setDirect(55, 66, 77, 88);
			expect(vector).toBeCloseToVector(new Vector4(55, 66, 77, 88));
		});
	});

	describe('setArray', function () {
		it('can set a vector', function () {
			var vector = new Vector4(11, 22, 33, 44);
			vector.setArray([55, 66, 77, 88]);
			expect(vector).toBeCloseToVector(new Vector4(55, 66, 77, 88));
		});
	});

	describe('set', function () {
		it('can set a vector', function () {
			var vector = new Vector4(11, 22, 33, 44);
			vector.set(new Vector4(55, 66, 77, 88));
			expect(vector).toBeCloseToVector(new Vector4(55, 66, 77, 88));
		});
	});


	describe('addDirect', function () {
		it('can add to a vector', function () {
			var vector = new Vector4(11, 22, 33, 44);
			vector.addDirect(55, 66, 77, 88);
			expect(vector).toBeCloseToVector(new Vector4(11 + 55, 22 + 66, 33 + 77, 44 + 88));
		});
	});

	describe('add', function () {
		it('can add to a vector', function () {
			var vector = new Vector4(11, 22, 33, 44);
			vector.add(new Vector4(55, 66, 77, 88));
			expect(vector).toBeCloseToVector(new Vector4(11 + 55, 22 + 66, 33 + 77, 44 + 88));
		});
	});


	describe('subDirect', function () {
		it('can subtract from a vector', function () {
			var vector = new Vector4(11, 22, 33, 44);
			vector.subDirect(55, 66, 77, 88);
			expect(vector).toBeCloseToVector(new Vector4(11 - 55, 22 - 66, 33 - 77, 44 - 88));
		});
	});

	describe('sub', function () {
		it('can subtract from a vector', function () {
			var vector = new Vector4(11, 22, 33, 44);
			vector.sub(new Vector4(55, 66, 77, 88));
			expect(vector).toBeCloseToVector(new Vector4(11 - 55, 22 - 66, 33 - 77, 44 - 88));
		});
	});


	describe('mulDirect', function () {
		it('can multiply with 4 numbers', function () {
			var vector = new Vector4(11, 22, 33, 44);
			vector.mulDirect(55, 66, 77, 88);
			expect(vector).toBeCloseToVector(new Vector4(11 * 55, 22 * 66, 33 * 77, 44 * 88));
		});
	});

	describe('mul', function () {
		it('can multiply with a vector', function () {
			var vector = new Vector4(11, 22, 33, 44);
			vector.mul(new Vector4(55, 66, 77, 88));
			expect(vector).toBeCloseToVector(new Vector4(11 * 55, 22 * 66, 33 * 77, 44 * 88));
		});
	});

	describe('applyPre', function () {
		it('can transform four-dimensional vectors (y = (x*M)^T)', function () {
			var vector = new Vector4(1, 2, 3, 4);
			var matrix = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			expect(vector.applyPre(matrix)).toBeCloseToVector(new Vector4(30, 70, 110, 150));
		});
	});

	describe('applyPost', function () {
		it('can transform four-dimensional vectors (y = M*x)', function () {
			var vector = new Vector4(1, 2, 3, 4);
			var matrix = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			expect(vector.applyPost(matrix)).toBeCloseToVector(new Vector4(90, 100, 110, 120));
		});
	});

	describe('fromArray', function () {
		it('creates a Vector4 from an array', function () {
			expect(Vector4.fromArray([11, 22, 33, 44]))
				.toBeCloseToVector(new Vector4(11, 22, 33, 44));
		});
	});

	describe('fromAny', function () {
		it('creates a Vector4 from 4 numbers', function () {
			expect(Vector4.fromAny(11, 22, 33, 44))
				.toBeCloseToVector(new Vector4(11, 22, 33, 44));
		});

		it('creates a Vector4 from an array of 4 numbers', function () {
			expect(Vector4.fromAny([11, 22, 33, 44]))
				.toBeCloseToVector(new Vector4(11, 22, 33, 44));
		});

		it('creates a Vector4 from an { x, y, z } object', function () {
			expect(Vector4.fromAny({ x: 11, y: 22, z: 33, w: 44 }))
				.toBeCloseToVector(new Vector4(11, 22, 33, 44));
		});

		it('clones a Vector4', function () {
			var original = new Vector4(11, 22, 33, 44);
			var clone = Vector4.fromAny(original);

			expect(clone).toBeCloseToVector(original);
			expect(clone).not.toBe(original);
		});
	});

	describe('toArray', function () {
		it('converts to array', function () {
			expect(Vector4.fromArray([1, 2, 3, 4]).toArray()).toEqual([1, 2, 3, 4]);
		});
	});

	describe('deprecated shim added 2015-10-07 (v1.0)', function () {
		describe('.data', function () {
			it('has working getters', function () {
				var v = new Vector4(1, 2, 3, 4);
				expect(v.data[0]).toEqual(1);
				expect(v.data[1]).toEqual(2);
				expect(v.data[2]).toEqual(3);
				expect(v.data[3]).toEqual(4);
			});

			it('has working setters', function () {
				var v = new Vector4();
				v.data[0] = 1;
				v.data[1] = 2;
				v.data[2] = 3;
				v.data[3] = 4;
				expect(v.x).toEqual(1);
				expect(v.y).toEqual(2);
				expect(v.z).toEqual(3);
				expect(v.w).toEqual(4);
			});

			it('distinguishes vectors', function () {
				var u = new Vector4(1, 2, 3, 4);
				var v = new Vector4(5, 6, 7, 8);
				expect(u.data[0]).toEqual(1);
				expect(v.data[0]).toEqual(5);
			});
		});

		describe('add', function () {
			it('can perform addition', function () {
				var a = new Vector4(1, 2, 3, 4);
				var b = new Vector4(1, 2, 3, 4);

				a.add(a);

				expect(a).toBeCloseToVector(new Vector4(2, 4, 6, 8));
				expect(Vector4.add(b, b)).toBeCloseToVector(new Vector4(2, 4, 6, 8));

				expect(Vector4.add(b, 1)).toBeCloseToVector(new Vector4(2, 3, 4, 5));
				expect(Vector4.add(1, b)).toBeCloseToVector(new Vector4(2, 3, 4, 5));

				expect(Vector4.add(b, [1, 2, 3, 4])).toBeCloseToVector(new Vector4(2, 4, 6, 8));
				expect(Vector4.add([1, 2, 3, 4], b)).toBeCloseToVector(new Vector4(2, 4, 6, 8));
			});
		});

		describe('sub', function () {
			it('can perform subtraction', function () {
				var a = new Vector4(1, 2, 3, 4);
				var b = new Vector4(1, 2, 3, 4);

				a.sub(a);

				expect(a).toBeCloseToVector(new Vector4(0, 0, 0, 0));
				expect(Vector4.sub(b, b)).toBeCloseToVector(new Vector4(0, 0, 0, 0));

				expect(Vector4.sub(b, 1)).toBeCloseToVector(new Vector4(0, 1, 2, 3));
				expect(Vector4.sub(1, b)).toBeCloseToVector(new Vector4(0, -1, -2, -3));

				expect(Vector4.sub(b, [1, 2, 3, 4])).toBeCloseToVector(new Vector4(0, 0, 0, 0));
				expect(Vector4.sub([1, 2, 3, 4], b)).toBeCloseToVector(new Vector4(0, 0, 0, 0));
			});
		});

		describe('mul', function () {
			it('can perform multiplication', function () {
				var a = new Vector4(1, 2, 3, 4);
				var b = new Vector4(1, 2, 3, 4);

				a.mul(a);

				expect(a).toBeCloseToVector(new Vector4(1, 4, 9, 16));
				expect(Vector4.mul(b, b)).toBeCloseToVector(new Vector4(1, 4, 9, 16));

				expect(Vector4.mul(b, 1)).toBeCloseToVector(new Vector4(1, 2, 3, 4));
				expect(Vector4.mul(1, b)).toBeCloseToVector(new Vector4(1, 2, 3, 4));

				expect(Vector4.mul(b, [1, 2, 3, 4])).toBeCloseToVector(new Vector4(1, 4, 9, 16));
				expect(Vector4.mul([1, 2, 3, 4], b)).toBeCloseToVector(new Vector4(1, 4, 9, 16));
			});
		});

		describe('scale', function () {
			it('scales a vector', function () {
				var vector = new Vector4(1, 2, 3, 4);
				vector.scale(123);
				expect(vector).toBeCloseToVector(new Vector4(1 * 123, 2 * 123, 3 * 123, 4 * 123));
			});
		});

		describe('div', function () {
			it('can perform division', function () {
				var a = new Vector4(1, 2, 3, 4);
				var b = new Vector4(1, 2, 3, 4);

				a.div(a);

				expect(a).toBeCloseToVector(new Vector4(1, 1, 1, 1));
				expect(Vector4.div(b, b)).toBeCloseToVector(new Vector4(1, 1, 1, 1));

				expect(Vector4.div(b, 1)).toBeCloseToVector(new Vector4(1, 2, 3, 4));
				expect(Vector4.div(1, b)).toBeCloseToVector(new Vector4(1, 1 / 2, 1 / 3, 1 / 4));

				expect(Vector4.div(b, [1, 2, 3, 4])).toBeCloseToVector(new Vector4(1, 1, 1, 1));
				expect(Vector4.div([1, 2, 3, 4], b)).toBeCloseToVector(new Vector4(1, 1, 1, 1));
			});
		});

		it('can calculate dot products', function () {
			var a = new Vector4(1, 2, 3, 4);
			var b = new Vector4(2, 3, 4, 5);

			expect(a.dot(b)).toEqual(40);
			expect(Vector4.dot(a, b)).toEqual(40);
		});

		describe('dotVector', function () {
			it('can calculate dot products', function () {
				var a = new Vector4(1, 2, 3, 4);
				var b = new Vector4(2, 3, 4, 5);

				expect(a.dotVector(b)).toEqual(40);
			});
		});

		it('can linearly interpolate', function () {
			var a = new Vector4(0, 0, 0, 0);
			var b = new Vector4(1, 1, 1, 1);

			expect(a.lerp(b, 0.0)).toBeCloseToVector(new Vector4(0, 0, 0, 0));
			expect(a.lerp(b, 1.0)).toBeCloseToVector(new Vector4(1, 1, 1, 1));
			a.set(0, 0, 0, 0);
			expect(a.lerp(b, 0.5)).toBeCloseToVector(new Vector4(0.5, 0.5, 0.5, 0.5));
		});

		describe('copy', function () {
			it('can copy values from a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.copy(new Vector4(55, 66, 77, 88));
				expect(vector).toBeCloseToVector(new Vector4(55, 66, 77, 88));
			});
		});

		describe('clone', function () {
			it('clones a vector', function () {
				var original = new Vector4(11, 22, 33, 44);
				var clone = original.clone();

				expect(original).toBeCloseToVector(clone);
				expect(original).not.toBe(clone);
			});
		});

		describe('setDirect', function () {
			it('can set a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.setDirect(55, 66, 77, 88);
				expect(vector).toBeCloseToVector(new Vector4(55, 66, 77, 88));
			});
		});

		describe('setVector', function () {
			it('can set a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.setVector(new Vector4(55, 66, 77, 88));
				expect(vector).toBeCloseToVector(new Vector4(55, 66, 77, 88));
			});
		});


		describe('addDirect', function () {
			it('can add to a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.addDirect(55, 66, 77, 88);
				expect(vector).toBeCloseToVector(new Vector4(11 + 55, 22 + 66, 33 + 77, 44 + 88));
			});
		});

		describe('addVector', function () {
			it('can add to a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.addVector(new Vector4(55, 66, 77, 88));
				expect(vector).toBeCloseToVector(new Vector4(11 + 55, 22 + 66, 33 + 77, 44 + 88));
			});
		});


		describe('mulDirect', function () {
			it('can multiply with 4 numbers', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.mulDirect(55, 66, 77, 88);
				expect(vector).toBeCloseToVector(new Vector4(11 * 55, 22 * 66, 33 * 77, 44 * 88));
			});
		});

		describe('mulVector', function () {
			it('can multiply with a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.mulVector(new Vector4(55, 66, 77, 88));
				expect(vector).toBeCloseToVector(new Vector4(11 * 55, 22 * 66, 33 * 77, 44 * 88));
			});
		});


		describe('subDirect', function () {
			it('can subtract from a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.subDirect(55, 66, 77, 88);
				expect(vector).toBeCloseToVector(new Vector4(11 - 55, 22 - 66, 33 - 77, 44 - 88));
			});
		});

		describe('subVector', function () {
			it('can subtract from a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.subVector(new Vector4(55, 66, 77, 88));
				expect(vector).toBeCloseToVector(new Vector4(11 - 55, 22 - 66, 33 - 77, 44 - 88));
			});
		});
	});
});


var Noise = require("../../src/goo/noise/Noise");
var ValueNoise = require("../../src/goo/noise/ValueNoise");

describe('Noise.fractal2d', function () {
	it('Contains correctly generated values', function () {
		var N = 2;
		var noiseValues = [0x00, 0x10, 0x0B, 0x12];

		for (var y = 0; y < N; y++) {
			for (var x = 0; x < N; x++) {
				var offset = (y * N + x);
				var value = Math.floor(Noise.fractal2d(x, y, 256.0, 16, 0.75, 2.0, ValueNoise) * 255.0);

				expect(value).toEqual(noiseValues[offset]);
			}
		}
	});
});














var Configs = require("./loaders/Configs");
var GooRunner = require("../../src/goo/entities/GooRunner");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
require("../../src/goo/passpack/PosteffectsHandler");

describe('PosteffectsHandler', function () {
	var gooRunner, loader;

	beforeEach(function () {
		gooRunner = new GooRunner({
			logo: false,
			manuallyStartGameLoop: true
		});
		loader = new DynamicLoader({
			world: gooRunner.world,
			rootPath: 'loaders/res/'
		});
	});

	afterEach(function () {
		if (gooRunner) {
			gooRunner.clear();
		}
	});

	it('loads a post effect', function (done) {
		var config = Configs.posteffects();
		loader.preload(Configs.get());
		loader.load(config.id).then(function (/*posteffects*/) {
			expect(gooRunner.renderSystem.composers.length).toEqual(1);
			done();
		});
	});

	it('clears posteffect buffers from the GPU', function (done) {
		var config = Configs.posteffects();
		loader.preload(Configs.get());
		var composer;
		loader.load(config.id).then(function (/*posteffects*/) {
			expect(gooRunner.renderSystem.composers.length).toEqual(1);
			composer = gooRunner.renderSystem.composers[0];

			// Allocate buffers manually
			composer.readBuffer.glTexture = gooRunner.renderer.context.createTexture();
			composer.readBuffer._glFrameBuffer = gooRunner.renderer.context.createFramebuffer();
			composer.readBuffer._glRenderBuffer = gooRunner.renderer.context.createRenderbuffer();

			composer.writeBuffer.glTexture = gooRunner.renderer.context.createTexture();
			composer.writeBuffer._glFrameBuffer = gooRunner.renderer.context.createFramebuffer();
			composer.writeBuffer._glRenderBuffer = gooRunner.renderer.context.createRenderbuffer();

			return loader.clear();
		}).then(function () {
			expect(gooRunner.renderSystem.composers.length).toEqual(0);

			// Check destroyed
			expect(composer.writeBuffer.glTexture).toBeFalsy();
			expect(composer.writeBuffer._glRenderBuffer).toBeFalsy();
			expect(composer.writeBuffer._glFrameBuffer).toBeFalsy();

			expect(composer.readBuffer.glTexture).toBeFalsy();
			expect(composer.readBuffer._glRenderBuffer).toBeFalsy();
			expect(composer.readBuffer._glFrameBuffer).toBeFalsy();
			done();
		});
	});
});







var World = require("../../src/goo/entities/World");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var QuadComponent = require("../../src/goo/quadpack/QuadComponent");
var Configs = require("./loaders/Configs");

require("../../src/goo/quadpack/QuadComponentHandler");

describe('QuadComponentHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads an entity with a quadComponent', function (done) {
		var config = Configs.entity(['quad']);
		loader.preload(Configs.get());
		loader.load(config.id).then(function (entity) {
			expect(entity.quadComponent).toEqual(jasmine.any(QuadComponent));
			done();
		});
	});

	it('cleans up after the config was updated', function (done) {
		var config = Configs.entity(['quad']);
		loader.preload(Configs.get());
		loader.load(config.id).then(function () {
			var newConfig = JSON.parse(JSON.stringify(config));

			// Remove the material!
			delete newConfig.components.quad;
			return loader.update(config.id, newConfig);
		}).then(function (entity) {
			expect(entity._components.length).toEqual(1); // just the transform component is left
			done();
		});
	});
});


var CustomMatchers = require("./CustomMatchers");
var BufferData = require("../../src/goo/renderer/BufferData");

describe('BufferData', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	describe('copy', function () {
		it('can copy everything from another plane', function () {
			var original = new BufferData(new Uint8Array([11, 22, 33]), 'ArrayBuffer');
			var copy = new BufferData(new Uint8Array([44, 55, 66]), 'ElementArrayBuffer');
			copy.copy(original);

			expect(copy).toBeCloned(original);
		});
	});

	describe('clone', function () {
		it('can clone a plane', function () {
			var original = new BufferData(new Uint8Array([11, 22, 33]), 'ArrayBuffer');
			var clone = original.clone();

			expect(clone).toBeCloned(original);
		});
	});
});




var CustomMatchers = require("./CustomMatchers");
var Camera = require("../../src/goo/renderer/Camera");
var BoundingSphere = require("../../src/goo/renderer/bounds/BoundingSphere");
var BoundingBox = require("../../src/goo/renderer/bounds/BoundingBox");
var Vector3 = require("../../src/goo/math/Vector3");

describe('Camera', function () {
	var camera;

	beforeEach(function () {
		camera = new Camera(90, 1, 1, 100);
		jasmine.addMatchers(CustomMatchers);
	});

	it('can pack frustum around bounds', function () {
		var bound = new BoundingSphere();
		bound.radius = 10.0;
		bound.center.setDirect(0, 0, -20);

		camera.pack(bound);

		expect(camera._frustumNear).toBeCloseTo(10.0, 5);
		expect(camera._frustumFar).toBeCloseTo(30.0, 5);
		expect(camera._frustumLeft).toBeCloseTo(-10.0, 5);
		expect(camera._frustumBottom).toBeCloseTo(-10.0, 5);
		expect(camera._frustumTop).toBeCloseTo(10.0, 5);
		expect(camera._frustumRight).toBeCloseTo(10.0, 5);
	});

	it('can pick a ray', function () {
		var ray = camera.getPickRay(50, 50, 100, 100);
		expect(ray.origin).toBeCloseToVector(new Vector3(0, 0, -1)); // from nearplane (with negative z direction)
		expect(ray.direction).toBeCloseToVector(new Vector3(0, 0, -1));
	});

	it('can get the world position', function () {
		var vec = camera.getWorldPosition(25, 25, 100, 100, 10);
		expect(vec.z).toBeCloseTo(-10); // minus because Camera looks at negative z
	});

	it('can get the world coordinates', function () {
		var vec = camera.getWorldCoordinates(25, 25, 100, 100, 0.9091);
		expect(vec.z).toBeCloseTo(-10); // minus because Camera looks at negative z
	});

	it('can lookAt', function () {
		camera.lookAt(new Vector3(-1, 0, 0), Vector3.UNIT_Y);
		expect(camera.translation).toBeCloseToVector(new Vector3(0, 0, 0)); // from nearplane (with negative z direction)
		expect(camera._left).toBeCloseToVector(new Vector3(0, 0, 1)); // from nearplane (with negative z direction)
		expect(camera._up).toBeCloseToVector(new Vector3(0, 1, 0)); // from nearplane (with negative z direction)
		expect(camera._direction).toBeCloseToVector(new Vector3(-1, 0, 0)); // from nearplane (with negative z direction)
	});

	it('does correct intersection calculations against boundingbox and boundingsphere', function () {
		var tests = [
			[-10, 0, -10, Camera.Intersects], // place to intersect with left plane
			[10, 0, -10, Camera.Intersects], // place to intersect with right plane
			[0, 10, -10, Camera.Intersects], // place to intersect with top plane
			[0, -10, -10, Camera.Intersects], // place to intersect with bottom plane
			[0, 0, -1, Camera.Intersects], // place to intersect with near plane
			[0, 0, -100, Camera.Intersects], // place to intersect with far plane

			[0, 0, -10, Camera.Inside], // place to be inside

			[-100, 0, -10, Camera.Outside], // place to be outside left plane
			[100, 0, -10, Camera.Outside], // place to be outside right plane
			[0, 100, -10, Camera.Outside], // place to be outside top plane
			[0, -100, -10, Camera.Outside], // place to be outside bottom plane
			[0, 0, 10, Camera.Outside], // place to be outside near plane
			[0, 0, -1000, Camera.Outside] // place to be outside far plane
		];
		var testBounds = function (bounding, testdata) {
			for (var i = 0; i < testdata.length; i++) {
				var data = testdata[i];
				bounding.center.setDirect(data[0], data[1], data[2]);
				expect(camera.contains(bounding)).toBe(data[3]);
			}
		};
		testBounds(new BoundingBox(), tests);
		testBounds(new BoundingSphere(), tests);
	});

	it('can calculate corners of frustum', function () {
		var corners = camera.calculateFrustumCorners();
		expect(corners[0]).toBeCloseToVector(new Vector3(1, -1, -1));
		expect(corners[1]).toBeCloseToVector(new Vector3(-1, -1, -1));
		expect(corners[2]).toBeCloseToVector(new Vector3(-1, 1, -1));
		expect(corners[3]).toBeCloseToVector(new Vector3(1, 1, -1));
		expect(corners[4]).toBeCloseToVector(new Vector3(100, -100, -100));
		expect(corners[5]).toBeCloseToVector(new Vector3(-100, -100, -100));
		expect(corners[6]).toBeCloseToVector(new Vector3(-100, 100, -100));
		expect(corners[7]).toBeCloseToVector(new Vector3(100, 100, -100));
	});

	describe('setFrustumPerspective', function () {
		it('safely deals with far planes that are too near', function () {
			var near = 1;
			var far = 1;
			camera.setFrustumPerspective(45, 1, near, far);
			expect(camera._frustumFar - camera._frustumNear).toBeGreaterThan(0);
		});

		it('remembers the given bad values for the near and far planes', function () {
			var near = 1;
			var far = -1;
			camera.setFrustumPerspective(45, 1, near, far);
			expect(camera.near).toBeCloseTo(1);
			expect(camera.far).toBeCloseTo(-1);
		});
	});

	describe('setFrustum', function () {
		it('safely deals with far planes that are too near', function () {
			var near = 1;
			var far = 1;
			camera.setFrustum(near, far);
			expect(camera._frustumFar - camera._frustumNear).toBeGreaterThan(0);
		});

		it('remembers the given bad values for the near and far planes', function () {
			var near = 1;
			var far = -1;
			camera.setFrustum(near, far);
			expect(camera.near).toBeCloseTo(1);
			expect(camera.far).toBeCloseTo(-1);
		});
	});

	describe('copy', function () {
		it('can copy everything from another camera', function () {
			var original = new Camera(50, 2, 2, 2000);
			var copy = new Camera();
			copy.copy(original);

			expect(copy).toBeCloned(original);
		});
	});

	describe('clone', function () {
		it('clones a camera', function () {
			var original = new Camera(50, 2, 2, 2000);
			var clone = original.clone();

			expect(clone).toBeCloned(original);
		});
	});
});


var Material = require("../../src/goo/renderer/Material");
var ShaderLib = require("../../src/goo/renderer/shaders/ShaderLib");

describe('Material', function () {
	describe('constructor', function () {
		it('constructs a material given no parameters', function () {
			var material = new Material();

			expect(material.name).toEqual('Default Material');
			expect(material.shader).toBeNull();
		});

		it('constructs a material given a name only', function () {
			var name = 'alabalaportocala';
			var material = new Material(name);

			expect(material.name).toEqual(name);
			expect(material.shader).toBeNull();
		});

		it('constructs a material given name shader definition only', function () {
			var material = new Material(ShaderLib.simpleLit);

			expect(material.name).toEqual('Default Material');
			expect(material.shader).not.toBeNull();
		});

		it('constructs a material given a name and a shader definition', function () {
			var name = 'alabalaportocala';
			var material = new Material(name, ShaderLib.simpleLit);

			expect(material.name).toEqual(name);
			expect(material.shader).not.toBeNull();
		});

		it('constructs a material given a shader definition and a name', function () {
			var name = 'alabalaportocala';
			var material = new Material(ShaderLib.simpleLit, name);

			expect(material.name).toEqual(name);
			expect(material.shader).not.toBeNull();
		});
	});
});

var MeshData = require("../../src/goo/renderer/MeshData");
var Quad = require("../../src/goo/shapes/Quad");
var Box = require("../../src/goo/shapes/Box");
var Transform = require("../../src/goo/math/Transform");

describe('MeshData', function () {
	it('getNormalsMeshData: number of vertices and indices', function () {
		var box = new Box();
		var normalsMD = box.getNormalsMeshData();

		var nNormalsPerFace = 4;
		var nFaces = 6;
		var nVerticesPerLine = 2;
		var nDimensions = 3;

		expect(normalsMD.vertexCount).toEqual(nNormalsPerFace * nFaces * nVerticesPerLine * nDimensions);
		expect(normalsMD.indexCount).toEqual(nNormalsPerFace * nFaces * nVerticesPerLine);
	});

	it('can rebuild data with other counts', function () {
		var box = new Box();

		box.rebuildData(3, 3);

		expect(box.vertexCount).toEqual(3);
		expect(box.indexCount).toEqual(3);
	});

	it('can rebuild data with an indexCount of 0 and saveOldData', function () {
		var box = new Box();
		var oldVertexCount = box.vertexCount;

		box.rebuildData(oldVertexCount, 0, true);

		expect(box.vertexCount).toEqual(oldVertexCount);
		expect(box.indexCount).toEqual(0);
	});

	it('can translate vertices', function () {
		var box = new Quad();

		var transform = new Transform();
		transform.translation.setDirect(1, 2, 3);
		transform.update();
		box.applyTransform(MeshData.POSITION, transform);

		expect(box.dataViews.POSITION[0]).toBeCloseTo(0.5); // -0.5 + 1
		expect(box.dataViews.POSITION[1]).toBeCloseTo(1.5); // -0.5 + 2
		expect(box.dataViews.POSITION[2]).toBeCloseTo(3.0); //  0.0 + 3

		expect(box.dataViews.POSITION[3]).toBeCloseTo(0.5); // -0.5 + 1
		expect(box.dataViews.POSITION[4]).toBeCloseTo(2.5); //  0.5 + 2
		expect(box.dataViews.POSITION[5]).toBeCloseTo(3.0); //  0.0 + 3

		expect(box.dataViews.POSITION[6]).toBeCloseTo(1.5); //  0.5 + 1
		expect(box.dataViews.POSITION[7]).toBeCloseTo(2.5); //  0.5 + 2
		expect(box.dataViews.POSITION[8]).toBeCloseTo(3.0); //  0.0 + 3

		expect(box.dataViews.POSITION[9]).toBeCloseTo(1.5);  //  0.5 + 1
		expect(box.dataViews.POSITION[10]).toBeCloseTo(1.5); // -0.5 + 2
		expect(box.dataViews.POSITION[11]).toBeCloseTo(3.0); //  0.0 + 3
	});

	it('can rotate vertices', function () {
		var box = new Quad();

		var transform = new Transform();
		transform.setRotationXYZ(Math.PI / 4, 0, 0);
		transform.update();
		box.applyTransform(MeshData.POSITION, transform);

		expect(box.dataViews.POSITION[0]).toBeCloseTo(-0.5 ); // -0.5
		expect(box.dataViews.POSITION[1]).toBeCloseTo(-Math.sqrt(2) / 4); // -Math.sqrt(2) / 4
		expect(box.dataViews.POSITION[2]).toBeCloseTo(-Math.sqrt(2) / 4); // -Math.sqrt(2) / 4

		expect(box.dataViews.POSITION[3]).toBeCloseTo(-0.5); // -0.5
		expect(box.dataViews.POSITION[4]).toBeCloseTo( Math.sqrt(2) / 4); //  Math.sqrt(2) / 4
		expect(box.dataViews.POSITION[5]).toBeCloseTo( Math.sqrt(2) / 4); //  Math.sqrt(2) / 4

		expect(box.dataViews.POSITION[6]).toBeCloseTo( 0.5); //  0.5
		expect(box.dataViews.POSITION[7]).toBeCloseTo( Math.sqrt(2) / 4); //  Math.sqrt(2) / 4
		expect(box.dataViews.POSITION[8]).toBeCloseTo( Math.sqrt(2) / 4); //  Math.sqrt(2) / 4

		expect(box.dataViews.POSITION[9]).toBeCloseTo( 0.5);  //  0.5
		expect(box.dataViews.POSITION[10]).toBeCloseTo(-Math.sqrt(2) / 4); // -Math.sqrt(2) / 4
		expect(box.dataViews.POSITION[11]).toBeCloseTo(-Math.sqrt(2) / 4); // -Math.sqrt(2) / 4
	});

	it('can apply a function on vertices', function () {
		var box = new Quad();

		box.applyFunction(MeshData.POSITION, function (vert) {
			vert.z = vert.x + vert.y;
			return vert;
		});

		expect(box.dataViews.POSITION[0]).toBeCloseTo(-0.5); // -0.5
		expect(box.dataViews.POSITION[1]).toBeCloseTo(-0.5); // -0.5
		expect(box.dataViews.POSITION[2]).toBeCloseTo(-1.0); //  0.0

		expect(box.dataViews.POSITION[3]).toBeCloseTo(-0.5); // -0.5
		expect(box.dataViews.POSITION[4]).toBeCloseTo(0.5); //  0.5
		expect(box.dataViews.POSITION[5]).toBeCloseTo(0.0); //  0.0

		expect(box.dataViews.POSITION[6]).toBeCloseTo(0.5); //  0.5
		expect(box.dataViews.POSITION[7]).toBeCloseTo(0.5); //  0.5
		expect(box.dataViews.POSITION[8]).toBeCloseTo(1.0); //  0.0

		expect(box.dataViews.POSITION[9]).toBeCloseTo(0.5);  //  0.5
		expect(box.dataViews.POSITION[10]).toBeCloseTo(-0.5); // -0.5
		expect(box.dataViews.POSITION[11]).toBeCloseTo(0.0); //  0.0
	});

	it('can get attribute buffer', function () {
		var box = new Box();

		var getAttributeBuffer = box.getAttributeBuffer.bind(box);

		expect(getAttributeBuffer(MeshData.POSITION)).toBeDefined();
		expect(getAttributeBuffer(MeshData.NORMAL)).toBeDefined();
		expect(getAttributeBuffer(MeshData.COLOR)).toBeUndefined();
		expect(getAttributeBuffer(MeshData.TANGENT)).toBeUndefined();
		expect(getAttributeBuffer(MeshData.TEXCOORD0)).toBeDefined();
		expect(getAttributeBuffer(MeshData.TEXCOORD1)).toBeUndefined();
		expect(getAttributeBuffer(MeshData.TEXCOORD2)).toBeUndefined();
		expect(getAttributeBuffer(MeshData.TEXCOORD3)).toBeUndefined();
		expect(getAttributeBuffer(MeshData.WEIGHTS)).toBeUndefined();
		expect(getAttributeBuffer(MeshData.JOINTIDS)).toBeUndefined();
	});
});


var Vector3 = require("../../src/goo/math/Vector3");
var RenderQueue = require("../../src/goo/renderer/RenderQueue");

describe('RenderQueue Sorting', function () {
	var createRenderable = function (name, renderQueueBucket, translation, defineKey) {
		var renderable = {
			name: name,
			defineKey: defineKey,
			transformComponent: {
				worldTransform: {
					translation: translation
				}
			},
			meshRendererComponent: {
				worldBound: null,
				materials: []
			}
		};
		if (defineKey) {
			renderable.meshRendererComponent.materials.push({
				getRenderQueue: function () {
					return renderQueueBucket;
				},
				shader: {
					defineKey: defineKey
				}
			});
		}
		return renderable;
	};

	var renderQueue, camera;
	beforeEach(function () {
		renderQueue = new RenderQueue();
		camera = {
			translation: new Vector3(0, 0, 100)
		};
	});
	it('objects without materials remain unsorted', function () {
		var r1 = createRenderable('R1', RenderQueue.OPAQUE, new Vector3(0, 0, 0), null);
		var r2 = createRenderable('R2', RenderQueue.OPAQUE, new Vector3(0, 0, 10), null);
		var r3 = createRenderable('R3', RenderQueue.OPAQUE, new Vector3(0, 0, 20), null);

		var renderList = [r1, r2, r3];

		renderQueue.sort(renderList, camera);

		expect(renderList).toEqual([r1, r2, r3]);
	});
	it('can sort equal objects based on distance, front to back', function () {
		var r1 = createRenderable('R1', RenderQueue.OPAQUE, new Vector3(0, 0, 0), 'Key1');
		var r2 = createRenderable('R2', RenderQueue.OPAQUE, new Vector3(0, 0, 10), 'Key1');
		var r3 = createRenderable('R3', RenderQueue.OPAQUE, new Vector3(0, 0, 20), 'Key1');

		var renderList = [r1, r2, r3];

		renderQueue.sort(renderList, camera);

		expect(renderList).toEqual([r3, r2, r1]);
	});
	it('can sort objects based on distance and shader keys', function () {
		var r1 = createRenderable('R1', RenderQueue.OPAQUE, new Vector3(0, 0, 0), 'Key1');
		var r2 = createRenderable('R2', RenderQueue.OPAQUE, new Vector3(0, 0, 10), 'Key2_extra');
		var r3 = createRenderable('R3', RenderQueue.OPAQUE, new Vector3(0, 0, 20), 'Key1');
		var r4 = createRenderable('R4', RenderQueue.OPAQUE, new Vector3(0, 0, 30), 'Key2_extra');

		var renderList = [r1, r2, r3, r4];

		renderQueue.sort(renderList, camera);

		expect(renderList).toEqual([r4, r2, r3, r1]);
	});
	it('can sort objects based on distance and similar shader keys', function () {
		var r1 = createRenderable('R1', RenderQueue.OPAQUE, new Vector3(0, 0, 0), 'Key1');
		var r2 = createRenderable('R2', RenderQueue.OPAQUE, new Vector3(0, 0, 10), 'Key2_extra');
		var r3 = createRenderable('R3', RenderQueue.OPAQUE, new Vector3(0, 0, 20), 'Key3_extra');
		var r4 = createRenderable('R4', RenderQueue.OPAQUE, new Vector3(0, 0, 30), 'Key1');
		var r5 = createRenderable('R5', RenderQueue.OPAQUE, new Vector3(0, 0, 40), 'Key2_extra');
		var r6 = createRenderable('R6', RenderQueue.OPAQUE, new Vector3(0, 0, 50), 'Key3_extra');

		var renderList = [r1, r2, r3, r4, r5, r6];

		renderQueue.sort(renderList, camera);

		expect(renderList).toEqual([r6, r3, r5, r2, r4, r1]);
	});

	it('can sort transparent objects based on distance, back to front', function () {
		var r1 = createRenderable('R1', RenderQueue.TRANSPARENT, new Vector3(0, 0, 0), 'Key1');
		var r2 = createRenderable('R2', RenderQueue.TRANSPARENT, new Vector3(0, 0, -10), 'Key1');
		var r3 = createRenderable('R3', RenderQueue.TRANSPARENT, new Vector3(0, 0, -20), 'Key1');

		var renderList = [r1, r2, r3];

		renderQueue.sort(renderList, camera);

		expect(renderList).toEqual([r3, r2, r1]);
	});

	it('can correctly sort both opaque and transparent objects', function () {
		var r1 = createRenderable('R1', RenderQueue.TRANSPARENT, new Vector3(0, 0, 0), 'Key1');
		var r2 = createRenderable('R2', RenderQueue.OPAQUE, new Vector3(0, 0, 10), 'Key1');
		var r3 = createRenderable('R3', RenderQueue.TRANSPARENT, new Vector3(0, 0, -20), 'Key1');
		var r4 = createRenderable('R4', RenderQueue.OPAQUE, new Vector3(0, 0, 20), 'Key1');

		var renderList = [r1, r2, r3, r4];

		renderQueue.sort(renderList, camera);

		expect(renderList).toEqual([r4, r2, r3, r1]);
	});
});


var RendererRecord = require("../../src/goo/renderer/RendererRecord");
var Renderer = require("../../src/goo/renderer/Renderer");

describe('Renderer', function () {
	describe('findOrCacheMaterialShader', function () {
		var renderer;
		beforeEach(function () {
			renderer = {};
			renderer.rendererRecord = new RendererRecord();
			renderer.findOrCacheMaterialShader = Renderer.prototype.findOrCacheMaterialShader.bind(renderer);
		});

		function getShader(key, uniforms) {
			return {
				defineKey: key,
				getDefineKey: function () { return key; },
				endFrame: function () {},
				uniforms: uniforms,
				clone: function () { return { key: 'phony' }; }
			};
		}

		it('creates a new shader and caches it', function () {
			var shader = getShader('k1', {});
			var material = {
				shader: shader
			};

			renderer.findOrCacheMaterialShader(material, {});

			expect(renderer.rendererRecord.shaderCache.get('k1')).toBe(material.shader);
			expect(material.shader).not.toBe(shader);
		});

		it('finds a shader with the exact same defines and uses it', function () {
			var shader = getShader('k1', {});

			renderer.rendererRecord.shaderCache.set('k1', shader);

			var material = {
				shader: shader
			};

			renderer.findOrCacheMaterialShader(material, {});

			expect(material.shader).toBe(shader);
		});

		it('finds a shader with the exact same defines and overrides its uniforms', function () {
			var shader = getShader('k1', { u1: 0, u2: 0 });

			renderer.rendererRecord.shaderCache.set('k1', shader);

			var material = {
				shader: getShader('k1', { u1: 123, u2: 456, u3: [7, 8, 9] })
			};

			renderer.findOrCacheMaterialShader(material, {});

			expect(material.shader.uniforms).toEqual({ u1: 123, u2: 456, u3: [7, 8, 9] });
			expect(material.shader.uniforms.u3).not.toBe(shader.u3);
		});
	});
});




var RendererUtils = require("../../src/goo/renderer/RendererUtils");
var CustomMatchers = require("./CustomMatchers");

describe('RendererUtils', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	describe('clone', function () {
		var clone = RendererUtils.clone;

		it('does not clone primitives and functions', function () {
			expect(clone(123)).toBe(123);
			expect(clone(true)).toBe(true);
			expect(clone('asd')).toBe('asd');

			var func = function () {};
			expect(clone(func)).toBe(func);
		});

		it('does not clone null or undefined', function () {
			expect(clone(null)).toBeNull();
			expect(clone(undefined)).toBeUndefined();
		});

		it('clones arrays', function () {
			var original = [1, 2, 3];
			expect(clone(original)).toBeCloned(original);
		});

		it('clones objects', function () {
			var original = { a: 123, b: 321 };
			expect(clone(original)).toBeCloned(original);
		});

		it('clones a typed array', function () {
			var original = new Uint32Array([1, 2, 3]);
			expect(clone(original)).toBeCloned(original);
		});
	});
});


var DirectionalLight = require("../../src/goo/renderer/light/DirectionalLight");
var Texture = require("../../src/goo/renderer/Texture");
var Camera = require("../../src/goo/renderer/Camera");
var Box = require("../../src/goo/shapes/Box");
var Material = require("../../src/goo/renderer/Material");
var MeshData = require("../../src/goo/renderer/MeshData");
var Shader = require("../../src/goo/renderer/Shader");
var ShaderLib = require("../../src/goo/renderer/shaders/ShaderLib");
var ShaderCall = require("../../src/goo/renderer/ShaderCall");
var RendererRecord = require("../../src/goo/renderer/RendererRecord");
var ObjectUtils = require("../../src/goo/util/ObjectUtils");

(function () {
	describe('Shader', function () {
		describe('DefineKey', function () {
			var shader;
			beforeEach(function () {
				shader = new Shader('TestName', ObjectUtils.clone(ShaderLib.simple));
			});

			it('can generate define key when no defines', function () {
				var defineIndices = [];
				var key = shader.getDefineKey(defineIndices);
				expect(key).toEqual('Key:TestName');
				expect(defineIndices).toEqual([]);
			});

			it('can generate define key with one define', function () {
				var defineIndices = [];

				shader.setDefine('TEST_DEFINE', true);

				var key = shader.getDefineKey(defineIndices);
				expect(key).toEqual('Key:TestName_0:true');
				expect(defineIndices).toEqual(['TEST_DEFINE']);
			});

			it('can generate define key with various define types (added)', function () {
				var defineIndices = [];

				shader.setDefine('TEST_DEFINE1', true);
				shader.setDefine('TEST_DEFINE2', 5);

				var key = shader.getDefineKey(defineIndices);
				expect(key).toEqual('Key:TestName_0:true_1:5');
				expect(defineIndices).toEqual(['TEST_DEFINE1', 'TEST_DEFINE2']);
			});

			it('can generate define key with various define types (added+removed)', function () {
				var defineIndices = [];

				shader.setDefine('TEST_DEFINE1', true);
				shader.setDefine('TEST_DEFINE2', 5);
				shader.removeDefine('TEST_DEFINE1');

				var key = shader.getDefineKey(defineIndices);
				expect(key).toEqual('Key:TestName_0:5');
				expect(defineIndices).toEqual(['TEST_DEFINE2']);
			});

			it('only re-generate key when dirty', function () {
				var defineIndices = [];

				shader.defineKey = 'unset';

				shader.setDefine('TEST_DEFINE1', true);

				var key = shader.getDefineKey(defineIndices);

				expect(key).toEqual('Key:TestName_0:true');

				shader.defineKey = 'unset';

				key = shader.getDefineKey(defineIndices);

				expect(key).toEqual('unset');
			});
		});

		describe('ShaderCall', function () {
			var context;

			beforeEach(function () {
				context = createContext();
			});

			var testSingleCall = function (shaderCall, method, value) {
				shaderCall.call(value);
				expect(method).toHaveBeenCalled();
				var args = method.calls.mostRecent().args;
				expect(args[args.length - 1]).toEqual(value);
			};

			var testShaderCall = function (context, method, type, value1, value2) {
				var shaderCall = new ShaderCall(context, {}, type);
				spyOn(context, method);

				// check that methods are correctly called for value1
				testSingleCall(shaderCall, context[method], value1);

				context[method].calls.reset();

				// check that no methods are called due to same value opt
				shaderCall.call(value1);
				expect(context[method]).not.toHaveBeenCalled();

				context[method].calls.reset();

				// check that methods are correctly called for value2
				testSingleCall(shaderCall, context[method], value2);
			};

			it('can optimize calls to ShaderCall uniforms', function () {
				testShaderCall(context, 'uniform1f', 'float', 2.3, 5.5);
				testShaderCall(context, 'uniform1i', 'int', 5, 8);

				// arrays
				testShaderCall(context, 'uniform1iv', 'intarray', [1, 2], [3, 4]);
				testShaderCall(context, 'uniform2iv', 'ivec2', [1, 2], [3, 4]);
				testShaderCall(context, 'uniform3iv', 'ivec3', [1, 2, 3], [3, 4, 5]);
				testShaderCall(context, 'uniform4iv', 'ivec4', [1, 2, 3, 4], [3, 4, 5, 6]);

				testShaderCall(context, 'uniform1fv', 'floatarray', [1.2, 2.3], [3.4, 4.5]);
				testShaderCall(context, 'uniform2fv', 'vec2', [1.2, 2.3], [3.4, 4.5]);
				testShaderCall(context, 'uniform3fv', 'vec3', [1.2, 2.3, 3.4], [3.4, 4.5, 5.6]);
				testShaderCall(context, 'uniform4fv', 'vec4', [1.2, 2.3, 3.4, 4.5], [3.4, 4.5, 5.6, 6.7]);

				testShaderCall(context, 'uniformMatrix2fv', 'mat2',
					[1.2, 2.3, 3.4, 4.5],
					[3.4, 4.5, 5.6, 6.7]
				);
				testShaderCall(context, 'uniformMatrix3fv', 'mat3',
					[1, 2, 3, 4, 5, 6, 7, 8, 9],
					[1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1]
				);
				testShaderCall(context, 'uniformMatrix4fv', 'mat4',
					[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
					[1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 12.1, 13.1, 14.1, 15.1, 16.1]
				);
			});
		});
		describe('Build and compile shader', function () {
			var createRenderer = function () {
				return {
					context: createContext(),
					bindVertexAttribute: function () {},
					rendererRecord: new RendererRecord()
				};
			};

			var createShaderInfo = function (shaderDefinition) {
				var material = new Material('test', shaderDefinition);
				material.setTexture(Shader.DIFFUSE_MAP, new Texture());
				var renderer = createRenderer(shaderDefinition);
				return {
					meshData: new Box(),
					material: material,
					lights: [new DirectionalLight()],
					camera: new Camera(),
					renderer: renderer
				};
			};

			var updateShader = function (shaderInfo) {
				var shader = shaderInfo.material.shader;
				shader.updateProcessors(shaderInfo);
				if (shader.builder) {
					shader.builder(shader, shaderInfo);
				}
				shader.apply(shaderInfo, shaderInfo.renderer);
			};

			it('has applied the correct mappings to simple shader (simple)', function () {
				var shaderDefinition = miniShaderDefinition();
				var shaderInfo = createShaderInfo(shaderDefinition);
				updateShader(shaderInfo);

				spyOn(shaderInfo.renderer.context, 'uniform1i').and.callThrough();
				spyOn(shaderInfo.renderer.context, 'uniform1f').and.callThrough();
				spyOn(shaderInfo.renderer.context, 'uniformMatrix4fv').and.callThrough();

				var shader = shaderInfo.material.shader;

				expect(shader.attributes).toEqual(shaderDefinition.attributes);

				// all matched uniforms should equal the shader definition uniforms
				expect(shader.matchedUniforms).toContain('viewProjectionMatrix');
				expect(shader.matchedUniforms).toContain('worldMatrix');

				// textures should be zero even though material has a texture since the shader does not
				expect(shader.textureSlots.length).toEqual(0);

				// add a uniform that does not exist in shader (and should not be matched)
				shader.uniforms.doesNotExist = 1;
				shader.rebuild();
				updateShader(shaderInfo);

				expect(shader.matchedUniforms).not.toContain('doesNotExist');

				// check that the ShaderCalls have been executed
				expect(shaderInfo.renderer.context.uniform1i.calls.count()).toEqual(0);
				expect(shaderInfo.renderer.context.uniform1f.calls.count()).toEqual(0);
				expect(shaderInfo.renderer.context.uniformMatrix4fv.calls.count()).toEqual(2);

				// add a uniform that does exist in shader (and should be matched)
				shader.uniforms.doesExist = 1;
				shader.rebuild();
				updateShader(shaderInfo);

				expect(shader.matchedUniforms).toContain('doesExist');

				// check that the ShaderCalls have been executed
				expect(shaderInfo.renderer.context.uniform1i.calls.count()).toEqual(0);
				expect(shaderInfo.renderer.context.uniform1f.calls.count()).toEqual(1);
				expect(shaderInfo.renderer.context.uniform1f).toHaveBeenCalledWith({value:1}, 1);
				expect(shaderInfo.renderer.context.uniformMatrix4fv.calls.count()).toEqual(4);
			});

			it('has applied the correct mappings to complex shader (uber)', function () {
				var shaderDefinition = ShaderLib.uber;
				var shaderInfo = createShaderInfo(shaderDefinition);


				spyOn(shaderInfo.renderer.context, 'uniform1i').and.callThrough();
				spyOn(shaderInfo.renderer.context, 'uniform1f').and.callThrough();
				spyOn(shaderInfo.renderer.context, 'uniform4fv').and.callThrough();
				spyOn(shaderInfo.renderer.context, 'uniformMatrix3fv').and.callThrough();
				spyOn(shaderInfo.renderer.context, 'uniformMatrix4fv').and.callThrough();

				updateShader(shaderInfo);
				var shader = shaderInfo.material.shader;

				expect(shader.attributes).toEqual(shaderDefinition.attributes);

				// all matched uniforms should equal the shader definition uniforms
				expect(shader.matchedUniforms).toContain('viewProjectionMatrix');
				expect(shader.matchedUniforms).toContain('worldMatrix');

				// 10 sample2d slots in uber shader
				expect(shader.textureSlots.length).toEqual(10);

				// check that the ShaderCalls have been executed
				expect(shaderInfo.renderer.context.uniform1i.calls.count()).toEqual(10);
				expect(shaderInfo.renderer.context.uniform1f.calls.count()).toEqual(9);
				expect(shaderInfo.renderer.context.uniform4fv.calls.count()).toEqual(2);
				expect(shaderInfo.renderer.context.uniformMatrix3fv.calls.count()).toEqual(1);
				expect(shaderInfo.renderer.context.uniformMatrix4fv.calls.count()).toEqual(2);
			});
		});

		describe('investigateShader', function () {
			var target;

			beforeEach(function () {
				target = {
					uniforms: {},
					attributeMapping: {},
					uniformMapping: {},
					textureSlots: [],
					textureSlotsNaming: {}
				};
			});

			it('can parse a uniform declaration', function () {
				var source = 'uniform vec3 foo;';
				Shader.investigateShader(source, target);
				expect(target.uniformMapping).toEqual({
					foo: {
						format: 'vec3'
					}
				});
			});

			it('can parse an attribute declaration', function () {
				var source = 'attribute float foo;';
				Shader.investigateShader(source, target);
				expect(target.attributeMapping).toEqual({
					foo: {
						format: 'float'
					}
				});
			});

			it('can parse a texture sampler', function () {
				var source = 'uniform sampler2D tex;';
				Shader.investigateShader(source, target);
				expect(target.uniformMapping).toEqual({
					tex: {
						format: 'sampler2D'
					}
				});
				expect(target.textureSlots).toEqual([
					{
						format: 'sampler2D',
						name: 'tex',
						mapping : undefined,
						index : 0
					}
				]);
			});
		});
	});

	function createContext() {
		return {
			createShader: function (/*type*/) { return {}; },
			shaderSource: function (/*shader, source*/) {},
			compileShader: function (/*shader*/) {},
			getShaderParameter: function (/*shader, parameter*/) { return true; },
			getProgramParameter: function (/*shader, parameter*/) { return true; },
			getShaderInfoLog: function (/*shader*/) { return ''; },
			getProgramInfoLog: function (/*shader*/) { return ''; },
			createProgram: function (/*shader*/) { return {}; },
			getError: function () { return 0; },
			attachShader: function (/*program, source*/) {},
			linkProgram: function (/*program*/) {},
			useProgram: function (/*program*/) {},

			getAttribLocation: function (/*program, key*/) { return {}; },
			getUniformLocation: function (/*program, key*/) { return {}; },

			uniform1f: function (/*location, v0*/) {},
			uniform1i: function (/*location, v0*/) {},
			uniform2f: function (/*location, v0, v1*/) {},
			uniform2i: function (/*location, v0, v1*/) {},
			uniform3f: function (/*location, v0, v1, v2*/) {},
			uniform3i: function (/*location, v0, v1, v2*/) {},
			uniform4f: function (/*location, v0, v1, v2, v3*/) {},
			uniform4i: function (/*location, v0, v1, v2, v3*/) {},

			uniform1iv: function (/*location, values*/) {},
			uniform2iv: function (/*location, values*/) {},
			uniform3iv: function (/*location, values*/) {},
			uniform4iv: function (/*location, values*/) {},

			uniform1fv: function (/*location, values*/) {},
			uniform2fv: function (/*location, values*/) {},
			uniform3fv: function (/*location, values*/) {},
			uniform4fv: function (/*location, values*/) {},

			uniformMatrix2fv: function (/*location, transpose, data*/) {},
			uniformMatrix3fv: function (/*location, transpose, data*/) {},
			uniformMatrix4fv: function (/*location, transpose, data*/) {}
		};
	}

	function miniShaderDefinition(){
		return {
			attributes : {
				vertexPosition : MeshData.POSITION
			},
			uniforms : {
				viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
				worldMatrix : Shader.WORLD_MATRIX
			},
			vshader : [
			'attribute vec3 vertexPosition;',

			'uniform mat4 viewProjectionMatrix;',
			'uniform mat4 worldMatrix;',

			'uniform float doesExist;',
			'varying float test;',

			'void main(void) {',
				'gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
			'}'
			].join('\n'),
			fshader : [
			'varying float test;',
			'void main(void)',
			'{',
				'gl_FragColor = vec4(test);',
			'}'
			].join('\n')
		};
	}
})();



var SimplePartitioner = require("../../src/goo/renderer/SimplePartitioner");
var Camera = require("../../src/goo/renderer/Camera");
var BoundingSphere = require("../../src/goo/renderer/bounds/BoundingSphere");
var Vector3 = require("../../src/goo/math/Vector3");
var Entity = require("../../src/goo/entities/Entity");
var MeshRendererComponent = require("../../src/goo/entities/components/MeshRendererComponent");

describe('SimplePartitioner', function () {
	var partitioner, camera;

	beforeEach(function () {
		partitioner = new SimplePartitioner();
		camera = new Camera();
	});

	function createEntity(x, y, z) {
		var entity = new Entity();
		var mrc = new MeshRendererComponent();
		mrc.worldBound = new BoundingSphere(new Vector3(x, y, z), 1);
		entity.set(mrc);
		return entity;
	}

	describe('process', function () {
		it('can partition two entities', function () {
			var entity1 = createEntity(0, 0, 5);
			var entity2 = createEntity(0, 0, -5);
			var entities = [entity1, entity2];
			var renderList = [];

			partitioner.process(camera, entities, renderList);

			expect(renderList).toContain(entity2);
			expect(renderList.length).toEqual(1);
		});

		it('can filter with hide', function () {
			var entity = createEntity(0, 0, -5);
			var entities = [entity];
			var renderList = [];

			partitioner.process(camera, entities, renderList);

			expect(renderList).toContain(entity);

			entity.meshRendererComponent.hidden = true;
			partitioner.process(camera, entities, renderList);

			expect(renderList).not.toContain(entity);
		});

		it('cullmode never', function () {
			var entity = createEntity(0, 0, 5);
			var entities = [entity];
			var renderList = [];

			partitioner.process(camera, entities, renderList);

			expect(renderList).not.toContain(entity);

			entity.meshRendererComponent.cullMode = 'Never';
			partitioner.process(camera, entities, renderList);

			expect(renderList).toContain(entity);
		});
	});
});


var Texture = require("../../src/goo/renderer/Texture");
var CustomMatchers = require("./CustomMatchers");

describe('Texture', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	describe('create', function () {
		function testTypesAndFormats(data, defaultType, defaultFormat) {
			var settings = {};
			var texture = new Texture(data, settings, 1, 1);
			expect(texture.image).not.toBeNull();
			expect(texture.type).toEqual(defaultType);
			expect(texture.format).toEqual(defaultFormat);

			settings = {
				type: 'TestType',
				format: 'TestFormat'
			};
			texture = new Texture(data, settings, 1, 1);
			expect(texture.type).toEqual('TestType');
			expect(texture.format).toEqual('TestFormat');
		}

		it('can create without parameters', function () {
			var texture = new Texture();

			expect(texture.image).toBeNull();
		});

		it('can create with Uint8Array for various types/formats', function () {
			testTypesAndFormats(new Uint8Array(1), 'UnsignedByte', 'RGBA');
		});

		it('can create with Uint16Array for various types/formats', function () {
			testTypesAndFormats(new Uint16Array(1), 'UnsignedShort565', 'RGB');
		});

		it('can create with Float32Array for various types/formats', function () {
			testTypesAndFormats(new Float32Array(1), 'Float', 'RGBA');
		});
	});

	describe('clone', function () {
		var exclusionList = ['image', '_originalImage', 'needsUpdate', 'loadImage'];

		it('can clone a texture holding no image', function () {
			var original = new Texture();
			var clone = original.clone();

			expect(clone).toBeCloned({ value: original, excluded: exclusionList });
		});

		it('can clone a texture holding a typed array', function () {
			var original = new Texture(new Uint8Array([11, 22, 33, 44]), {}, 1, 1);
			var clone = original.clone();

			expect(clone).toBeCloned({ value: original, excluded: exclusionList });
		});

		it('can clone a texture holding an html element', function () {
			var images = [new Image()];
			var original = new Texture(images[0]);
			var clone = original.clone();

			expect(clone).toBeCloned({ value: original, excluded: exclusionList });
		});

		it('can clone a texture holding an 6 html elements', function () {
			var images = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];
			var original = new Texture(images);
			var clone = original.clone();

			expect(clone).toBeCloned({ value: original, excluded: exclusionList });
		});
	});
});


var TextureCreator = require("../../src/goo/renderer/TextureCreator");

describe('TextureCreator', function () {
	var textureCreator;
	var callbacks;

	beforeEach(function () {
		textureCreator = new TextureCreator();
		callbacks = {
			rejectCallback: function () {}
		};
		spyOn(callbacks, 'rejectCallback');
	});

	afterEach(function () {
		expect(callbacks.rejectCallback).not.toHaveBeenCalled();
	});

	describe('loadTexture2D', function () {
		it('loads a texture', function (done) {
			var prefix = window.__karma__ ? 'base/test/unit/loaders/res/' : 'loaders/res/';
			var image = prefix + 'check.png';

			textureCreator.loadTexture2D(image, null).then(function (texture) {
				expect(texture.image).toEqual(jasmine.any(Image));
				done();
			}, callbacks.rejectCallback);
		});
	});

	describe('loadTextureVideo', function () {
		it('loads a video texture', function (done) {
			var prefix = window.__karma__ ? 'base/test/unit/loaders/res/' : 'loaders/res/';
			var image = prefix + 'small.mp4';

			textureCreator.loadTextureVideo(image, {
				loop: true,
				autoPlay: false,
				texture: { dontwait: false }
			}).then(function (texture) {
				expect(texture.image).toEqual(jasmine.any(HTMLVideoElement));
				done();
			}, callbacks.rejectCallback);
		});
	});

	describe('loadTextureCube', function () {
		it('loads a texture with 6 data elements', function (done) {
			var prefix = window.__karma__ ? 'base/test/unit/loaders/res/' : 'loaders/res/';

			var images = [
				'check.png',
				'check-alt.png',
				'check.png',
				'check-alt.png',
				'check.png',
				'check-alt.png'
			].map(function (path) { return prefix + path; });

			textureCreator.loadTextureCube(images, null).then(function (texture) {
				expect(texture.image.data.length).toEqual(6);
				done();
			}, callbacks.rejectCallback);
		});
	});
});


var Vector3 = require("../../src/goo/math/Vector3");
var BoundingBox = require("../../src/goo/renderer/bounds/BoundingBox");
var BoundingSphere = require("../../src/goo/renderer/bounds/BoundingSphere");
var MeshData = require("../../src/goo/renderer/MeshData");
var Box = require("../../src/goo/shapes/Box");
var CustomMatchers = require("./CustomMatchers");

describe('BoundingBox', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	describe('containsPoint', function () {
		it('returns false for an outside point', function () {
			var boundingBox = new BoundingBox(new Vector3(10, 20, 30), 2, 2, 2);
			expect(boundingBox.containsPoint(new Vector3(31, 19, 11))).toBeFalsy();
		});

		it('returns true for a point on the edge of the bounding volume (one of the corners)', function () {
			var boundingBox = new BoundingBox(new Vector3(10, 20, 30), 2, 2, 2);
			expect(boundingBox.containsPoint(new Vector3(11, 19, 31))).toBeTruthy();
		});

		it('returns true for an inside point', function () {
			var boundingBox = new BoundingBox(new Vector3(10, 20, 30), 2, 2, 2);
			expect(boundingBox.containsPoint(new Vector3(10, 20, 30))).toBeTruthy();
		});
	});

	describe('computeFromPoints', function () {
		function buildCustomTriangle(verts) {
			var indices = [];
			indices.push(0, 1, 2);

			var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), 3, indices.length);

			meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
			meshData.getIndexBuffer().set(indices);

			meshData.indexLengths = [3];
			meshData.indexModes = ['Triangles'];

			return meshData;
		}

		it('computes the center of the bounding box from verts (of default box)', function () {
			var boundingBox1 = new BoundingBox();

			var boxMeshData = new Box();
			boundingBox1.computeFromPoints(boxMeshData.dataViews.POSITION);
			expect(boundingBox1.center).toBeCloseToVector(new Vector3(0, 0, 0));
		});

		it('computes the center of the bounding box from verts (of custom triangle)', function () {
			var boundingBox1 = new BoundingBox();
			var triangleMeshData = buildCustomTriangle([0, -5, 10, 2, 5, 20, 0, 1, 11]);
			boundingBox1.computeFromPoints(triangleMeshData.dataViews.POSITION);
			expect(boundingBox1.center).toBeCloseToVector(new Vector3(1, 0, 15));
		});

		it('computes max & min of the bounding box from verts (of default box)', function () {
			var boundingBox1 = new BoundingBox();
			var boxMeshData = new Box();
			boundingBox1.computeFromPoints(boxMeshData.dataViews.POSITION);
			expect(boundingBox1.min).toBeCloseToVector(new Vector3(-0.5, -0.5, -0.5));
			expect(boundingBox1.max).toBeCloseToVector(new Vector3(0.5, 0.5, 0.5));
		});

		it('computes max & min of the bounding box from verts (of custom triangle)', function () {
			var boundingBox1 = new BoundingBox();
			var triangleMeshData = buildCustomTriangle([0, -5, 10, 2, 5, 20, 0, 1, 11]);
			boundingBox1.computeFromPoints(triangleMeshData.dataViews.POSITION);
			expect(boundingBox1.min).toBeCloseToVector(new Vector3(0, -5, 10));
			expect(boundingBox1.max).toBeCloseToVector(new Vector3(2, 5, 20));
		});

		it('computes x/y/zExtent of the bounding box from verts (of default box)', function () {
			var boundingBox1 = new BoundingBox();
			var boxMeshData = new Box();
			boundingBox1.computeFromPoints(boxMeshData.dataViews.POSITION);
			expect(boundingBox1.xExtent).toBeCloseTo(0.5);
			expect(boundingBox1.yExtent).toBeCloseTo(0.5);
			expect(boundingBox1.zExtent).toBeCloseTo(0.5);
		});

		it('computes x/y/zExtent of the bounding box from verts (of custom triangle)', function () {
			var boundingBox1 = new BoundingBox();
			var triangleMeshData = buildCustomTriangle([0, -5, 10, 2, 5, 20, 0, 1, 11]);
			boundingBox1.computeFromPoints(triangleMeshData.dataViews.POSITION);
			expect(boundingBox1.xExtent).toBeCloseTo(1);
			expect(boundingBox1.yExtent).toBeCloseTo(5);
			expect(boundingBox1.zExtent).toBeCloseTo(5);
		});
	});

	describe('merge', function () {
		it('merges two identical overlapping boxes', function () {
			var boundingBox1 = new BoundingBox(new Vector3(0, 0, 0), 2, 3, 4);
			var boundingBox2 = new BoundingBox(new Vector3(0, 0, 0), 2, 3, 4);

			var mergedBoundingBox = boundingBox1.merge(boundingBox2);
			expect(mergedBoundingBox.center).toBeCloseToVector(new Vector3(0, 0, 0));
			expect(mergedBoundingBox.xExtent).toBeCloseTo(2);
			expect(mergedBoundingBox.yExtent).toBeCloseTo(3);
			expect(mergedBoundingBox.zExtent).toBeCloseTo(4);
		});

		it('merges two intersecting boxes', function () {
			var boundingBox1 = new BoundingBox(new Vector3(-5, -5, -5), 10, 10, 10);
			var boundingBox2 = new BoundingBox(new Vector3(10, 10, 10), 10, 10, 10);

			var mergedBoundingBox = boundingBox1.merge(boundingBox2);
			expect(mergedBoundingBox.center).toBeCloseToVector(new Vector3((-15 + 20) / 2, (-15 + 20) / 2, (-15 + 20) / 2));
			expect(mergedBoundingBox.xExtent).toBeCloseTo(35 / 2);
			expect(mergedBoundingBox.yExtent).toBeCloseTo(35 / 2);
			expect(mergedBoundingBox.zExtent).toBeCloseTo(35 / 2);
		});

		it('merges two nonintersecting boxes', function () {
			var boundingBox1 = new BoundingBox(new Vector3(-10, -10, -10), 5, 5, 5);
			var boundingBox2 = new BoundingBox(new Vector3(20, 20, 20), 10, 10, 10);

			var mergedBoundingBox = boundingBox1.merge(boundingBox2);
			expect(mergedBoundingBox.center).toBeCloseToVector(new Vector3((-15 + 30) / 2, (-15 + 30) / 2, (-15 + 30) / 2));
			expect(mergedBoundingBox.xExtent).toBeCloseTo(45 / 2);
			expect(mergedBoundingBox.yExtent).toBeCloseTo(45 / 2);
			expect(mergedBoundingBox.zExtent).toBeCloseTo(45 / 2);
		});
	});

	describe('intersects', function () {
		it('intersects a bounding box', function () {
			var boundingBox1 = new BoundingBox(new Vector3(0, 0, 0), 10, 10, 10);
			var boundingBox2 = new BoundingBox(new Vector3(20, 20, 20), 11, 11, 11);

			expect(boundingBox1.intersects(boundingBox2)).toBeTruthy();
		});

		it('does not intersect a bounding box', function () {
			var boundingBox1 = new BoundingBox(new Vector3(0, 0, 0), 10, 10, 10);
			var boundingBox2 = new BoundingBox(new Vector3(20, 20, 20), 9, 11, 11);

			expect(boundingBox1.intersects(boundingBox2)).toBeFalsy();
		});

		it('intersects a bounding sphere', function () {
			var boundingBox = new BoundingBox(new Vector3(0, 0, 0), 10, 10, 10);
			var boundingSphere = new BoundingSphere(new Vector3(20, 20, 0), 15);

			expect(boundingBox.intersects(boundingSphere)).toBeTruthy();
		});

		it('does not intersect a bounding sphere', function () {
			var boundingBox = new BoundingBox(new Vector3(0, 0, 0), 10, 10, 10);
			var boundingSphere = new BoundingSphere(new Vector3(20, 20, 0), 12);
			// the distance between bounding box and the bounding sphere should be 12 - sqrt(10*10*2) < 0

			expect(boundingBox.intersects(boundingSphere)).toBeFalsy();
		});
	});

	describe('copy', function () {
		it('can copy everything from another bounding box', function () {
			var original = new BoundingBox(new Vector3(1, 2, 3), 123, 234, 345);
			var copy = new BoundingBox();
			copy.copy(original);

			expect(copy).toBeCloned(original);
		});
	});

	describe('clone', function () {
		it('clones a bounding box', function () {
			var original = new BoundingBox(new Vector3(1, 2, 3), 123, 234, 345);
			var clone = original.clone();

			expect(clone).toBeCloned(original);
		});
	});
});


var Vector3 = require("../../src/goo/math/Vector3");
var BoundingSphere = require("../../src/goo/renderer/bounds/BoundingSphere");
var BoundingBox = require("../../src/goo/renderer/bounds/BoundingBox");
var CustomMatchers = require("./CustomMatchers");

describe('BoundingSphere', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	describe('containsPoint', function () {
		it('returns false for an outside point', function () {
			var boundingSphere = new BoundingSphere(new Vector3(10, 20, 30), 2);
			expect(boundingSphere.containsPoint(new Vector3(31, 19, 11))).toBeFalsy();
		});

		it('returns true for a point on the edge', function () {
			var boundingSphere = new BoundingSphere(new Vector3(10, 20, 30), 2);
			expect(boundingSphere.containsPoint(new Vector3(12, 20, 30))).toBeTruthy();
		});

		it('returns true for an inside point', function () {
			var boundingSphere = new BoundingSphere(new Vector3(10, 20, 30), 2);
			expect(boundingSphere.containsPoint(new Vector3(10, 20, 30))).toBeTruthy();
		});
	});

	describe('merge', function () {
		it('merges two identical overlapping spheres', function () {
			var boundingSphere1 = new BoundingSphere(new Vector3(3, 2, 1), 5);
			var boundingSphere2 = new BoundingSphere(new Vector3(3, 2, 1), 2);

			var mergedBoundingSphere = boundingSphere1.merge(boundingSphere2);
			expect(mergedBoundingSphere.center).toBeCloseToVector(new Vector3(3, 2, 1));
			expect(mergedBoundingSphere.radius).toBeCloseTo(5);
		});

		it('merges two intersecting spheres', function () {
			var boundingSphere1 = new BoundingSphere(new Vector3(-20, 0, 0), 4);
			var boundingSphere2 = new BoundingSphere(new Vector3( 10, 0, 0), 8);

			var mergedBoundingSphere = boundingSphere1.merge(boundingSphere2);
			expect(mergedBoundingSphere.center).toBeCloseToVector(new Vector3((-20 - 4 + 10 + 8) / 2, 0, 0));
			expect(mergedBoundingSphere.radius).toBeCloseTo((10 + 8 - (-20 - 4)) / 2);
		});
	});

	describe('intersects', function () {
		it('intersects a bounding box', function () {
			var boundingSphere = new BoundingSphere(new Vector3(20, 20, 0), 15);
			var boundingBox = new BoundingBox(new Vector3(0, 0, 0), 10, 10, 10);

			expect(boundingSphere.intersects(boundingBox)).toBeTruthy();
		});

		it('does not intersect a bounding box', function () {
			var boundingSphere = new BoundingSphere(new Vector3(20, 20, 0), 12);
			var boundingBox = new BoundingBox(new Vector3(0, 0, 0), 10, 10, 10);
			// the distance between bounding box and the bounding sphere should be 12 - sqrt(10*10*2) < 0

			expect(boundingSphere.intersects(boundingBox)).toBeFalsy();
		});

		it('intersects a bounding sphere', function () {
			var boundingSphere1 = new BoundingSphere(new Vector3(2 * 1, 3 * 1, 6 * 1), 7);
			var boundingSphere2 = new BoundingSphere(new Vector3(2 * 3, 3 * 3, 6 * 3), 7);

			expect(boundingSphere1.intersects(boundingSphere2)).toBeTruthy();
		});

		it('does not intersect a bounding sphere', function () {
			var boundingSphere1 = new BoundingSphere(new Vector3(2 * 1, 3 * 1, 6 * 1), 6);
			var boundingSphere2 = new BoundingSphere(new Vector3(2 * 3, 3 * 3, 6 * 3), 7);

			expect(boundingSphere1.intersects(boundingSphere2)).toBeFalsy();
		});
	});

	describe('copy', function () {
		it('can copy everything from another bounding sphere', function () {
			var original = new BoundingSphere(new Vector3(1, 2, 3), 123);
			var copy = new BoundingSphere();
			copy.copy(original);

			expect(copy).toBeCloned(original);
		});
	});

	describe('clone', function () {
		it('clones a bounding sphere', function () {
			var original = new BoundingSphere(new Vector3(1, 2, 3), 123);
			var clone = original.clone();

			expect(clone).toBeCloned(original);
		});
	});
});


var Vector3 = require("../../src/goo/math/Vector3");
var BoundingVolume = require("../../src/goo/renderer/bounds/BoundingVolume");
var CustomMatchers = require("./CustomMatchers");

describe('BoundingVolume', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	describe('copy', function () {
		it('can copy everything from another bounding box', function () {
			var original = new BoundingVolume(new Vector3(1, 2, 3), 123, 234, 345);
			var copy = new BoundingVolume();
			copy.copy(original);

			expect(copy).toBeCloned(original);
		});
	});
});


var Vector3 = require("../../src/goo/math/Vector3");
var DirectionalLight = require("../../src/goo/renderer/light/DirectionalLight");
var CustomMatchers = require("./CustomMatchers");

describe('DirectionalLight', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	it('gets the color from the first parameter passed to the constructor', function () {
		var color = new Vector3(0.2, 0.3, 0.5);
		var light = new DirectionalLight(color);

		expect(light.color).toBeCloseToVector(color);
		expect(light.color).not.toBe(color);
	});

	describe('copy', function () {
		it('can copy everything from another point light', function () {
			var original = new DirectionalLight(new Vector3(11, 22, 33));
			var copy = new DirectionalLight(new Vector3(44, 55, 66));
			copy.copy(original);

			expect(copy).toBeCloned(original);
		});
	});

	describe('clone', function () {
		it('can clone a point light', function () {
			var original = new DirectionalLight(new Vector3(11, 22, 33));
			var clone = original.clone();

			expect(clone).toBeCloned(original);
		});
	});
});


var Vector3 = require("../../src/goo/math/Vector3");
var Light = require("../../src/goo/renderer/light/Light");
var CustomMatchers = require("./CustomMatchers");

describe('Light', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	it('defaults the color to (1, 1, 1)', function () {
		var defaultColor = new Vector3(1, 1, 1);
		var light = new Light();

		expect(light.color).toBeCloseToVector(defaultColor);
	});

	it('gets the color from the first parameter passed to the constructor', function () {
		var color = new Vector3(0.2, 0.3, 0.5);
		var light = new Light(color);

		expect(light.color).toBeCloseToVector(color);
		expect(light.color).not.toBe(color);
	});
});


var Vector3 = require("../../src/goo/math/Vector3");
var PointLight = require("../../src/goo/renderer/light/PointLight");
var CustomMatchers = require("./CustomMatchers");

describe('PointLight', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	it('gets the color from the first parameter passed to the constructor', function () {
		var color = new Vector3(0.2, 0.3, 0.5);
		var light = new PointLight(color);

		expect(light.color).toBeCloseToVector(color);
		expect(light.color).not.toBe(color);
	});

	describe('copy', function () {
		it('can copy everything from another point light', function () {
			var original = new PointLight(new Vector3(11, 22, 33));
			var copy = new PointLight(new Vector3(44, 55, 66));
			copy.copy(original);

			expect(copy).toBeCloned(original);
		});
	});

	describe('clone', function () {
		it('can clone a point light', function () {
			var original = new PointLight(new Vector3(11, 22, 33));
			var clone = original.clone();

			expect(clone).toBeCloned(original);
		});
	});
});


var Vector3 = require("../../src/goo/math/Vector3");
var SpotLight = require("../../src/goo/renderer/light/SpotLight");
var CustomMatchers = require("./CustomMatchers");

describe('SpotLight', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	it('gets the color from the first parameter passed to the constructor', function () {
		var color = new Vector3(0.2, 0.3, 0.5);
		var light = new SpotLight(color);

		expect(light.color).toBeCloseToVector(color);
		expect(light.color).not.toBe(color);
	});

	describe('copy', function () {
		it('can copy everything from another point light', function () {
			var original = new SpotLight(new Vector3(11, 22, 33));
			var copy = new SpotLight(new Vector3(44, 55, 66));
			copy.copy(original);

			expect(copy).toBeCloned(original);
		});
	});

	describe('clone', function () {
		it('can clone a point light', function () {
			var original = new SpotLight(new Vector3(11, 22, 33));
			var clone = original.clone();

			expect(clone).toBeCloned(original);
		});
	});
});




































var GroundBoundMovementScript = require("../../src/goo/scriptpack/GroundBoundMovementScript");
var MovementSystem = require("../../src/goo/entities/systems/MovementSystem");
var MovementComponent = require("../../src/goo/entities/components/MovementComponent");
var TransformComponent = require("../../src/goo/entities/components/TransformComponent");

xdescribe('Movement script tests', function () {
	var movementSystem = new MovementSystem();
	var groundBoundMovementScript;
	var entity;

	function getHeight() {
		return 0;
	}

	var mockGround = {
		getTerrainHeightAt: getHeight,
		getTerrainNormalAt: function () { return { data: [0, 1, 0] }; }
	};

	var setEntityTranformData = function (entity, data) {
		entity.transformComponent.transform.translation.data = data;
	};

	beforeEach(function () {
		groundBoundMovementScript = new GroundBoundMovementScript();
		entity = {
			transformComponent: new TransformComponent(),
			movementComponent: new MovementComponent(),
			_world: { tpf: 0.1 }
		};
		setEntityTranformData(entity, [0, 0, 0]);

		groundBoundMovementScript.gravity = -2;
		groundBoundMovementScript.jumpImpulse = 4;
		groundBoundMovementScript.accLerp = 0.1;
		groundBoundMovementScript.rotLerp = 0.1;
	});

	it('finds ground contact when below ground', function () {
		setEntityTranformData(entity, [0, -1, 0]);
		groundBoundMovementScript.setTerrainSystem(mockGround);
		groundBoundMovementScript.run(entity);
		expect(entity.transformComponent.transform.translation.data[1]).toEqual(0);
	});

	it('finds velocity curvature after jump to match', function () {
		setEntityTranformData(entity, [0, -1, 0]);
		groundBoundMovementScript.setTerrainSystem(mockGround);

		expect(entity.movementComponent.getVelocity()[1]).toBeCloseTo(0);

		groundBoundMovementScript.run(entity);
		movementSystem.applyMovementToEntity(entity);

		expect(entity.movementComponent.getVelocity()[1]).toBeCloseTo(0);

		expect(entity.transformComponent.transform.translation.data[1]).toEqual(0);

		groundBoundMovementScript.applyJump(1);

		groundBoundMovementScript.run(entity);
		movementSystem.applyMovementToEntity(entity);

		expect(entity.movementComponent.getVelocity()[1]).toBeCloseTo(4);
		expect(entity.transformComponent.transform.translation.data[1]).toBeCloseTo(0.4);

		groundBoundMovementScript.run(entity);
		movementSystem.applyMovementToEntity(entity);

		expect(entity.movementComponent.getVelocity()[1]).toBeCloseTo(2);
		expect(entity.transformComponent.transform.translation.data[1]).toBeCloseTo(0.6);

		groundBoundMovementScript.run(entity);
		movementSystem.applyMovementToEntity(entity);

		expect(entity.movementComponent.getVelocity()[1]).toBeCloseTo(0);
		expect(entity.transformComponent.transform.translation.data[1]).toBeCloseTo(0.6);

		groundBoundMovementScript.run(entity);
		movementSystem.applyMovementToEntity(entity);

		expect(entity.movementComponent.getVelocity()[1]).toBeCloseTo(-2);
		expect(entity.transformComponent.transform.translation.data[1]).toBeCloseTo(0.4);

		groundBoundMovementScript.run(entity);
		movementSystem.applyMovementToEntity(entity);

		expect(entity.movementComponent.getVelocity()[1]).toBeCloseTo(-4);
		expect(entity.transformComponent.transform.translation.data[1]).toBeCloseTo(0);

		groundBoundMovementScript.run(entity);
		movementSystem.applyMovementToEntity(entity);

		expect(entity.movementComponent.getVelocity()[1]).toEqual(-6);
		expect(entity.transformComponent.transform.translation.data[1]).toBeCloseTo(-0.6);

		groundBoundMovementScript.run(entity);
		movementSystem.applyMovementToEntity(entity);

		expect(entity.movementComponent.getVelocity()[1]).toBeCloseTo(0);
		expect(entity.transformComponent.transform.translation.data[1]).toEqual(0);

		groundBoundMovementScript.run(entity);
		movementSystem.applyMovementToEntity(entity);

		expect(entity.movementComponent.getVelocity()[1]).toBeCloseTo(0);
		expect(entity.transformComponent.transform.translation.data[1]).toEqual(0);
	});
});


var HeightMapBoundingScript = require("../../src/goo/scriptpack/HeightMapBoundingScript");

describe('Build a basic heightmap and check basic points', function () {
	var heightMatrix = [[0, 0, 0, 0], [0, 0.5, 0.5, 0], [0.5, 1, 1, 0.5], [1, 1, 1, 1]];
	var heightMapScript = new HeightMapBoundingScript(heightMatrix);

	it('finds values on the heightMap', function () {
		var height = heightMapScript.getAt(0, 0);
		expect(height).toEqual(0);
		height = heightMapScript.getAt(0, 1);
		expect(height).toEqual(0);
		height = heightMapScript.getAt(1, 1);
		expect(height).toEqual(0.5);
		height = heightMapScript.getAt(1, 0);
		expect(height).toEqual(0);

		height = heightMapScript.getInterpolated(0.5, 0.5);
		expect(height).toEqual(0.125);
		height = heightMapScript.getInterpolated(0.25, 0.75);
		expect(height).toEqual(0.09375);
		height = heightMapScript.getInterpolated(1.5, 1);
		expect(height).toEqual(0.75);
		height = heightMapScript.getInterpolated(2.5, 1);
		expect(height).toEqual(1);
	});

	it('finds zero outside the heightMap', function () {
		var height = heightMapScript.getAt(-1, 0);
		expect(height).toEqual(0);
		height = heightMapScript.getAt(0, 5);
		expect(height).toEqual(0);
		height = heightMapScript.getAt(5, 0);
		expect(height).toEqual(0);
	});
});


var ScriptUtils = require("../../src/goo/scripts/ScriptUtils");

describe('ScriptUtils', function () {
	it('defaults missing keys', function () {
		var parametersDefinition = [{
			key: 'a',
			type: 'int',
			'default': 123
		}, {
			key: 'b',
			type: 'string',
			'default': 'asd'
		}];

		var parametersValues = {};

		ScriptUtils.fillDefaultValues(parametersValues, parametersDefinition);

		var expected = {
			'a': 123,
			'b': 'asd'
		};

		expect(parametersValues).toEqual(expected);
	});

	it('defaults the defaults for all types', function () {
		var parametersDefinition = [{
			key: 'a',
			type: 'int'
		}, {
			key: 'b',
			type: 'float'
		}, {
			key: 'c',
			type: 'string'
		}, {
			key: 'd',
			type: 'vec3'
		}, {
			key: 'e',
			type: 'boolean'
		}, {
			key: 'f',
			type: 'texture'
		}, {
			key: 'g',
			type: 'entity'
		}];

		var parametersValues = {};

		ScriptUtils.fillDefaultValues(parametersValues, parametersDefinition);

		var expected = {
			'a': 0,
			'b': 0,
			'c': '',
			'd': [0, 0, 0],
			'e': false,
			'f': null,
			'g': null
		};

		expect(parametersValues).toEqual(expected);
	});
});

var WorldFittedTerrainScript = require("../../src/goo/scriptpack/WorldFittedTerrainScript");
var Vector3 = require("../../src/goo/math/Vector3");

xdescribe('WorldFittedTerrainScript', function () {
	describe('Uses default dimensions', function () {
		var terrainScript;
		var heightAtPos;

		beforeEach(function () {
			heightAtPos = undefined;
			terrainScript = new WorldFittedTerrainScript();
		});

		var heightMatrix = [[0, 0, 0, 0], [0, 0.5, 0.5, 0], [0.5, 1, 1, 0.5], [1, 1, 1, 1]];

		it('adds bad heightmap and gets exception', function () {
			var terrainScript = new WorldFittedTerrainScript();
			expect(function () { terrainScript.addHeightData(); }).toThrow();
		});

		it('finds the registered heightMatrix', function () {
			var heightData;
			terrainScript.addHeightData(heightMatrix);
			heightData = terrainScript.getHeightDataForPosition(new Vector3(1, 1, 1));
			expect(heightData.script.getMatrixData()).toBe(heightMatrix);
		});

		it('looks for positions on a default dimensions heightMatrix', function () {
			terrainScript.addHeightData(heightMatrix);
			heightAtPos = terrainScript.getTerrainHeightAt(new Vector3(1, 1, 1));
			expect(heightAtPos).toEqual(0);
			heightAtPos = terrainScript.getTerrainHeightAt(new Vector3(99.99, 49, 99.99));
			expect(heightAtPos).toBeCloseTo(49.9924);
		});

		it('looks outside default dimensions', function () {
			terrainScript.addHeightData(heightMatrix);
			heightAtPos = terrainScript.getTerrainHeightAt(new Vector3(-1, 0, 0));
			expect(heightAtPos).toEqual(null);
			heightAtPos = terrainScript.getTerrainHeightAt(new Vector3(100, 50, 101));
			expect(heightAtPos).toEqual(null);
		});
	});

	describe('Uses custom dimensions', function () {
		var terrainScript;
		var heightAtPos;

		beforeEach(function () {
			heightAtPos = undefined;
			terrainScript = new WorldFittedTerrainScript();
		});

		var heightMatrix = [[0, 0, 0, 0], [0, 0.5, 0.5, 0], [0.5, 1, 1, 0.5], [1, 1, 1, 1]];

		it('verifies axis displacement', function () {
			var displacedAxis = terrainScript.displaceAxisDimensions(0, 0, 1, 2);
			expect(displacedAxis).toEqual(0);

			var displacedAxis = terrainScript.displaceAxisDimensions(1, 0, 1, 2);
			expect(displacedAxis).toEqual(2);

			var displacedAxis = terrainScript.displaceAxisDimensions(1, 0, 10, 2);
			expect(displacedAxis).toEqual(0.2);

			var displacedAxis = terrainScript.displaceAxisDimensions(10, 10, 20, 2);
			expect(displacedAxis).toEqual(0);

			var displacedAxis = terrainScript.displaceAxisDimensions(20, 10, 20, 2);
			expect(displacedAxis).toEqual(2);
		});

		it('verifies return axis to world dimensions', function () {
			var displacedAxis = terrainScript.returnToWorldDimensions(0, 0, 1, 2);
			expect(displacedAxis).toEqual(0);

			var displacedAxis = terrainScript.returnToWorldDimensions(0, 30, 45, 5);
			expect(displacedAxis).toEqual(30);

			var displacedAxis = terrainScript.returnToWorldDimensions(5, 30, 45, 5);
			expect(displacedAxis).toEqual(45);

			var displacedAxis = terrainScript.returnToWorldDimensions(0.5, 0, 10, 1);
			expect(displacedAxis).toEqual(5);

			var displacedAxis = terrainScript.returnToWorldDimensions(0.2, 1, 11, 2);
			expect(displacedAxis).toEqual(2);

			var displacedAxis = terrainScript.returnToWorldDimensions(0, 10, 20, 2);
			expect(displacedAxis).toEqual(10);

			var displacedAxis = terrainScript.returnToWorldDimensions(2, 10, 20, 2);
			expect(displacedAxis).toEqual(20);
		});

		it('looks for positions on positive displaced heightMatrix', function () {
			var dimensions = {
				minX: 100,
				maxX: 200,
				minY: 50,
				maxY: 100,
				minZ: 100,
				maxZ: 200
			};
			terrainScript.addHeightData(heightMatrix, dimensions);
			heightAtPos = terrainScript.getTerrainHeightAt([100, 50, 100]);
			expect(heightAtPos).toEqual(dimensions.minY);
			heightAtPos = terrainScript.getTerrainHeightAt([200, 100, 200]);
			expect(heightAtPos).toEqual(dimensions.maxY);
			heightAtPos = terrainScript.getTerrainHeightAt([150, 100, 150]);
			expect(heightAtPos).toBeCloseTo(87.5);
		});

		it('looks for positions on negative displaced heightMatrix', function () {
			var dimensions = {
				minX: -300,
				maxX: -200,
				minY: -150,
				maxY: -100,
				minZ: -300,
				maxZ: -200
			};
			terrainScript.addHeightData(heightMatrix, dimensions);
			heightAtPos = terrainScript.getTerrainHeightAt([-200, -150, -200]);
			expect(heightAtPos).toEqual(dimensions.maxY);
			heightAtPos = terrainScript.getTerrainHeightAt([-300, -150, -300]);
			expect(heightAtPos).toEqual(dimensions.minY);
			heightAtPos = terrainScript.getTerrainHeightAt([-225, -150, -200]);
			expect(heightAtPos).toBeCloseTo(dimensions.minY + 0.5 * (dimensions.maxY - dimensions.minY));
		});
	});
});


var Box = require("../../src/goo/shapes/Box");

describe('Box', function () {
	var a = new Box();

	it('Number of vertices and indices', function () {
		expect(a.vertexCount).toEqual(24);
		expect(a.indexCount).toEqual(36);
	});
});


var Cone = require("../../src/goo/shapes/Cone");

describe('Cone', function () {
	var a = new Cone(8, 1, 1);

	it('Number of vertices and indices', function () {
		expect(a.vertexCount).toEqual(33);
		expect(a.indexCount).toEqual(48);
	});
});


var Cylinder = require("../../src/goo/shapes/Cylinder");

describe('Cylinder', function () {
	var a = new Cylinder();

	it('Number of vertices and indices', function () {
		expect(a.vertexCount).toEqual(8 * 4 + 2 + 2);
		expect(a.indexCount).toEqual(8 * 6 * 2);
	});
});


var Disk = require("../../src/goo/shapes/Disk");

describe('Disk', function () {
	var a = new Disk(8, 1);

	it('Number of vertices and indices', function () {
		expect(a.vertexCount).toEqual(9);
		expect(a.indexCount).toEqual(8 * 3);
	});
});




var Quad = require("../../src/goo/shapes/Quad");

describe('Quad', function () {
	var a = new Quad();

	it('Number of vertices and indices', function () {
		expect(a.vertexCount).toEqual(4);
		expect(a.indexCount).toEqual(6);
	});
});




var Sphere = require("../../src/goo/shapes/Sphere");

describe('Sphere', function () {
	var a = new Sphere(8, 4);

	it('Number of vertices and indices', function () {
		expect(a.vertexCount).toEqual(37);
		expect(a.indexCount).toEqual(168);
	});
});




var Torus = require("../../src/goo/shapes/Torus");

describe('Torus', function () {
	var a = new Torus(8, 4);

	it('Number of vertices and indices', function () {
		expect(a.vertexCount).toEqual(45);
		expect(a.indexCount).toEqual(192);
	});
});


var EventChannel = require("../../src/goo/timelinepack/EventChannel");

describe('EventChannel', function () {
	var channel;
	beforeEach(function () {
		channel = new EventChannel();
	});

	describe('addCallback', function () {
		it('can insert an entry in a 0 entry channel', function () {
			channel.addCallback('id', 10);

			expect(channel.keyframes.length).toBe(1);
			expect(channel.keyframes[0].time).toBe(10);
		});

		it('can insert an entry before any other entry', function () {
			// setup
			channel.addCallback('id1', 100)
				.addCallback('id2', 200)
				.addCallback('id3', 300)
				.addCallback('id4', 400);

			// inserting an entry before any existing entries
			channel.addCallback('id5', 10);

			expect(channel.keyframes.length).toEqual(5);
			expect(channel.keyframes[0].time).toEqual(10);
		});

		it('can insert an entry after any other entry', function () {
			// setup
			channel.addCallback('id1', 100)
				.addCallback('id2', 200)
				.addCallback('id3', 300)
				.addCallback('id4', 400);

			// inserting an entry before any existing entries
			channel.addCallback('id5', 500);

			expect(channel.keyframes.length).toEqual(5);
			expect(channel.keyframes[4].time).toEqual(500);
		});

		it('can insert an entry and maintain the set of entries sorted', function () {
			// setup
			channel.addCallback('', 100)
				.addCallback('', 200)
				.addCallback('', 300)
				.addCallback('', 400);

			// inserting an entry before any existing entries
			channel.addCallback('', 250);

			expect(channel.keyframes.length).toEqual(5);
			expect(channel.keyframes[2].time).toEqual(250);
		});
	});

	describe('update', function () {
		it('will not trigger an event that is scheduled at position 0 when jumping form position 0 to 0', function () {
			var data = 0;
			channel.addCallback('id', 0, function () { data += 123; });
			channel.update(0);

			expect(data).toEqual(0);
		});

		it('will trigger an event that is scheduled at position 0 when jumping form position 0 to 1', function () {
			var data = 0;
			channel.addCallback('id', 0, function () { data += 123; });
			channel.update(1);

			expect(data).toEqual(123);
		});

		it('will trigger all events scheduled between last position and new position', function () {
			var data0 = 0;
			var data1 = 0;

			channel.addCallback('id0', 1, function () { data0 += 123; })
				.addCallback('id1', 2, function () { data1 += 234; });

			channel.setTime(0)
				.update(3);

			expect(data0).toEqual(123);
			expect(data1).toEqual(234);
		});

		it('will only trigger events scheduled between last position and new position', function () {
			var data0 = 0;
			var data1 = 0;
			var data2 = 0;
			var data3 = 0;

			channel.addCallback('id0', 1, function () { data0 += 123; })
				.addCallback('id1', 2, function () { data1 += 234; })
				.addCallback('id2', 3, function () { data2 += 345; })
				.addCallback('id3', 4, function () { data3 += 456; });

			channel.setTime(1.5)
				.update(3.5);

			expect(data0).toEqual(0);
			expect(data1).toEqual(234);
			expect(data2).toEqual(345);
			expect(data3).toEqual(0);
		});

		it('will trigger all events as it loops', function () {
			var data0 = 0;
			var data1 = 0;

			channel.addCallback('id0', 1, function () { data0 += 123; })
				.addCallback('id1', 4, function () { data1 += 234; });

			channel.setTime(3)
				.update(2);

			expect(data0).toEqual(123);
			expect(data1).toEqual(234);
		});

		it('will trigger only events starting from the last position and until the current position as it loops', function () {
			var data0 = 0;
			var data1 = 0;
			var data2 = 0;
			var data3 = 0;

			channel.addCallback('id0', 1, function () { data0 += 123; })
				.addCallback('id1', 2, function () { data1 += 234; })
				.addCallback('id2', 3, function () { data2 += 345; })
				.addCallback('id3', 4, function () { data3 += 456; });

			channel.setTime(3.5)
				.update(1.5);

			expect(data0).toEqual(123);
			expect(data1).toEqual(0);
			expect(data2).toEqual(0);
			expect(data3).toEqual(456);
		});

		it('will not do anything but return itself when called on a disabled channel', function () {
			channel.enabled = false;

			var data0 = 0;
			channel.addCallback('id0', 1, function () { data0 += 123; });

			expect(channel.update(1.5)).toBe(channel);
			expect(data0).toEqual(0);
		});

		it('will not do anything but return itself when called on an empty channel', function () {
			expect(channel.update(1.5)).toBe(channel);
		});
	});

	describe('setTime', function () {
		it('will not do anything but return itself when called on a disabled channel', function () {
			channel.enabled = false;
			channel.addCallback('id0', 1, function () {});
			expect(channel.setTime(1.5)).toBe(channel);
		});

		it('will not do anything but return itself when called on an empty channel', function () {
			expect(channel.setTime(1.5)).toBe(channel);
		});
	});

	describe('sort', function () {
		it('sorts the keyframes', function () {
			channel.addCallback('id0', 1, function () {})
				.addCallback('id1', 2, function () {})
				.addCallback('id2', 3, function () {})
				.addCallback('id3', 4, function () {});

			channel.keyframes[0].time = 5;
			channel.keyframes[2].time = 0;
			channel.sort();

			expect(channel.keyframes.length).toEqual(4);
			expect(channel.keyframes.every(function (keyframe, index) {
				return keyframe.time <= channel.keyframes[Math.min(channel.keyframes.length - 1, index)].time;
			})).toBeTruthy();
		});
	});
});

var TimelineComponent = require("../../src/goo/timelinepack/TimelineComponent");

describe('TimelineComponent', function () {
	var timelineComponent;
	beforeEach(function () {
		timelineComponent = new TimelineComponent();
		timelineComponent.duration = 1000;
	});

	function getPhonyChannel(callback, id, value) {
		return {
			update: callback,
			setTime: callback,
			id: id,
			value: value,
			keyframes: [1, 2, 3]
		};
	}

	describe('update', function () {
		it('updates all channels', function () {
			var spy0 = jasmine.createSpy('spy0');
			var spy1 = jasmine.createSpy('spy1');

			timelineComponent.addChannel(getPhonyChannel(spy0));
			timelineComponent.addChannel(getPhonyChannel(spy1));

			timelineComponent.update(123);

			expect(spy0.calls.count()).toEqual(1);
			expect(spy1.calls.count()).toEqual(1);

			expect(spy0).toHaveBeenCalledWith(123);
			expect(spy1).toHaveBeenCalledWith(123);
		});

		it('stops at the end if looping is disabled', function () {
			var spy0 = jasmine.createSpy('spy0');
			var spy1 = jasmine.createSpy('spy1');

			timelineComponent.addChannel(getPhonyChannel(spy0));
			timelineComponent.addChannel(getPhonyChannel(spy1));

			timelineComponent.update(123);
			timelineComponent.update(987);

			expect(spy0.calls.count()).toEqual(2);
			expect(spy1.calls.count()).toEqual(2);

			expect(spy0).toHaveBeenCalledWith(1000);
			expect(spy1).toHaveBeenCalledWith(1000);
		});

		it('loops over', function () {
			var spy0 = jasmine.createSpy('spy0');
			var spy1 = jasmine.createSpy('spy1');

			timelineComponent.loop = true;
			timelineComponent.addChannel(getPhonyChannel(spy0));
			timelineComponent.addChannel(getPhonyChannel(spy1));

			timelineComponent.update(123);
			timelineComponent.update(987);

			expect(spy0.calls.count()).toEqual(2);
			expect(spy1.calls.count()).toEqual(2);

			expect(spy0).toHaveBeenCalledWith((123 + 987) % 1000);
			expect(spy1).toHaveBeenCalledWith((123 + 987) % 1000);
		});

		it('does nothing if called twice with the same time', function () {
			var spy0 = jasmine.createSpy('spy0');
			var spy1 = jasmine.createSpy('spy1');

			timelineComponent.addChannel(getPhonyChannel(spy0));
			timelineComponent.addChannel(getPhonyChannel(spy1));

			timelineComponent.update(123);
			timelineComponent.update(0);

			expect(spy0.calls.count()).toEqual(1);
			expect(spy1.calls.count()).toEqual(1);
		});
	});

	describe('setTime', function () {
		it('sets the time on all channels', function () {
			var spy0 = jasmine.createSpy('spy0');
			var spy1 = jasmine.createSpy('spy1');

			timelineComponent.addChannel(getPhonyChannel(spy0));
			timelineComponent.addChannel(getPhonyChannel(spy1));

			timelineComponent.setTime(123);

			expect(spy0.calls.count()).toEqual(1);
			expect(spy1.calls.count()).toEqual(1);

			expect(spy0).toHaveBeenCalledWith(123);
			expect(spy1).toHaveBeenCalledWith(123);
		});
	});

	describe('getValues', function () {
		it('gets the time on all channels', function () {
			timelineComponent.addChannel(getPhonyChannel(null, 'id0', 123));
			timelineComponent.addChannel(getPhonyChannel(null, 'id1', 456));

			expect(timelineComponent.getValues()).toEqual({ id0: 123, id1: 456 });
		});
	});
});


var World = require("../../src/goo/entities/World");
var DynamicLoader = require("../../src/goo/loaders/DynamicLoader");
var TimelineComponent = require("../../src/goo/timelinepack/TimelineComponent");
var Configs = require("./loaders/Configs");

require("../../src/goo/timelinepack/TimelineComponentHandler");

describe('TimelineComponentHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads an entity with a timeline component', function (done) {
		var config = Configs.entity(['timeline']);
		loader.preload(Configs.get());

		loader.load(config.id).then(function (entity) {
			expect(entity.timelineComponent).toEqual(jasmine.any(TimelineComponent));

			//
			expect(entity.timelineComponent.channels.length).toEqual(2);
			expect(entity.timelineComponent.channels[0].keyframes.length).toEqual(3);
			expect(entity.timelineComponent.channels[1].keyframes.length).toEqual(2);

			done();
		});
	});
});


var ValueChannel = require("../../src/goo/timelinepack/ValueChannel");
var TransformComponent = require("../../src/goo/entities/components/TransformComponent");
var MathUtils = require("../../src/goo/math/MathUtils");
var Matrix3 = require("../../src/goo/math/Matrix3");
var Entity = require("../../src/goo/entities/Entity");
var CustomMatchers = require("./CustomMatchers");

describe('ValueChannel', function () {
	var channel;
	beforeEach(function () {
		channel = new ValueChannel();
		jasmine.addMatchers(CustomMatchers);
	});

	describe('addKeyframe', function () {
		it('can insert an entry in a 0 entry channel', function () {
			channel.addKeyframe('', 10);

			expect(channel.keyframes.length).toEqual(1);
			expect(channel.keyframes[0].time).toEqual(10);
		});

		it('can insert an entry before any other entry', function () {
			// setup
			channel.addKeyframe('', 100)
				.addKeyframe('', 200)
				.addKeyframe('', 300)
				.addKeyframe('', 400);

			// inserting an entry before any existing entries
			channel.addKeyframe('', 10);

			expect(channel.keyframes.length).toEqual(5);
			expect(channel.keyframes[0].time).toEqual(10);
		});

		it('can insert an entry after any other entry', function () {
			// setup
			channel.addKeyframe('', 100)
				.addKeyframe('', 200)
				.addKeyframe('', 300)
				.addKeyframe('', 400);

			// inserting an entry before any existing entries
			channel.addKeyframe('', 500);

			expect(channel.keyframes.length).toEqual(5);
			expect(channel.keyframes[4].time).toEqual(500);
		});

		it('can insert an entry and maintain the set of entries sorted', function () {
			// setup
			channel.addKeyframe('', 100)
				.addKeyframe('', 200)
				.addKeyframe('', 300)
				.addKeyframe('', 400);

			// inserting an entry before any existing entries
			channel.addKeyframe('', 250);

			expect(channel.keyframes.length).toEqual(5);
			expect(channel.keyframes[2].time).toEqual(250);
		});
	});

	describe('update', function () {
		it('calls the update callback with the correct value when updating before all keyframes', function () {
			var data0 = 0;
			channel.callbackUpdate = function (time, value) { data0 = value; };

			channel.addKeyframe('', 100, 1, function (progress) { return progress; })
				.addKeyframe('', 200, 2, function () {});

			channel.update(50);
			expect(data0).toEqual(1);
		});

		it('calls the update callback with the correct value when updating between 2 keyframes', function () {
			var data0 = 0;
			channel.callbackUpdate = function (time, value) { data0 = value; };

			channel.addKeyframe('', 100, 1, function (progress) { return progress; })
				.addKeyframe('', 200, 2, function () {});

			channel.update(150);
			expect(data0).toEqual(1.5);
		});

		it('calls the update callback with the correct value when updating after all keyframes', function () {
			var data0 = 0;
			channel.callbackUpdate = function (time, value) { data0 = value; };

			channel.addKeyframe('', 100, 1, function (progress) { return progress; })
				.addKeyframe('', 200, 2, function () {});

			channel.update(250);
			expect(data0).toEqual(2);
		});

		it('does nothing when called on a disabled channel', function () {
			var data0 = 0;
			channel.callbackUpdate = function (time, value) { data0 = value; };

			channel.enabled = false;

			channel.addKeyframe('', 100, 1, function (progress) { return progress; })
				.addKeyframe('', 200, 2, function () {});

			channel.update(150);
			expect(data0).toEqual(0);
		});

		it('does nothing when called on an empty channel', function () {
			var data0 = 0;
			channel.callbackUpdate = function (time, value) { data0 = value; };

			channel.update(150);
			expect(data0).toEqual(0);
		});
	});
});

describe('tweener factories', function () {
	var entity;
	var resolver = function () { return entity; };
	beforeEach(function () {
		entity = new Entity();
		entity.setComponent(new TransformComponent());
		jasmine.addMatchers(CustomMatchers);
	});

	describe('getSimpleTransformTweener', function () {
		it('gets a translation tweener that alters the translation of the resolved entity', function () {
			var tweener = ValueChannel.getSimpleTransformTweener('translation', 'y', '', resolver);
			tweener(0, 123);
			expect(entity.transformComponent.transform.translation.y).toEqual(123);
		});

		it('gets a scale tweener that alters the scale of the resolved entity', function () {
			var tweener = ValueChannel.getSimpleTransformTweener('scale', 'z', '', resolver);
			tweener(0, 123);
			expect(entity.transformComponent.transform.scale.z).toEqual(123);
		});
	});

	describe('getRotationTweener', function () {
		it('gets a rotation tweener that alters the rotation of the resolved entity', function () {
			var tweener = ValueChannel.getRotationTweener(0, '', resolver, [0, 0, 0]);
			tweener(0, 123 * MathUtils.RAD_TO_DEG);
			var expectedRotation = new Matrix3().fromAngles(123, 0, 0);
			expect(entity.transformComponent.transform.rotation).toBeCloseToMatrix(expectedRotation);
		});
	});
});


var Ajax = require("../../src/goo/util/Ajax");

var TestResponses = {
	'good-url': {
		readyState: 4,
		status: 200,
		responseText: 'Successful response.',
		responseHeader: {
			'Content-Type': 'application/text'
		}
	}
};

function createMockXhr(mockResponses) {
	function MockXHR() {

	}

	MockXHR.prototype.open = function (method, url) {
		this.url = url;
	};

	MockXHR.prototype.send = function () {
		if (!mockResponses[this.url]) {
			this.readyState = 4;
			this.status = 404;
			this.statusText = 'Couldn\'t find a fake response: ' + this.url;
			this.onreadystatechange();
			return;
		}

		var response = mockResponses[this.url];

		for (var key in response) {
			this[key] = response[key];
		}

		this.onreadystatechange();
	};

	MockXHR.prototype.getResponseHeader = function (header) {
		return this.responseHeader[header] ? this.responseHeader[header] : null;
	};

	MockXHR.prototype.addEventListener = function (eventName, callback) {
		this.onreadystatechange = callback;
	};

	MockXHR.prototype.removeEventListener = function (/*eventName, callback*/) {
		// does nothing!
	};

	return MockXHR;
}

describe('Ajax', function () {
	beforeEach(function () {
		spyOn(window, 'XMLHttpRequest').and.callFake(function () {
			var mockXHR = createMockXhr(TestResponses);
			return mockXHR.prototype;
		});
	});

	it('resolves with the request as argument when the request is successful', function (done) {
		var ajaxSettings = {
			url: 'good-url',
			method: 'GET',
			async: true
		};

		var a = new Ajax().get(ajaxSettings).then(function (data) {
			expect(data.responseText).toEqual('Successful response.');
			done();
		});

		spyOn(a, 'resolve').and.callThrough();
	});


	it('resolves with the request as argument when the request is unsuccessful', function (done) {
		var ajaxSettings = {
			url: 'nonexistent-url',
			method: 'GET',
			async: true
		};

		var a = new Ajax().get(ajaxSettings).then(null, function (reason) {
			expect(reason).toEqual('Couldn\'t find a fake response: ' + ajaxSettings.url);
			done();
		});

		spyOn(a, 'reject').and.callThrough();
	});
});


var ArrayUtils = require("../../src/goo/util/ArrayUtils");

describe('ArrayUtils', function () {
	describe('fromKeys', function () {
		it('returns an empty array for an empty collection', function () {
			var set_ = new Set();
			var map = new Map();

			var setKeys = ArrayUtils.fromKeys(set_);
			var mapKeys = ArrayUtils.fromKeys(map);

			expect(setKeys).toEqual([]);
			expect(mapKeys).toEqual([]);
		});

		it('returns an array of keys of the given collection', function () {
			var set_ = new Set();
			set_.add('a');
			set_.add('s');
			set_.add('d');

			var map = new Map();
			map.set('f', 'ff');
			map.set('g', 'gg');
			map.set('h', 'hh');

			var setKeys = ArrayUtils.fromKeys(set_);
			var mapKeys = ArrayUtils.fromKeys(map);

			expect(setKeys).toEqual(['a', 's', 'd']);
			expect(mapKeys).toEqual(['f', 'g', 'h']);
		});
	});

	describe('fromValues', function () {
		it('returns an empty array for an empty collection', function () {
			var set_ = new Set();
			var map = new Map();

			var setKeys = ArrayUtils.fromValues(set_);
			var mapKeys = ArrayUtils.fromValues(map);

			expect(setKeys).toEqual([]);
			expect(mapKeys).toEqual([]);
		});

		it('returns an array of keys of the given collection', function () {
			var set_ = new Set();
			set_.add('a');
			set_.add('s');
			set_.add('d');

			var map = new Map();
			map.set('f', 'ff');
			map.set('g', 'gg');
			map.set('h', 'hh');

			var setKeys = ArrayUtils.fromValues(set_);
			var mapKeys = ArrayUtils.fromValues(map);

			expect(setKeys).toEqual(['a', 's', 'd']);
			expect(mapKeys).toEqual(['ff', 'gg', 'hh']);
		});
	});
});


var CanvasUtils = require("../../src/goo/util/CanvasUtils");

describe('CanvasUtils', function () {
	describe('Rendering an SVG to canvas', function () {
		var renderSize = 300;
		var options = {
			width: renderSize,
			height: renderSize
		};

		it('should create an canvas element with the given dimensions', function (done) {
			var data = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100">' +
				'<rect x="0" y="0" width="200" height="100" fill="blue" />' +
				'</svg>';

			CanvasUtils.renderSvgToCanvas(data, options, function (canvas) {
				expect(canvas).toEqual(jasmine.any(HTMLCanvasElement));
				expect(canvas.width).toEqual(options.width);
				expect(canvas.height).toEqual(options.height);
				done();
			});
		});

		describe('when SVG data is corrupt', function () {
			it('should fire the callback with no argument (undefined)', function (done) {
				var data = '<svg xmlns="http://www.w3.org/2000/svg" oh wait what?';

				CanvasUtils.renderSvgToCanvas(data, options, function (canvas) {
					expect(canvas).toBeUndefined();
					done();
				});
			});
		});
	});
});


var EventTarget = require("../../src/goo/util/EventTarget");

function Test() {
	EventTarget.apply(this, arguments);
}
Test.prototype = Object.create(EventTarget.prototype);

describe('EventTarget', function () {
	var test;
	var listener = function (/*event*/) { };
	var listener2 = function (/*event*/) { };
	var sendEvent = {
		type: 'send',
		data: undefined
	};

	beforeEach(function () {
		test = new Test();
	});

	it('Can get EventTarget methods attached', function () {
		expect(test.fire).toBeDefined();
		expect(test.on).toBeDefined();
		expect(test.off).toBeDefined();
		expect(test.has).toBeDefined();
	});

	it('Can add/remove listeners', function () {
		expect(test.has('send')).toEqual(false);
		test.on('send', listener);
		expect(test.has('send')).toEqual(true);
		expect(test.has('asdf')).toEqual(false);

		test.on('send', listener2);
		test.on('fish', listener);
		expect(test._listenerMap.get('send').length).toEqual(2);
		expect(test._listenerMap.get('fish').length).toEqual(1);

		test.off('send', listener);
		expect(test._listenerMap.get('send').length).toEqual(1);
		expect(test.has('send')).toEqual(true);

		test.off('send', listener2);
		expect(test.has('send')).toEqual(false);
	});

	it('Cannot add multiple', function () {
		expect(test._listenerMap.get('send')).toBeUndefined();
		test.on('send', listener);
		expect(test._listenerMap.get('send').length).toEqual(1);
		test.on('send', listener);
		test.on('send', listener);
		test.on('send', listener);
		expect(test._listenerMap.get('send').length).toEqual(1);

		test.off('send', listener);
		expect(test._listenerMap.get('send')).toBeUndefined();
	});

	it('Can remove all listeners of type', function () {
		test.on('send', listener);
		test.on('send', listener2);
		expect(test.has('send')).toEqual(true);
		expect(test._listenerMap.get('send').length).toEqual(2);

		test.off('send');
		expect(test.has('send')).toEqual(false);
		expect(test._listenerMap.get('send')).toBeUndefined();
	});

	it('Can listen to events', function () {
		var obj = { listener: listener };
		spyOn(obj, 'listener');

		test.on('send', obj.listener);

		expect(obj.listener).not.toHaveBeenCalled();

		test.fire(sendEvent);
		expect(obj.listener).toHaveBeenCalledWith(sendEvent);

		sendEvent.data = 1;
		test.fire('send', 1);
		expect(obj.listener).toHaveBeenCalledWith(sendEvent);

		var data = {
			type: 'send',
			test: 'test'
		};
		test.fire(data);
		expect(obj.listener).toHaveBeenCalledWith(data);
	});

	it('Listener can remove itself during call', function () {
		var counter = 0;

		var listenerStart = function () {
			counter++;
		};
		var listenerRemove = function (event) {
			counter++;
			event.target.off(event.type, listenerRemove);
		};
		var listenerEnd = function () {
			counter++;
		};

		test.on('send', listenerStart);
		test.on('send', listenerRemove);
		test.on('send', listenerEnd);

		test.fire(sendEvent);

		expect(counter).toEqual(3);
		expect(test._listenerMap.get('send').length).toEqual(2);

		counter = 0;

		test.fire(sendEvent);

		expect(counter).toEqual(2);
		expect(test._listenerMap.get('send').length).toEqual(2);
	});

	it('Listener can add new listeners during call', function () {
		var counter = 0;

		var listenerStart = function () {
			counter++;
		};
		var listenerAdd = function () {
			counter++;
		};
		var listenerEnd = function (event) {
			counter++;
			event.target.on(event.type, listenerAdd);
		};

		test.on('send', listenerStart);
		test.on('send', listenerEnd);

		test.fire(sendEvent);
		expect(counter).toEqual(2);
		expect(test._listenerMap.get('send').length).toEqual(3);

		counter = 0;

		test.fire(sendEvent);
		expect(counter).toEqual(3);
		expect(test._listenerMap.get('send').length).toEqual(3);
	});
});


var ObjectUtils = require("../../src/goo/util/ObjectUtils");
var CustomMatchers = require("./CustomMatchers");

describe('ObjectUtils', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	describe('defaults', function () {
		it('copies defaults onto an empty object', function () {
			var destination = {};
			var source = { a: 1, b: 2 };

			ObjectUtils.defaults(destination, source);

			expect(destination).toEqual(source);
		});

		it('ignores existing properties on the destination object', function () {
			var destination = { a: 123, b: 456 };
			var source = { a: 1, b: 2 };

			ObjectUtils.defaults(destination, source);

			expect(destination).toEqual({ a: 123, b: 456 });
		});
	});

	describe('copyOptions', function () {
		it('copies defaults onto an empty object', function () {
			var destination = {};
			var options = {};
			var defaults = { a: 1, b: 2 };

			ObjectUtils.copyOptions(destination, options, defaults);

			expect(destination).toEqual(defaults);
		});

		it('ignores defaults when options are present', function () {
			var destination = {};
			var options = { a: 123, b: 456 };
			var defaults = { a: 1, b: 2 };

			ObjectUtils.copyOptions(destination, options, defaults);

			expect(destination).toEqual(options);
		});

		it('copies the defaults object over when options is not an object', function () {
			var destination = {};
			var options = null;
			var defaults = { a: 1, b: 2 };

			ObjectUtils.copyOptions(destination, options, defaults);

			expect(destination).toEqual(defaults);
		});
	});

	describe('extends', function () {
		it('copies properties onto an empty object', function () {
			var destination = {};
			var source = { a: 1, b: 2 };

			ObjectUtils.extend(destination, source);

			expect(destination).toEqual(source);
		});

		it('overwrites existing properties on the destination object', function () {
			var destination = { a: 123, b: 456 };
			var source = { a: 1, b: 2 };

			ObjectUtils.extend(destination, source);

			expect(destination).toEqual(source);
		});
	});

	describe('forEach', function () {
		it('iterates over objects\' keys', function () {
			var obj = {
				p2: { sortValue: 2, value: 123 },
				p1: { sortValue: 1, value: 234 }
			};
			var spy = jasmine.createSpy('spy1');
			ObjectUtils.forEach(obj, spy, null, 'sortValue');

			expect(spy.calls.count()).toEqual(2);
			expect(spy).toHaveBeenCalledWith(obj.p1, 'p1', obj);
			expect(spy).toHaveBeenCalledWith(obj.p2, 'p2', obj);
		});
	});

	describe('cloneMap', function () {
		it('clones an empty map', function () {
			var originalMap = new Map();
			var clonedMap = ObjectUtils.cloneMap(originalMap);

			expect(clonedMap.size).toEqual(0);
		});

		it('clones a map with some elements', function () {
			var originalMap = new Map();
			originalMap.set(11, 'aa');
			originalMap.set(22, 'bb');
			var clonedMap = ObjectUtils.cloneMap(originalMap);

			expect(clonedMap.size).toEqual(2);
			expect(clonedMap.get(11)).toEqual('aa');
			expect(clonedMap.get(22)).toEqual('bb');
		});
	});

	describe('cloneSet', function () {
		it('clones an empty set', function () {
			var originalSet = new Set();
			var clonedSet = ObjectUtils.cloneSet(originalSet);

			expect(clonedSet.size).toEqual(0);
		});

		it('clones a set with some elements', function () {
			var originalSet = new Set();
			originalSet.add(11);
			originalSet.add(22);
			var clonedSet = ObjectUtils.cloneSet(originalSet);

			expect(clonedSet.size).toEqual(2);
			expect(clonedSet.has(11)).toBeTruthy();
			expect(clonedSet.has(22)).toBeTruthy();
		});
	});

	describe('deepClone', function () {
		var clone = ObjectUtils.deepClone;

		it('does not clone primitives and functions', function () {
			expect(clone(123)).toBe(123);
			expect(clone(true)).toBe(true);
			expect(clone('asd')).toBe('asd');

			var func = function () {};
			expect(clone(func)).toBe(func);
		});

		it('does not clone null or undefined', function () {
			expect(clone(null)).toBeNull();
			expect(clone(undefined)).toBeUndefined();
		});

		it('clones arrays', function () {
			var original = [1, 2, 3];
			expect(clone(original)).toBeCloned(original);
		});

		it('clones sparse arrays', function () {
			var original = [];
			original[10] = 123;
			var cloned = clone(original);
			expect(cloned).toBeCloned(original);
			expect(cloned.hasOwnProperty(0)).toBeFalsy();
		});

		it('clones objects', function () {
			var original = { a: 123, b: false, c: undefined, d: null };
			expect(clone(original)).toBeCloned(original);
		});

		it('clones a typed array', function () {
			var original = new Uint32Array([1, 2, 3]);
			expect(clone(original)).toBeCloned(original);
		});

		if (typeof(module) === 'undefined') {
			it('clones dom elements', function () {
				var original = document.createElement('div');
				original.classList.add('asd');
				var cloned = clone(original);

				expect(cloned).not.toBe(original);
				expect(cloned.classList.contains('asd')).toBeTruthy();
			});
		}
	});
});


var PromiseUtils = require("../../src/goo/util/PromiseUtils");

describe('PromiseUtils', function () {
	describe('delay', function () {
		it('resolves asynchronously', function (done) {
			var resolved = false;
			PromiseUtils.delay('asd', 200).then(function () {
				resolved = true;
				done();
			});

			expect(resolved).toBe(false);
		});
	});
});


var StringUtils = require("../../src/goo/util/StringUtils");

describe('StringUtils', function () {
	it('parses URLs', function () {
		var url = 'http://example.com:1234/images/goo.png?param=1#fragment';
		var parts = StringUtils.parseURL(url);
		expect(parts.scheme).toEqual('http');
		expect(parts.domain).toEqual('example.com');
		expect(parts.user_info).toBeFalsy();
		expect(parts.port).toEqual('1234');
		expect(parts.path).toEqual('/images/goo.png');
		expect(parts.query_data).toEqual('param=1');
		expect(parts.fragment).toEqual('fragment');
	});
});
