import Path from './path.mjs';

import { Vec2, Vector } from '../../utils/vector.mjs';

export default class Renderer {
    static renderType = {
        FILL: 0,
        STROKE: 1
    };

    /**
     * @param {HTMLElement|OffscreenCanvas} canvas
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

    clear() {
        this.ctx.clearRect(0, 0, ...this.canvasSize.components());
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

    /**
     * @param {string|HTMLImageElement|SVGImageElement|HTMLCanvasElement|ImageBitmap|OffscreenCanvas} image
     * @param {Vec2} pos
     * @param {Object<string, *>} settings
     */
    renderImage(image, pos, settings) {
        const imageToDraw = typeof image == 'string' ? new Image(image) : image;
        Object.assign(this.ctx, settings);

        this.ctx.drawImage(imageToDraw, ...pos.components());
    }
}