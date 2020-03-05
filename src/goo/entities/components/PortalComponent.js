import { Component as Componentjs } from "../../entities/components/Component";
import { RenderTarget as RenderTargetjs } from "../../renderer/pass/RenderTarget";
function PortalComponent(camera, height, options, overrideMaterial) {
	Componentjs.apply(this, arguments);

	height = height || 200;

	this.options = options || {};
	this.options.preciseRecursion = !!this.options.preciseRecursion;
	this.options.autoUpdate = this.options.autoUpdate !== false;

	this.overrideMaterial = overrideMaterial;

	this.doUpdate = true;

	var aspect = camera.aspect;

	this.type = 'PortalComponent';

	/**
	 * @type {Camera}
	 */
	this.camera = camera;

	/**
	 * @type {RenderTarget}
	 */
	this.target = new RenderTargetjs(height, height / aspect);

	if (this.options.preciseRecursion) {
		this.secondaryTarget = new RenderTargetjs(height, height / aspect);
	}

	// @ifdef DEBUG
	Object.seal(this);
	// @endif
}

PortalComponent.type = 'PortalComponent';

PortalComponent.prototype = Object.create(Componentjs.prototype);
PortalComponent.prototype.constructor = PortalComponent;

/**
 * Requests a rendering to be done to the material of the host object
 */
PortalComponent.prototype.requestUpdate = function () {
	this.doUpdate = true;
};

var exported_PortalComponent = PortalComponent;

/**
 * Renders to the texture of the host object<br>
 * @example-link http://code.gooengine.com/latest/visual-test/goo/entities/components/PortalComponent/PortalComponent-vtest.html Working example
 * @param {Camera} camera The camera used for rendering
 * @param {number} [height=200] Height of the texture to render to (the width is calculated automatically from the camera's aspect ratio)
 * @param {Object} options
 * @param {boolean} [options.autoUpdate=true] If set to true then updating is done every frame, otherwise updating is done only when solicited via the `requestUpdate` method
 * @param {boolean} [options.preciseRecursion=false] By default the "portal depth" (the number of portals seen through a portal) is of 4. By enabling this option the limitation disappears, but at the cost of using more memory.
 * @param {Material} [overrideMaterial=null] Optional override material to use when rendering to the host object
 * @extends Component
 */
export { exported_PortalComponent as PortalComponent };