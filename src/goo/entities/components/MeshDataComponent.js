var BoundingBox = require('../../renderer/bounds/BoundingBox');
var Component = require('../../entities/components/Component');
var MeshData = require('../../renderer/MeshData');

/**
 * Holds the mesh data, like vertices, normals, indices etc. Also defines the local bounding volume.
 * @example-link http://code.gooengine.com/latest/examples/goo/entities/components/MeshDataComponent/MeshDataComponent-example.html Working example
 * @param {MeshData} meshData Target mesh data for this component.
 * @extends Component
 */
function MeshDataComponent(meshData) {
	Component.apply(this, arguments);

	this.type = 'MeshDataComponent';

	/**
	 * @type {MeshData}
	 */
	this.meshData = meshData;

	/** Bounding volume in local space.
	 * @type {BoundingVolume}
	 */
	this.modelBound = new BoundingBox();

	/**
	 * @type {boolean}
	 * @default
	 */
	this.modelBoundDirty = true;

	/**
	 * @type {SkeletonPose}
	 * @default
	 */
	this.currentPose = null; // SkeletonPose

	// @ifdef DEBUG
	Object.seal(this);
	// @endif
}

MeshDataComponent.type = 'MeshDataComponent';

MeshDataComponent.prototype = Object.create(Component.prototype);
MeshDataComponent.prototype.constructor = MeshDataComponent;

/**
 * Set the bounding volume type (sphere, box etc).
 *
 * @param {BoundingVolume} modelBound Bounding to apply to this meshdata component.
 * @param {boolean} [setBoundsDirty=true] Whether to set modelBoundDirty=true.
 */
MeshDataComponent.prototype.setModelBound = function (modelBound, setBoundsDirty) {
	this.modelBound = modelBound;
	this.modelBoundDirty = setBoundsDirty !== undefined ? setBoundsDirty : true;
};

/**
 * Compute bounding center and bounds for this mesh.
 */
MeshDataComponent.prototype.computeBoundFromPoints = function () {
	if (!this.modelBoundDirty) {
		return;
	}
	if (this.modelBound !== null && this.meshData) {
		var verts = this.meshData.getAttributeBuffer('POSITION');
		if (verts !== undefined) {
			this.modelBound.computeFromPoints(verts);
			this.modelBoundDirty = false;
		}
	} else {
		this.modelBound.reset();
	}
};

/**
 * Returns a clone of this mesh data component
 * @param {Object} [options]
 * @param {boolean} [options.shareMeshData=false] Cloning this component clones the mesh data by default
 * @returns {MeshDataComponent}
 */
MeshDataComponent.prototype.clone = function (options) {
	options = options || {};

	var clone = new MeshDataComponent();

	if (options.shareMeshData) {
		clone.meshData = this.meshData;
		clone.modelBound = this.modelBound;
	} else {
		clone.meshData = this.meshData.clone();
		clone.modelBound = this.modelBound.clone();
	}

	clone.modelBoundDirty = this.modelBoundDirty;

	return clone;
};

MeshDataComponent.applyOnEntity = function (obj, entity) {
	if (obj instanceof MeshData) {
		var meshDataComponent = new MeshDataComponent(obj);
		entity.setComponent(meshDataComponent);
		return true;
	}
};

module.exports = MeshDataComponent;