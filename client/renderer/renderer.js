import Game from '../../game/game.mjs';
import Path from './path.js';

import { Vec2, Vector } from '../../utils/vector.mjs';

export default class Renderer {
    static renderType = {
        FILL: 0,
        STROKE: 1
    };

    /**
     * @param {Element} canvas
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.canvasSize = new Vec2(canvas.width, canvas.height);

        this.ctx = canvas.getContext('2d');

        this.camera = {
            pos: Vector.ZERO,
            range: 2000
        };
    }

    /**
     * @param {Game} game
     */
    renderGameState(game) {
        this.ctx.clearRect(0, 0, ...this.canvasSize.components());

        for (let i = 0; i < game.objects.length; i++) {
            const object = game.objects[i];

            this.renderPath(Renderer.renderType.FILL, Path.CIRCLE(object.pos, 10), {
                fillStyle: 'black'
            });
        }
    }

    /**
     * @param {number} type
     * @param {Path} path
     * @param {Object<string, *>} settings
     */
    renderPath(type, path, settings) {
        Object.assign(this.ctx, settings);

        if (type == Renderer.renderType.FILL) this.ctx.fill(path);
        else if (type == Renderer.renderType.STROKE) this.ctx.stroke(path);
    }
}