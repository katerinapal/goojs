import { MeshData as MeshDatajs } from "../renderer/MeshData";
import { ObjectUtils as ObjectUtilsjs } from "../util/ObjectUtils";
function TextureGrid(matrix, textureUnitsPerLine) {
	this.matrix = matrix;
	this.textureUnitsPerLine = textureUnitsPerLine || 8;

	var attributeMap = MeshDatajs.defaultMap([MeshDatajs.POSITION, MeshDatajs.NORMAL, MeshDatajs.TEXCOORD0]);
	var nCells = countCells(matrix);
	MeshDatajs.call(this, attributeMap, nCells * 4, nCells * 6);

	this.rebuild();
}

TextureGrid.prototype = Object.create(MeshDatajs.prototype);
TextureGrid.prototype.constructor = TextureGrid;

function countCells(matrix) {
	var count = 0;
	for (var i = 0; i < matrix.length; i++) {
		count += matrix[i].length;
	}
	return count;
}

/**
 * Builds or rebuilds the mesh data.
 * @returns {TextureGrid} Self for chaining.
 */
TextureGrid.prototype.rebuild = function () {
	var verts = [];
	var norms = [];
	var indices = [];
	var tex = [];

	var indexCounter = 0;
	var halfHeight = this.matrix.length / 2;
	for (var i = 0; i < this.matrix.length; i++) {
		var halfWidth = this.matrix[i].length / 2;
		for (var j = 0; j < this.matrix[i].length; j++) {
			verts.push(
				j - halfWidth, -i - 1 + halfHeight, 0,
				j - halfWidth, -i + halfHeight, 0,
				j + 1 - halfWidth, -i + halfHeight, 0,
				j + 1 - halfWidth, -i - 1 + halfHeight, 0
			);

			norms.push(
				0, 0, 1,
				0, 0, 1,
				0, 0, 1,
				0, 0, 1
			);

			var texX = (this.matrix[i][j] % this.textureUnitsPerLine) / this.textureUnitsPerLine;
			var texY = Math.floor(this.matrix[i][j] / this.textureUnitsPerLine) / this.textureUnitsPerLine;
			texY = 1 - texY;

			tex.push(
				texX, texY - 1 / this.textureUnitsPerLine,
				texX, texY,
				texX + 1 / this.textureUnitsPerLine, texY,
				texX + 1 / this.textureUnitsPerLine, texY - 1 / this.textureUnitsPerLine
			);

			indices.push(
				indexCounter + 3, indexCounter + 1, indexCounter + 0,
				indexCounter + 2, indexCounter + 1, indexCounter + 3
			);

			indexCounter += 4;
		}
	}

	this.getAttributeBuffer(MeshDatajs.POSITION).set(verts);
	this.getAttributeBuffer(MeshDatajs.NORMAL).set(norms);
	this.getAttributeBuffer(MeshDatajs.TEXCOORD0).set(tex);

	this.getIndexBuffer().set(indices);

	return this;
};

/**
 * Returns a clone of this texture grid
 * @returns {TextureGrid}
 */
TextureGrid.prototype.clone = function () {
	var options = ObjectUtilsjs.shallowSelectiveClone(this, ['matrix', 'textureUnitsPerLine']);

	return new TextureGrid(options);
};

function stringToMatrix(str) {
	var matrix = [];
	var lineAr = str.split('\n');
	lineAr.forEach(function (line) {
		var charAr = line.split('');
		var matrixLine = charAr.map(function (ch) {
			return ch.charCodeAt(0);
		});
		matrix.push(matrixLine);
	});
	return matrix;
}

TextureGrid.fromString = function (str) {
	return new TextureGrid(stringToMatrix(str), 16);
};

var exported_TextureGrid = TextureGrid;

/**
 * Meshdata for a grid; useful for displaying tiles
 * @extends MeshData
 * @param matrix
 * @param textureUnitsPerLine
 */
export { exported_TextureGrid as TextureGrid };