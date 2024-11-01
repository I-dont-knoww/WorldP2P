import { Vec2, Vector } from '../../utils/vector.mjs';
import { awaitDOMEvent } from '../../utils/promise.mjs';

export default class Path extends Path2D {
    /**
     * @param {Vec2} pos
     * @param {number} radius
     * @param {Object<string, *>} properties
     * @returns {Path}
     */
    static CIRCLE(pos, radius, properties) {
        const path = new Path();

        path.arc(...pos.components(), radius, 0, 2 * Math.PI);
        Object.assign(path, properties);

        return path;
    }

    /**
     * @param {Vec2} pos
     * @param {Vec2} radius
     * @param {Object<string, *>} properties
     * @returns {Path}
     */
    static ELLIPSE(pos, radius, properties) {
        const path = new Path();

        path.ellipse(...pos.components(), ...radius.components(), 0, 0, 2 * Math.PI);
        Object.assign(path, properties);

        return path;
    }

    /**
     * @param {Vec2} corner1
     * @param {Vec2} corner2
     * @param {Object<string, *>} properties
     * @returns {Path}
     */
    static RECT(corner1, corner2, properties) {
        const path = new Path();

        path.rect(...corner1.components(), ...corner2.sub(corner1).components());
        Object.assign(path, properties);

        return path;
    }

    /**
     * @param {Vec2} pos1
     * @param {Vec2} pos2
     * @param {Object<string, *>} properties
     * @returns {Path}
     */
    static LINE(pos1, pos2, properties) {
        const path = new Path();

        path.moveTo(...pos1.components());
        path.lineTo(...pos2.components());
        Object.assign(path, properties);

        return path;
    }

    /**
     * @param {Path2D|String} [input]
     */
    constructor(input) {
        super(input);

        this.rotateAngle = 0;
        this.rotateOrigin = Vector.ZERO;
    }
}