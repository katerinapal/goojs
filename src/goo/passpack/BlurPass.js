import { Material as Materialjs } from "../renderer/Material";
import { camera as FullscreenUtilsjs_camera, quad as FullscreenUtilsjs_quad } from "../renderer/pass/FullscreenUtils";
import { RenderTarget as RenderTargetjs } from "../renderer/pass/RenderTarget";
import { deepClone as ObjectUtilsjs_deepClone } from "../util/ObjectUtils";
import { copyPure as ShaderLibjs_copyPure, convolution as ShaderLibjs_convolution } from "../renderer/shaders/ShaderLib";
import { Pass as Pass_Passjs } from "../renderer/pass/Pass";
function BlurPass(settings) {
	settings = settings || {};

	this.target = settings.target !== undefined ? settings.target : null;
	var strength = settings.strength !== undefined ? settings.strength : 1.0;
	var sigma = settings.sigma !== undefined ? settings.sigma : 4.0;
	var kernelSize = 2 * Math.ceil(sigma * 3.0) + 1;
	this.downsampleAmount = settings.downsampleAmount !== undefined ? Math.max(settings.downsampleAmount, 1) : 4;

	this.blurX = [0.001953125, 0.0];
	this.blurY = [0.0, 0.001953125];

	var width = window.innerWidth || 1024;
	var height = window.innerHeight || 1024;
	this.updateSize({
		x: 0,
		y: 0,
		width: width,
		height: height
	});

	this.renderable = {
		meshData: FullscreenUtilsjs_quad,
		materials: []
	};

	this.copyMaterial = new Materialjs(ShaderLibjs_copyPure);
	this.copyMaterial.uniforms.opacity = strength;
	this.copyMaterial.blendState.blending = 'CustomBlending';

	this.convolutionShader = ObjectUtilsjs_deepClone(ShaderLibjs_convolution);
	this.convolutionShader.defines = {
		'KERNEL_SIZE_FLOAT': kernelSize.toFixed(1),
		'KERNEL_SIZE_INT': kernelSize.toFixed(0)
	};
	this.convolutionShader.uniforms.uImageIncrement = this.blurX;
	this.convolutionShader.uniforms.cKernel = this.convolutionShader.buildKernel(sigma);
	this.convolutionMaterial = new Materialjs(this.convolutionShader);

	this.enabled = true;
	this.clear = false;
	this.needsSwap = false;
}

BlurPass.prototype = Object.create(Pass_Passjs.prototype);
BlurPass.prototype.constructor = BlurPass;

BlurPass.prototype.destroy = function (renderer) {
	if (this.renderTargetX) {
		this.renderTargetX.destroy(renderer.context);
	}
	if (this.renderTargetY) {
		this.renderTargetY.destroy(renderer.context);
	}
	this.convolutionMaterial.shader.destroy();
	this.copyMaterial.shader.destroy();
};

BlurPass.prototype.invalidateHandles = function (renderer) {
	renderer.invalidateMaterial(this.convolutionMaterial);
	renderer.invalidateMaterial(this.copyMaterial);
	renderer.invalidateRenderTarget(this.renderTargetX);
	renderer.invalidateRenderTarget(this.renderTargetY);
	renderer.invalidateMeshData(this.renderable.meshData);
};

BlurPass.prototype.updateSize = function (size, renderer) {
	var sizeX = size.width / this.downsampleAmount;
	var sizeY = size.height / this.downsampleAmount;
	if (this.renderTargetX) {
		renderer._deallocateRenderTarget(this.renderTargetX);
	}
	if (this.renderTargetY) {
		renderer._deallocateRenderTarget(this.renderTargetY);
	}
	this.renderTargetX = new RenderTargetjs(sizeX, sizeY);
	this.renderTargetY = new RenderTargetjs(sizeX, sizeY);
};

BlurPass.prototype.render = function (renderer, writeBuffer, readBuffer) {
	this.renderable.materials[0] = this.convolutionMaterial;

	this.convolutionMaterial.setTexture('DIFFUSE_MAP', readBuffer);
	this.convolutionMaterial.uniforms.uImageIncrement = this.blurY;

	renderer.render(this.renderable, FullscreenUtilsjs_camera, [], this.renderTargetX, true);

	this.convolutionMaterial.setTexture('DIFFUSE_MAP', this.renderTargetX);
	this.convolutionMaterial.uniforms.uImageIncrement = this.blurX;

	renderer.render(this.renderable, FullscreenUtilsjs_camera, [], this.renderTargetY, true);

	this.renderable.materials[0] = this.copyMaterial;
	this.copyMaterial.setTexture('DIFFUSE_MAP', this.renderTargetY);

	if (this.target !== null) {
		renderer.render(this.renderable, FullscreenUtilsjs_camera, [], this.target, this.clear);
	} else {
		renderer.render(this.renderable, FullscreenUtilsjs_camera, [], readBuffer, this.clear);
	}
};

var exported_BlurPass = BlurPass;

/**
 * <pre>
 * settings: {
 *     target: null,
 *     strength: 1.0,
 *     sigma: 4.0,
 *     sizeX: 256,
 *     sizeY: 256
 * }
 * </pre>
 */
export { exported_BlurPass as BlurPass };