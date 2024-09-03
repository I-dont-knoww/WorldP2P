import { Vec2 } from '../../utils/vector.mjs';

export default class Mouse {
    static toButtonNumber = {
        left: 0,
        middle: 1,
        right: 2
    };
    static toButtonName = {
        0: 'left',
        1: 'middle',
        2: 'right'
    }

    /**
     * @param {Game} game 
     */
    constructor(game) {
        this.position = new Vec2(0, 0);

        this.left = { held: false, tap: false };
        this.middle = { held: false, tap: false };
        this.right = { held: false, tap: false };

        this.game = game;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} buttonNumber
     */
    mousedown(x, y, buttonNumber) {
        this.position.set(x, y);

        const buttonName = Mouse.toButtonName[buttonNumber];

        this[buttonName].held = true;
        this[buttonName].tap = true;
        this.game.on('postupdate', () => this[buttonName].tap = false);
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    mousemove(x, y) {
        this.position.set(x, y);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} button
     */
    mouseup(x, y, button) {
        this.position.set(x, y);

        const buttonName = Mouse.toButtonName[button];
        this[buttonName].held = false;
    }

    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const view = new DataView(new ArrayBuffer(2 * 2 + 1));
        view.setUint16(0, this.position.x, false);
        view.setUint16(2, this.position.y, false);

        view.setUint8(4,
            this.left.held << 0 |
            this.middle.held << 1 |
            this.right.held << 2 |
            this.left.tap << 3 |
            this.middle.tap << 4 |
            this.right.tap << 5
        );

        return new Uint8Array(view.buffer);
    }

    /**
     * @param {Uint8Array} data
     */
    deserialize(data) {
        const view = new DataView(data.buffer);

        const x = view.getUint16(0, false);
        const y = view.getUint16(2, false);
        this.position.set(x, y);

        const buttons = view.getUint8(4);

        this.left.held = (buttons & 0b00000001) != 0;
        this.middle.held = (buttons & 0b00000010) != 0;
        this.right.held = (buttons & 0b00000100) != 0;

        this.left.tap = (buttons & 0b00001000) != 0;
        this.middle.tap = (buttons & 0b00010000) != 0;
        this.right.tap = (buttons & 0b00100000) != 0;
    }
}