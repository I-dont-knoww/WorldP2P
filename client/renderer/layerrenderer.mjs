import Renderer from './renderer.mjs';

import { Vec2, Vector } from '../../utils/vector.mjs';

export default class LayerRenderer {
    static renderType = {
        FILL: 0,
        STROKE: 1
    };

    /**
     * @param {Vec2} canvasSize
     */
    constructor(canvasSize) {
        this.canvases = {};
        this.canvasSize = canvasSize;

        this.renderers = [];

        this.camera = {
            pos: Vector.ZERO,
            range: 2000
        };
    }

    /**
     * @param {number} layer
     */
    #createLayer(layer) {
        if (this.canvases[layer]) return;

        const newCanvas = document.createElement('canvas');
        
        newCanvas.width = this.canvasSize.x;
        newCanvas.height = this.canvasSize.y;

        newCanvas.style.position = 'absolute';
        newCanvas.style.top = '0px';
        newCanvas.style.left = '0px';

        newCanvas.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        newCanvas.style.zIndex = layer;

        this.canvases[layer] = newCanvas;
        this.renderers[layer] = new Renderer(newCanvas);
        document.body.appendChild(newCanvas);
    }

    clear() {
        for (let renderer of this.renderers) renderer.clear();
    }

    /**
     * @param {number} layer
     * @param {number} type
     * @param {Path} path
     * @param {Object<string, *>} settings
     */
    renderPath(layer, type, path, settings) {
        this.#createLayer(layer);
        this.renderers[layer].renderPath(type, path, settings);
    }

    /**
     * @param {number} layer
     * @param {string|HTMLImageElement|SVGImageElement|HTMLCanvasElement|ImageBitmap|OffscreenCanvas} image
     * @param {Vec2} pos
     * @param {Object<string, *>} settings
     */
    renderImage(layer, image, pos, settings) {
        this.#createLayer(layer);
        this.renderers[layer].renderPath(image, pos, settings);
    }
}