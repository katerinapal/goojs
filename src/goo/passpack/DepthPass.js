var mod_DepthPass = DepthPass;
import { Material as Material_Material } from "../renderer/Material";
import { RenderTarget as RenderTarget_RenderTarget } from "../renderer/pass/RenderTarget";
import { MeshData as MeshData_MeshData } from "../renderer/MeshData";
import { Shader as Shader_Shader } from "../renderer/Shader";
import { ShaderFragment as ShaderFragment_ShaderFragment } from "../renderer/shaders/ShaderFragment";
import { RenderPass as RenderPass_RenderPass } from "../renderer/pass/RenderPass";
import { FullscreenPass as FullscreenPass_FullscreenPass } from "../renderer/pass/FullscreenPass";
import { Pass as Pass_Pass } from "../renderer/pass/Pass";
import { BlurPass as BlurPass_BlurPass } from "../passpack/BlurPass";

/**
 * Depth pass
 * @param renderList
 * @param outShader
 */
function DepthPass(renderList, outShader) {
	this.depthPass = new RenderPass_RenderPass(renderList);
	var packDepthMaterial = new Material_Material(packDepth);
	this.depthPass.overrideMaterial = packDepthMaterial;

	this.blurTarget = new RenderTarget_RenderTarget(256, 256);
	this.blurPass = new BlurPass_BlurPass({
		target: this.blurTarget
	});

	var shader = outShader || unpackDepth;
	this.outPass = new FullscreenPass_FullscreenPass(shader);
	this.outPass.useReadBuffer = false;
	// this.outPass.clear = true;

	var width = window.innerWidth || 1;
	var height = window.innerHeight || 1;
	this.depthTarget = new RenderTarget_RenderTarget(width, height);

	this.enabled = true;
	this.clear = false;
	this.needsSwap = true;
}

DepthPass.prototype = Object.create(Pass_Pass.prototype);
DepthPass.prototype.constructor = DepthPass;

DepthPass.prototype.render = function (renderer, writeBuffer, readBuffer, delta) {
	this.depthPass.render(renderer, null, this.depthTarget, delta);

	this.blurPass.render(renderer, writeBuffer, readBuffer, delta);

	this.outPass.material.setTexture(Shader_Shader.DEPTH_MAP, this.depthTarget);
	this.outPass.material.setTexture(Shader_Shader.DIFFUSE_MAP, readBuffer);
	this.outPass.material.setTexture('BLUR_MAP', this.blurTarget);
	this.outPass.render(renderer, writeBuffer, readBuffer, delta);
};

var packDepth = {
	attributes: {
		vertexPosition: MeshData_MeshData.POSITION
	},
	uniforms: {
		viewMatrix: Shader_Shader.VIEW_MATRIX,
		projectionMatrix: Shader_Shader.PROJECTION_MATRIX,
		worldMatrix: Shader_Shader.WORLD_MATRIX,
//				nearPlane: Shader.NEAR_PLANE,
		farPlane: Shader_Shader.FAR_PLANE
	},
	vshader: [
		'attribute vec3 vertexPosition;',

		'uniform mat4 viewMatrix;',
		'uniform mat4 projectionMatrix;',
		'uniform mat4 worldMatrix;',

		'varying vec4 vPosition;',

		'void main(void) {',
		'	vPosition = viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'	gl_Position = projectionMatrix * vPosition;',
		'}'//
	].join('\n'),
	fshader: [
		'precision mediump float;',

//				'uniform float nearPlane;',
		'uniform float farPlane;',

		ShaderFragment_ShaderFragment.methods.packDepth,

		'varying vec4 vPosition;',

		'void main(void)',
		'{',
		// ' float linearDepth = min(length(vPosition), farPlane) / (farPlane - nearPlane);',
		'	float linearDepth = min(length(vPosition), farPlane) / farPlane;',
		'	gl_FragColor = packDepth(linearDepth);',
		'}'//
	].join('\n')
};

var unpackDepth = {
	attributes: {
		vertexPosition: MeshData_MeshData.POSITION,
		vertexUV0: MeshData_MeshData.TEXCOORD0
	},
	uniforms: {
		viewMatrix: Shader_Shader.VIEW_MATRIX,
		projectionMatrix: Shader_Shader.PROJECTION_MATRIX,
		worldMatrix: Shader_Shader.WORLD_MATRIX,
		depthMap: Shader_Shader.DEPTH_MAP,
		diffuseMap: Shader_Shader.DIFFUSE_MAP
	},
	vshader: [
		'attribute vec3 vertexPosition;',
		'attribute vec2 vertexUV0;',

		'uniform mat4 viewMatrix;',
		'uniform mat4 projectionMatrix;',
		'uniform mat4 worldMatrix;',

		'varying vec2 texCoord0;',

		'void main(void) {',
		'	texCoord0 = vertexUV0;',
		'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'//
	].join('\n'),
	fshader: [
		'precision mediump float;',

		'uniform sampler2D depthMap;',
		'uniform sampler2D diffuseMap;',

		'varying vec2 texCoord0;',

		ShaderFragment_ShaderFragment.methods.unpackDepth,

		'void main(void)',
		'{',
		'	vec4 depthCol = texture2D(depthMap, texCoord0);',
		'	vec4 diffuseCol = texture2D(diffuseMap, texCoord0);',
		'	float depth = unpackDepth(depthCol);',
		'	gl_FragColor = diffuseCol * vec4(depth);',
		'}'//
	].join('\n')
};

/**
 * Depth pass
 * @param renderList
 * @param outShader
 */
export { mod_DepthPass as DepthPass };