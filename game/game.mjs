import EventEmitter from '../utils/eventemitter.js';

import { Vector } from '../utils/vector.mjs';
import PlayerObject from './playerobject.mjs';

import Input from './controls/input.mjs';
import Random from '../utils/random.mjs';
import { Connection } from '../client/connection/connection.js';

export default class Game extends EventEmitter {
    /**
     * @param {Object<string, PlayerObject>} players
     * @param {Connection} connection
     * @param {Random} random
     */
    constructor(players, connection, random) {
        super();

        this.connection = connection;
        this.random = random;

        this.players = players;
        this.playerCount = Object.keys(players).length;

        this.objects = Object.values(players);

        this.step = 0;
    }

    /**
     * @param {Object<string, Input>} inputs
     */
    update(inputs) {
        this.emit('preupdate');

        this.updateObjects(inputs);
        this.deleteNecessaryObjects();
        this.step++;

        this.emit('postupdate');
    }

    /**
     * @param {Object<string, Input>} inputs
     */
    updateObjects(inputs) {
        for (let i = 0; i < this.objects.length; i++) this.objects[i].update(inputs, this);
    }

    deleteNecessaryObjects() {
        for (let i = this.objects.length - 1; i >= 0; i--) if (this.objects[i].remove) {
            const temp = this.objects[i];
            this.objects[i] = this.objects.at(-1);
            this.objects[this.objects.length - 1] = temp;
            this.objects.pop();
        }
    }

    /**
     * @param {string[]} socketKeys
     * @returns {Object<string, PlayerObject>}
     */
    static createPlayers(socketKeys) {
        const players = {};
        for (let i = 0; i < socketKeys.length; i++) {
            const socketKey = socketKeys[i];
            players[socketKey] = new PlayerObject(Vector.ZERO, socketKey);
        }
        return players;
    }
}