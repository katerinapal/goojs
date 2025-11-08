describe(
  "../evaluationProjects/goojs/src/goo/addons/particlepack/curves/ConstantCurve.js:37:46:39:1",
  () => {
    test("invoc-loc:45:16:45:59-test:0", () => {
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:1:1:1:82
      var ConstantCurve = require("../src/goo/addons/particlepack/curves/ConstantCurve");
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:2:1:2:74
      var LerpCurve = require("../src/goo/addons/particlepack/curves/LerpCurve");
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:17:3:20:4
      var curve = new LerpCurve({
                  curveA: new ConstantCurve({ value: 1 }),
                  curveB: new ConstantCurve({ value: 2 })
              });
      var curve;
      var this_obj = curve;
      var arg0 = 0;
      var arg1 = 0.5;
      var actualResult = this_obj.curveA.getIntegralValueAt(arg0, arg1);
      var expectedResult = 0;
      expect(expectedResult).toBe(actualResult);
    });

    test("invoc-loc:46:16:46:59-test:1", () => {
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:1:1:1:82
      var ConstantCurve = require("../src/goo/addons/particlepack/curves/ConstantCurve");
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:2:1:2:74
      var LerpCurve = require("../src/goo/addons/particlepack/curves/LerpCurve");
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:17:3:20:4
      var curve = new LerpCurve({
                  curveA: new ConstantCurve({ value: 1 }),
                  curveB: new ConstantCurve({ value: 2 })
              });
      var this_obj = curve;
      var curve;
      var arg0 = 0;
      var arg1 = 0.5;
      var actualResult = this_obj.curveB.getIntegralValueAt(arg0, arg1);
      var expectedResult = 0;
      expect(expectedResult).toBe(actualResult);
    });

    test("invoc-loc:45:16:45:59-test:2", () => {
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:1:1:1:82
      var ConstantCurve = require("../src/goo/addons/particlepack/curves/ConstantCurve");
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:2:1:2:74
      var LerpCurve = require("../src/goo/addons/particlepack/curves/LerpCurve");
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:17:3:20:4
      var curve = new LerpCurve({
                  curveA: new ConstantCurve({ value: 1 }),
                  curveB: new ConstantCurve({ value: 2 })
              });
      var this_obj = curve;
      var curve;
      var arg0 = 0.5;
      var arg1 = 0.5;
      var actualResult = this_obj.curveA.getIntegralValueAt(arg0, arg1);
      var expectedResult = 0.5;
      expect(expectedResult).toBe(actualResult);
    });

    test("invoc-loc:46:16:46:59-test:3", () => {
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:1:1:1:82
      var ConstantCurve = require("../src/goo/addons/particlepack/curves/ConstantCurve");
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:2:1:2:74
      var LerpCurve = require("../src/goo/addons/particlepack/curves/LerpCurve");
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:17:3:20:4
      var curve = new LerpCurve({
                  curveA: new ConstantCurve({ value: 1 }),
                  curveB: new ConstantCurve({ value: 2 })
              });
      var this_obj = curve;
      var curve;
      var arg0 = 0.5;
      var arg1 = 0.5;
      var actualResult = this_obj.curveB.getIntegralValueAt(arg0, arg1);
      var expectedResult = 1;
      expect(expectedResult).toBe(actualResult);
    });

    test("invoc-loc:45:16:45:59-test:4", () => {
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:1:1:1:82
      var ConstantCurve = require("../src/goo/addons/particlepack/curves/ConstantCurve");
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:2:1:2:74
      var LerpCurve = require("../src/goo/addons/particlepack/curves/LerpCurve");
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:17:3:20:4
      var curve = new LerpCurve({
                  curveA: new ConstantCurve({ value: 1 }),
                  curveB: new ConstantCurve({ value: 2 })
              });
      var this_obj = curve;
      var curve;
      var arg0 = 1;
      var arg1 = 0.5;
      var actualResult = this_obj.curveA.getIntegralValueAt(arg0, arg1);
      var expectedResult = 1;
      expect(expectedResult).toBe(actualResult);
    });

    test("invoc-loc:46:16:46:59-test:5", () => {
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:1:1:1:82
      var ConstantCurve = require("../src/goo/addons/particlepack/curves/ConstantCurve");
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:2:1:2:74
      var LerpCurve = require("../src/goo/addons/particlepack/curves/LerpCurve");
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/filtered-test-modules/goojs-test-code-merged-entryfile.js:17:3:20:4
      var curve = new LerpCurve({
                  curveA: new ConstantCurve({ value: 1 }),
                  curveB: new ConstantCurve({ value: 2 })
              });
      var this_obj = curve;
      var curve;
      var arg0 = 1;
      var arg1 = 0.5;
      var actualResult = this_obj.curveB.getIntegralValueAt(arg0, arg1);
      var expectedResult = 2;
      expect(expectedResult).toBe(actualResult);
    });
  }
);

