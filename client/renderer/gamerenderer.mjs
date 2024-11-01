import LayerRenderer from './layerrenderer.mjs';

import Game from '../../game/game.mjs';
import { Vec2 } from '../../utils/vector.mjs';

export default class GameRenderer {
    /**
     * @param {Vec2} canvasSize
     */
    constructor(canvasSize) {
        this.layerRenderer = new LayerRenderer(canvasSize);
    }

    /**
     * @param {Game} game
     */
    renderGameState(game) {
        this.layerRenderer.clear();
        
        for (let i = 0; i < game.objects.length; i++) {
            const object = game.objects[i];

            object.render(this.layerRenderer);
        }
    }
}