describe(
  "../evaluationProjects/goojs/src/goo/math/MathUtils.js:82:18:88:1",
  () => {
    test("invoc-loc:47:9:47:51-test:0", () => {
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/src/goo/addons/particlepack/curves/LerpCurve.js:2:1:2:50
      var MathUtils = require("../src/goo/math/MathUtils");
      var arg0 = 0.5;
      var arg1 = 0;
      var arg2 = 0;
      var actualResult = MathUtils.lerp(arg0, arg1, arg2);
      var expectedResult = 0;
      expect(expectedResult).toBe(actualResult);
    });

    test("invoc-loc:47:9:47:51-test:1", () => {
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/src/goo/addons/particlepack/curves/LerpCurve.js:2:1:2:50
      var MathUtils = require("../src/goo/math/MathUtils");
      var arg0 = 0.5;
      var arg1 = 0.5;
      var arg2 = 1;
      var actualResult = MathUtils.lerp(arg0, arg1, arg2);
      var expectedResult = 0.75;
      expect(expectedResult).toBe(actualResult);
    });

    test("invoc-loc:47:9:47:51-test:2", () => {
      ///home/katerina/visualStudioGit/evaluationProjects/goojs/src/goo/addons/particlepack/curves/LerpCurve.js:2:1:2:50
      var MathUtils = require("../src/goo/math/MathUtils");
      var arg0 = 0.5;
      var arg1 = 1;
      var arg2 = 2;
      var actualResult = MathUtils.lerp(arg0, arg1, arg2);
      var expectedResult = 1.5;
      expect(expectedResult).toBe(actualResult);
    });
  }
);

