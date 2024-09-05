import Lobby from './lobby.js';

import { Vec2, Vector } from '../utils/vector.mjs';

import { textEncoder } from '../utils/textDecoderAndEncoder.mjs';
import { HeaderEncoder } from './connection/encoder.js';

import Game from '../game/game.mjs';
import Random from '../utils/random.mjs';

import Input from '../game/controls/input.mjs';
import InputsManager from './inputsmanager.js';

import Path from './renderer/path.js';
import Renderer from './renderer/renderer.js';

import headers from '../headers.mjs';
import { sleepWorker } from '../utils/timer.mjs';

const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const renderer = new Renderer(canvas);

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

function draw() {
    renderer.renderGameState(game);
    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

while (true) {
    const inputManagerPromise = inputsManager.listenForInputs();

    const serializedInput = clientInput.serialize();
    const inputsMessage = new Uint8Array(game.connection.key.length + serializedInput.length);
    inputsMessage.set(textEncoder.encode(game.connection.key));
    inputsMessage.set(serializedInput, game.connection.key.length);
    game.connection.send(HeaderEncoder(headers.client.REFLECT, HeaderEncoder(headers.client.INPUTS, inputsMessage)));

    await Promise.all([inputManagerPromise, sleepWorker(1000 / 60)]);

    game.update(inputsManager.inputs);
}