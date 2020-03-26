import { Gizmo as utilgizmopackGizmo_Gizmojs } from "../../util/gizmopack/Gizmo";
import { MeshData as rendererMeshData_MeshDatajs } from "../../renderer/MeshData";
import { MeshBuilder as utilMeshBuilder_MeshBuilderjs } from "../../util/MeshBuilder";
import { Disk as shapesDisk_Diskjs } from "../../shapes/Disk";
import { Quad as shapesQuad_Quadjs } from "../../shapes/Quad";
import { Transform as mathTransform_Transformjs } from "../../math/Transform";
import { Vector3 as mathVector3_Vector3js } from "../../math/Vector3";
import { Ray as mathRay_Rayjs } from "../../math/Ray";
import { Renderer as rendererRenderer_Rendererjs } from "../../renderer/Renderer";
function TranslationGizmo() {
	utilgizmopackGizmo_Gizmojs.call(this, 'TranslationGizmo');

	this.realTranslation = new mathVector3_Vector3js();
	this._snap = false;

	this.compileRenderables();
}

TranslationGizmo.prototype = Object.create(utilgizmopackGizmo_Gizmojs.prototype);
TranslationGizmo.prototype.constructor = TranslationGizmo;

// Triggered when you have mousedown on a gizmo handle
TranslationGizmo.prototype.activate = function (props) {
	utilgizmopackGizmo_Gizmojs.prototype.activate.call(this, props);
	this._setPlane();
	if (this._activeHandle.type === 'Axis') {
		this._setLine();
	}
	this.realTranslation.copy(this.transform.translation);
};

TranslationGizmo.prototype.copyTransform = function () {
	utilgizmopackGizmo_Gizmojs.prototype.copyTransform.apply(this, arguments);
};

function snapToGrid(vector3) {
	vector3.x = Math.round(vector3.x);
	vector3.y = Math.round(vector3.y);
	vector3.z = Math.round(vector3.z);
}

TranslationGizmo.prototype.setSnap = function (snap) {
	this._snap = snap;
};

(function () {
	var oldRay = new mathRay_Rayjs();
	var newRay = new mathRay_Rayjs();

	TranslationGizmo.prototype.process = function (mouseState, oldMouseState) {
		rendererRenderer_Rendererjs.mainCamera.getPickRay(oldMouseState.x, oldMouseState.y, 1, 1, oldRay);
		rendererRenderer_Rendererjs.mainCamera.getPickRay(mouseState.x, mouseState.y, 1, 1, newRay);

		if (this._activeHandle.type === 'Plane') {
			this._moveOnPlane(oldRay, newRay, this._plane);
		} else if (this._activeHandle.type === 'Axis') {
			this._moveOnLine(oldRay, newRay, this._plane, this._line);
		}

		this._postProcess(this.transform.translation);
	};
})();

TranslationGizmo.prototype._addTranslation = function (moveVector) {
	this.realTranslation.add(moveVector);
	this.transform.translation.copy(this.realTranslation);

	if (this._snap) {
		snapToGrid(this.transform.translation);
	}
};

(function () {
	var oldWorldPos = new mathVector3_Vector3js();
	var worldPos = new mathVector3_Vector3js();
	var moveVector = new mathVector3_Vector3js();

	TranslationGizmo.prototype._moveOnPlane = function (oldRay, newRay, plane) {
		// Project mouse move to plane
		plane.rayIntersect(oldRay, oldWorldPos, true);
		plane.rayIntersect(newRay, worldPos, true);
		moveVector.copy(worldPos).sub(oldWorldPos);

		// And add to translation
		this._addTranslation(moveVector);
	};
})();

