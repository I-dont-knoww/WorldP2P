import Keyboard from './keyboard.mjs';
import Mouse from './mouse.mjs';

import Game from '../game.mjs';

export default class Input {
    /**
     * @param {Game} game
     */
    constructor(game) {
        this.keyboard = new Keyboard(game);
        this.mouse = new Mouse(game);
    }

    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const mouseSerialized = this.mouse.serialize();
        const keyboardSerialized = this.keyboard.serialize();

        const serialized = new Uint8Array(mouseSerialized.byteLength + keyboardSerialized.byteLength);
        serialized.set(mouseSerialized, 0);
        serialized.set(keyboardSerialized, mouseSerialized.byteLength);

        return serialized;
    }

    /**
     * @param {Uint8Array} serialized
     */
    deserialize(serialized) {
        const mouseSerialized = serialized.slice(0, 5);
        this.mouse.deserialize(mouseSerialized);

        const keyboardSerialized = serialized.slice(5);
        this.keyboard.deserialize(keyboardSerialized);
    }

    /**
     * @param {Input} input
     */
    static listenToClient(input) {
        window.addEventListener('keydown', event => input.keyboard.keydown(event.code));
        window.addEventListener('keyup', event => input.keyboard.keyup(event.code));

        window.addEventListener('mousedown', event => input.mouse.mousedown(event.screenX, event.screenY, event.button));
        window.addEventListener('mousemove', event => input.mouse.mousemove(event.screenX, event.screenY));
        window.addEventListener('mouseup', event => input.mouse.mouseup(event.screenX, event.screenY, event.button));
    }
}