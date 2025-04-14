var Vector3 = require('../../../../src/goo/math/Vector3');
var World = require('../../../../src/goo/entities/World');
var LineRenderSystem = require('../../../../src/goo/addons/linerenderpack/LineRenderSystem');

describe('LineRenderSystem', function () {
	//var world;
	//var lineRenderSystem;

	/*beforeEach(function () {
		world = new World();
		lineRenderSystem = new LineRenderSystem(world);
	});*/

	/*it('can construct', function () {
		expect(lineRenderSystem).toBeDefined();
	});*/

	it('can drawLine', function () {
		
		//UPD
		var world = new World();
		var lineRenderSystem = new LineRenderSystem(world);

		let invArg0 = Vector3.ZERO;
		let invArg1 = Vector3.ONE;
		let invArg2 = lineRenderSystem.RED;

		//draw a red line between 0,0,0 and 1,1,1
		lineRenderSystem.drawLine(invArg0, invArg1, invArg2);

		//lineRenderSystem.drawLine(Vector3.ZERO, Vector3.ONE, lineRenderSystem.RED);

		expect(lineRenderSystem._lineRenderers.length).toBe(1);
	});

	/*it('can drawCross', function () {

		//UPD
		var world = new World();
		var lineRenderSystem = new LineRenderSystem(world);

		//draw a red cross at 0,0,0
		lineRenderSystem.drawCross(Vector3.ZERO, lineRenderSystem.RED);

		expect(lineRenderSystem._lineRenderers.length).toBe(1);
	});*/
});
