import PhysicsObject from './physicsobject.mjs';
import { Vector } from '../utils/vector.mjs';

import Input from './controls/input.mjs';

export const playerSpeed = 0.05;
export const socketKeyLength = 24;

export const playerSize = 10;

export const playerMinXY = 0;
export const playerMaxXY = 1000;

export default class PlayerObject extends PhysicsObject {
    /**
     * @param {Vec2} pos
     * @param {string} socketKey
     */
    constructor(pos, socketKey) {
        super(pos);

        this.socketKey = socketKey;
    }

    /**
     * @param {Object<string, Input>} inputs
     */
    update(inputs) {
        const input = inputs[this.socketKey];
        PlayerObject.moveWASD(this, input);

        this.vel.mulInPlace(0.9);
        super.update();
    }

    /**
     * @param {PhysicsObject} object
     * @param {Input} input
     */
    static moveWASD(object, input) {
        const keyboard = input.keyboard;

        const movementVector = Vector.ZERO;

        if (keyboard.held.has('KeyW')) movementVector.addInPlace(Vector.UP);
        if (keyboard.held.has('KeyA')) movementVector.addInPlace(Vector.LEFT);
        if (keyboard.held.has('KeyS')) movementVector.addInPlace(Vector.DOWN);
        if (keyboard.held.has('KeyD')) movementVector.addInPlace(Vector.RIGHT);

        object.vel.addInPlace(movementVector.normalize().mul(playerSpeed));
    }
}