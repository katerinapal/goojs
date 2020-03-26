'use strict';

goo.V.attachToGlobal();

V.describe('A surface is generated by multiplying 2 polyLines');

var gooRunner = V.initGoo();
var world = gooRunner.world;

var xGenerator = PolyLine.fromCubicSpline([0, 0, 0, 1, 0, 0, 1, 0.5, 0, 0, 1, 0, -1, 1.5, 0, -1, 2, 0, 0, 2, 0], 20);

var yGenerator = PolyLine.fromCubicSpline([0, 0, 0, 1, 0, 0, 1, 0, 0.5, 0, 0, 1, -1, 0, 1.5, -1, 0, 2, 0, 0, 2], 20);

// generator material
var generatorMaterial = new Material(ShaderLib.simpleColored);

// x generator
world.createEntity(xGenerator, generatorMaterial, [-1, -1, 0]).addToWorld();

// y generator
world.createEntity(yGenerator, generatorMaterial, [-1, -1, 0]).addToWorld();

// surface mesh data
var surfaceMeshData = xGenerator.mul(yGenerator);

// surface material
var surfaceMaterial = new Material(ShaderLib.texturedLit);

// surface entity
world.createEntity(surfaceMeshData, surfaceMaterial, [0, -1, 0]).addToWorld();

var normalsMeshData = surfaceMeshData.getNormalsMeshData(6);
var normalsMaterial = new Material(ShaderLib.simpleColored);
normalsMaterial.uniforms.color = [0.2, 1.0, 0.6];
world.createEntity(normalsMeshData, normalsMaterial, [0, -1, 0]).addToWorld();

V.addLights();

V.addOrbitCamera(new Vector3(5, Math.PI / 2, 0));

V.process();
