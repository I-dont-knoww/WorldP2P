import { socketKeyLength } from '../game/playerobject.mjs';

import { textDecoder } from '../utils/textDecoderAndEncoder.mjs';

import Input from '../game/controls/input.mjs';
import Game from '../game/game.mjs';
import headers from '../headers.mjs';

export default class InputsManager {
    /**
     * 
     * @param {Game} game
     */
    constructor(game) {
        this.inputs = {};
        this.game = game;

        const socketKeys = Object.keys(game.players);
        for (let i = 0; i < socketKeys.length; i++) this.inputs[socketKeys[i]] = new Input(game);

        this.game.on('leave', player => delete this.inputs[player.socketKey]);
    }

    listenForInputs() {
        return new Promise(resolve => {
            let inputsReceived = 0;
            
            const listenInputs = data => {
                const socketKey = textDecoder.decode(data.slice(0, socketKeyLength));
                const serializedInput = data.slice(socketKeyLength);
                
                this.inputs[socketKey].deserialize(new Uint8Array(serializedInput));
                
                inputsReceived++;
                
                if (inputsReceived == Object.keys(this.inputs).length) {
                    this.game.connection.decoder.off(headers.client.INPUTS, listenInputs);
                    this.game.off('leave', listenLeave);
                    resolve();
                }
            };

            const listenLeave = () => {
                inputsReceived++;
                console.log(`inputs received: ${inputsReceived}`);
                console.log(`inputs expected: ${Object.keys(this.inputs).length}`);

                if (inputsReceived >= Object.keys(this.inputs).length) {
                    this.game.connection.decoder.off(headers.client.INPUTS, listenInputs);
                    this.game.off('leave', listenLeave);
                    resolve();
                }
            }
            
            this.game.connection.decoder.on(headers.client.INPUTS, listenInputs);
            this.game.on('leave', listenLeave);
        });
    }
}