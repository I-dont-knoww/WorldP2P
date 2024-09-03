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
}