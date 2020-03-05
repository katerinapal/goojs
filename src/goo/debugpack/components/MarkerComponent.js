import { Component as Componentjs } from "../../entities/components/Component";
import { BoundingVolumeMeshBuilder as BoundingVolumeMeshBuilderjs } from "../../debugpack/BoundingVolumeMeshBuilder";
function MarkerComponent(hostEntity) {
	Componentjs.apply(this, arguments);

	this.type = 'MarkerComponent';

	var hostModelBound = hostEntity.meshRendererComponent.worldBound;
	//this.meshData = ShapeCreator.createBox(hostModelBound.radius * 2, hostModelBound.radius * 2, hostModelBound.radius * 2);
	this.meshData = BoundingVolumeMeshBuilderjs.build(hostModelBound);
}

MarkerComponent.prototype = Object.create(Componentjs.prototype);
MarkerComponent.prototype.constructor = MarkerComponent;

var exported_MarkerComponent = MarkerComponent;

/**
 * Holds the necessary data for a marker
 * @param {Entity} entity The entity this component is attached to
 * @extends Component
 */
export { exported_MarkerComponent as MarkerComponent };