(function () {
	var oldWorldPos = new mathVector3_Vector3js();
	var worldPos = new mathVector3_Vector3js();
	var moveVector = new mathVector3_Vector3js();

	TranslationGizmo.prototype._moveOnLine = function (oldRay, newRay, plane, line) {
		// Project mousemove to plane
		plane.rayIntersect(oldRay, oldWorldPos, true);
		plane.rayIntersect(newRay, worldPos, true);
		moveVector.copy(worldPos).sub(oldWorldPos);

		// Then project plane diff to line
		var d = moveVector.dot(line);
		moveVector.copy(line).scale(d);

		this._addTranslation(moveVector);
	};
})();

TranslationGizmo.prototype.compileRenderables = function () {
	var arrowMesh = buildArrowMesh();
	var quadMesh = new shapesQuad_Quadjs(2, 2);

	buildArrow(arrowMesh, quadMesh, 0).forEach(this.addRenderable, this);
	buildArrow(arrowMesh, quadMesh, 1).forEach(this.addRenderable, this);
	buildArrow(arrowMesh, quadMesh, 2).forEach(this.addRenderable, this);
};

function buildArrow(arrowMesh, quadMesh, dim) {
	var arrowTransform = new mathTransform_Transformjs();
	var quadTransform = new mathTransform_Transformjs();

	var size = 1.0;
	quadTransform.scale.setDirect(size, size, size);
	if (dim === 2) {
		quadTransform.translation.setDirect(size, size, 0);
	} else if (dim === 0) {
		quadTransform.translation.setDirect(0, size, size);
		quadTransform.setRotationXYZ(0, Math.PI / 2, 0);
		arrowTransform.setRotationXYZ(0, Math.PI / 2, 0);
	} else if (dim === 1) {
		quadTransform.translation.setDirect(size, 0, size);
		quadTransform.setRotationXYZ(Math.PI / 2, 0, 0);
		arrowTransform.setRotationXYZ(Math.PI * 3 / 2, 0, 0);
	}

	return [{
		meshData: arrowMesh,
		materials: [utilgizmopackGizmo_Gizmojs.buildMaterialForAxis(dim)],
		transform: arrowTransform,
		id: utilgizmopackGizmo_Gizmojs.registerHandle({ type: 'Axis', axis: dim }),
		thickness: 0.6
	}, {
		meshData: quadMesh,
		materials: [utilgizmopackGizmo_Gizmojs.buildMaterialForAxis(dim, 0.6)],
		transform: quadTransform,
		id: utilgizmopackGizmo_Gizmojs.registerHandle({ type: 'Plane', axis: dim })
	}];
}

function buildArrowMesh() {
	var meshBuilder = new utilMeshBuilder_MeshBuilderjs();

	// Arrow head
	var mesh1Data = new shapesDisk_Diskjs(32, 0.6, 2.3);
	// Arrow base
	var mesh2Data = new shapesDisk_Diskjs(32, 0.6);
	// Line
	var mesh3Data = new rendererMeshData_MeshDatajs(rendererMeshData_MeshDatajs.defaultMap([rendererMeshData_MeshDatajs.POSITION]), 2, 2);
	mesh3Data.getAttributeBuffer(rendererMeshData_MeshDatajs.POSITION).set([0, 0, 0, 0, 0, 7]);
	mesh3Data.getIndexBuffer().set([0, 1]);
	mesh3Data.indexLengths = null;
	mesh3Data.indexModes = ['Lines'];

	// Arrow head
	var transform = new mathTransform_Transformjs();
	transform.translation.setDirect(0, 0, 7);
	transform.update();
	meshBuilder.addMeshData(mesh1Data, transform);

	// Arrow base
	transform.setRotationXYZ(0, Math.PI, 0);
	transform.update();
	meshBuilder.addMeshData(mesh2Data, transform);

	// Line
	var transform = new mathTransform_Transformjs();
	transform.update();
	meshBuilder.addMeshData(mesh3Data, transform);

	// Combine
	var mergedMeshData = meshBuilder.build()[0];
	return mergedMeshData;
}

var exported_TranslationGizmo = TranslationGizmo;

/**
 * @extends Gizmo
 * @hidden
 */
export { exported_TranslationGizmo as TranslationGizmo };