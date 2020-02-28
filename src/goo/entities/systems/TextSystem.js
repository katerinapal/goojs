import { System as System_Systemjs } from "../../entities/systems/System";
import { TextureGrid as TextureGridjs } from "../../shapes/TextureGrid";
import { MeshDataComponent as MeshDataComponentjs } from "../../entities/components/MeshDataComponent";
function TextSystem() {
	System_Systemjs.call(this, 'TextSystem', ['TextComponent']);
}

TextSystem.prototype = Object.create(System_Systemjs.prototype);
TextSystem.prototype.constructor = TextSystem;

TextSystem.prototype.process = function (entities) {
	for (var i = 0; i < entities.length; i++) {
		var entity = entities[i];
		var textComponent = entity.textComponent;
		if (textComponent.dirty) {
			if (entity.hasComponent('MeshDataComponent')) {
				entity.getComponent('MeshDataComponent').meshData = TextureGridjs_fromString(textComponent.text);
			}
			else {
				var meshData = TextureGridjs_fromString(textComponent.text);
				var meshDataComponent = new MeshDataComponentjs(meshData);
				entity.setComponent(meshDataComponent);
			}
			this.dirty = false;
		}
	}
};

var exported_TextSystem = TextSystem;

/**
 * Processes all entities with a text component<br>
 * @example-link http://code.gooengine.com/latest/visual-test/goo/entities/components/TextComponent/TextComponent-vtest.html Working example
 * @extends System
 */
export { exported_TextSystem as TextSystem };