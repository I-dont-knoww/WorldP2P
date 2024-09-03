import Lobby from './lobby.js';

import { textEncoder } from '../utils/textDecoderAndEncoder.mjs';
import { HeaderEncoder } from './connection/encoder.js';

import Game from '../game/game.mjs';
import Random from '../utils/random.mjs';

import Input from '../game/controls/input.mjs';
import InputsManager from './inputsmanager.js';

import headers from '../headers.mjs';

Lobby.initiate();

const isHost = await Lobby.askUserForHost();
console.log(`is host: ${isHost}`);

const connection = await Lobby.initiateConnection('ws://localhost:8000');
console.log(`connection made`);

if (isHost) await Lobby.hostGameMessageSequence(connection);
else await Lobby.joinGameMessageSequence(connection);
console.log(`host/join sequence made`);

const { socketKeys, randomseed } = await Lobby.startGame(connection);
const game = new Game(Game.createPlayers(socketKeys), connection, new Random(randomseed));

const clientInput = new Input(game);
Input.listenToClient(clientInput);

const inputsManager = new InputsManager(game);

while (true) {
    const inputManagerPromise = inputsManager.listenForInputs();

    const serializedInput = clientInput.serialize();
    const inputsMessage = new Uint8Array(game.connection.key.length + serializedInput.length);
    inputsMessage.set(textEncoder.encode(game.connection.key));
    inputsMessage.set(serializedInput, game.connection.key.length);
    game.connection.send(HeaderEncoder(headers.client.REFLECT, HeaderEncoder(headers.client.INPUTS, inputsMessage)));

    await inputManagerPromise;

    game.update(inputsManager.inputs);
}