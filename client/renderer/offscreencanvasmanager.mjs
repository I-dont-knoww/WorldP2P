import Renderer from './renderer.mjs';

import { Vec2, Vector } from '../../utils/vector.mjs';

export default class OffscreenCanvasManager {
    constructor() {
        this.canvases = [];
    }

    /**
     * @param {number} id
     */
    getOffscreenCanvas(id) {
        return this.canvases[id];
    }

    /**
     * @callback OffscreenCanvasManager~offscreenCanvasCallback
     * @param {OffscreenCanvas} canvas
     * @param {Renderer} renderer
     */
    /**
     * @param {Vec2} size
     * @param {OffscreenCanvasManager~offscreenCanvasCallback} renderFunction
     */
    saveToOffscreenCanvas(size, renderFunction) {
        const canvas = new OffscreenCanvas(...size.components());
        const renderer = new Renderer(canvas);
        const id = this.canvases.push(canvas) - 1;

        renderFunction(canvas, renderer);
        return id;
    }
}