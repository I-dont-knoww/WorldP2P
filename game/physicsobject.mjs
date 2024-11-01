import LayerRenderer from '../client/renderer/layerrenderer.mjs';
import Path from '../client/renderer/path.mjs';

import { Vector, Vec2 } from '../utils/vector.mjs';

export default class PhysicsObject {
    /**
     * @param {Vec2} pos
     */
    constructor(pos) {
        this.pos = pos;
        this.vel = Vector.ZERO;
    }

    update() {
        this.pos.addInPlace(this.vel);
    }

    /**
     * @param {LayerRenderer} renderer
     */
    render(renderer) {
        const path = Path.CIRCLE(new Vec2(0, 0), 10);
        renderer.renderPath(0, LayerRenderer.renderType.FILL, path, { fillStyle: 'red' });
    }
}