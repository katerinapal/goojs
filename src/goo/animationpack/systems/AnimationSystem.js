import { System as Systemjs } from "../../entities/systems/System";
import { World as Worldjs } from "../../entities/World";
function AnimationSystem() {
	Systemjs.call(this, 'AnimationSystem', ['AnimationComponent']);
}

AnimationSystem.prototype = Object.create(Systemjs.prototype);

AnimationSystem.prototype.process = function () {
	for (var i = 0; i < this._activeEntities.length; i++) {
		var entity = this._activeEntities[i];
		var animationComponent = entity.animationComponent;
		animationComponent.update(Worldjs.time);
		animationComponent.apply(entity.transformComponent);
		animationComponent.postUpdate();
	}
};

AnimationSystem.prototype.pause = function () {
	this.passive = true;
	for (var i = 0; i < this._activeEntities.length; i++) {
		this._activeEntities[i].animationComponent.pause();
	}
};

AnimationSystem.prototype.resume = function () {
	this.passive = false;
	for (var i = 0; i < this._activeEntities.length; i++) {
		var entity = this._activeEntities[i];
		entity.animationComponent.resume();
	}
};

AnimationSystem.prototype.play = AnimationSystem.prototype.resume;

AnimationSystem.prototype.stop = function () {
	this.passive = true;
	for (var i = 0; i < this._activeEntities.length; i++) {
		var entity = this._activeEntities[i];
		entity.animationComponent.stop();
	}
};

var exported_AnimationSystem = AnimationSystem;

/**
 * Processes all entities with animation components, updating the animations
 * @extends System
 */
export { exported_AnimationSystem as AnimationSystem };