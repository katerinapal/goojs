describe(
  "../evaluationProjects/goojs/src/goo/addons/linerenderpack/LineRenderer.js:120:35:141:1",
  () => {
    test("invoc-loc:67:2:67:41-test:0", () => {
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:1:1:1:48
      var Vector3 = require("../src/goo/math/Vector3");
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:2:1:2:48
      var World = require("../src/goo/entities/World");
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:3:1:3:83
      var LineRenderSystem = require("../src/goo/addons/linerenderpack/LineRenderSystem");
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:20:3:20:25
      var world = new World();
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:21:3:21:52
      var lineRenderSystem = new LineRenderSystem(world);
      var this_obj = lineRenderSystem;
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:23:3:23:28
      var invArg0 = Vector3.ZERO;
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:24:3:24:27
      var invArg1 = Vector3.ONE;
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:25:3:25:36
      var invArg2 = lineRenderSystem.RED;
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/src/goo/addons/linerenderpack/LineRenderSystem.js:65:2:65:42
      var lineRenderer = this_obj._lineRenderers[0];
      var arg0 = invArg0;
      var arg1 = invArg1;
      var arg2 = invArg2;
      var actualResult = lineRenderer._addLine(arg0, arg1, arg2);
      var expectedResult = undefined;
      expect(lineRenderer._meshData.dataViews.POSITION["3"]).toBe(1);
      expect(lineRenderer._meshData.dataViews.POSITION["4"]).toBe(1);
      expect(lineRenderer._meshData.dataViews.POSITION["5"]).toBe(1);
      expect(lineRenderer._meshData.dataViews.RGB_COLOR["0"]).toBe(1);
      expect(lineRenderer._meshData.dataViews.RGB_COLOR["3"]).toBe(1);
      expect(lineRenderer._meshData.dataViews.POSITION["3"]).toBe(1);
      expect(lineRenderer._meshData.dataViews.POSITION["4"]).toBe(1);
      expect(lineRenderer._meshData.dataViews.POSITION["5"]).toBe(1);
      expect(lineRenderer._meshData.dataViews.RGB_COLOR["0"]).toBe(1);
      expect(lineRenderer._meshData.dataViews.RGB_COLOR["3"]).toBe(1);
      expect(lineRenderer._positions["3"]).toBe(1);
      expect(lineRenderer._positions["4"]).toBe(1);
      expect(lineRenderer._positions["5"]).toBe(1);
      expect(lineRenderer._colors["0"]).toBe(1);
      expect(lineRenderer._colors["3"]).toBe(1);
      expect(lineRenderer._numRenderingLines).toBe(1);
      expect(expectedResult).toBe(actualResult);
    });
  }
);

