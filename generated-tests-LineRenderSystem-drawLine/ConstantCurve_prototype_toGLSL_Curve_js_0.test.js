describe(
  "../evaluationProjects/goojs/src/goo/addons/particlepack/curves/Curve.js:28:22:30:1",
  () => {
    test("invoc-loc:25:9:25:38-test:0", () => {
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/src/goo/addons/particlepack/curves/ConstantCurve.js:1:1:1:64
      var Curve = require("../src/goo/addons/particlepack/curves/Curve");
      var arg0 = 123;
      var actualResult = Curve.numberToGLSL(arg0);
      var expectedResult = "123.0";
      expect(expectedResult).toBe(actualResult);
    });

    test("invoc-loc:25:9:25:38-test:1", () => {
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/src/goo/addons/particlepack/curves/ConstantCurve.js:1:1:1:64
      var Curve = require("../src/goo/addons/particlepack/curves/Curve");
      var arg0 = 1;
      var actualResult = Curve.numberToGLSL(arg0);
      var expectedResult = "1.0";
      expect(expectedResult).toBe(actualResult);
    });

    test("invoc-loc:25:9:25:38-test:2", () => {
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/src/goo/addons/particlepack/curves/ConstantCurve.js:1:1:1:64
      var Curve = require("../src/goo/addons/particlepack/curves/Curve");
      var arg0 = 2;
      var actualResult = Curve.numberToGLSL(arg0);
      var expectedResult = "2.0";
      expect(expectedResult).toBe(actualResult);
    });
  }
);

