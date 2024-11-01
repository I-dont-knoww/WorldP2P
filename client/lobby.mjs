import createConnection, { Connection } from './connection/connection.mjs';

import { textDecoder, textEncoder } from '../utils/textDecoderAndEncoder.mjs';
import { awaitDOMEvent, resolveTo } from '../utils/promise.mjs';
import { HeaderEncoder } from './connection/encoder.mjs';

import { MAXLOBBYSIZE } from '../game/game.mjs';

import { socketKeyLength } from '../game/playerobject.mjs';
import headers from '../headers.mjs';

export const joinResults = {
    OK: 0,
    NOTEXIST: 1,
    NOTACCEPT: 2
}

export default {
    initiate() {
        this.startMenu = document.querySelector('#startMenu');
        this.hostMenu = document.querySelector('#hostMenu');
        this.joinMenu = document.querySelector('#joinMenu');
        this.joinFailMenu = document.querySelector('#joinFailMenu');

        this.hostButton = document.querySelector('#startMenu>#hostButton');
        this.joinCodeInput = document.querySelector('#startMenu>#joinCodeInput');
        this.joinButton = document.querySelector('#startMenu>#joinButton');

        this.startGameButton = document.querySelector('#hostMenu>#startGameButton');
        this.lobbyCode = document.querySelector('#hostMenu>#lobbyCode');
        this.playerCount = document.querySelector('#hostMenu>#playerCount');

        this.joinInformation = document.querySelector('#joinMenu>#joinInformation');
        this.joinFailText = document.querySelector('#joinFailMenu>#joinFailText');

        this.hostMenu.style.display = 'none';
        this.joinMenu.style.display = 'none';
        this.joinFailMenu.style.display = 'none';
    },

    /**
     * @returns {Promise<boolean>}
     */
    async askUserForHost() {
        const isHost = await Promise.any([awaitDOMEvent('click', hostButton, true), awaitDOMEvent('click', joinButton, false)]);
        startMenu.style.display = 'none';

        return isHost;
    },

    /**
     * @param {string} url
     * @returns {Promise<Connection>}
     */
    async initiateConnection(url) {
        const connection = await createConnection(url);
        await connection.initiate();

        return connection;
    },

    /**
     * @param {Connection} connection
     */
    async hostGameMessageSequence(connection) {
        connection.send(HeaderEncoder(headers.client.ISHOST, new Uint8Array([1])));
        await connection.awaitMessageWithHeader(headers.server.OK);

        this.hostMenu.style.display = 'block';

        this.lobbyCode.innerText = connection.key;

        let players = 1;
        this.playerCount.innerText = `${players}/${MAXLOBBYSIZE}`;
        connection.decoder.on(headers.server.NEWPLAYER, () => {
            players++;
            this.playerCount.innerText = `${players}/${MAXLOBBYSIZE}`;
        });

        await awaitDOMEvent('click', this.startGameButton);

        this.hostMenu.style.display = 'none';

        connection.send(HeaderEncoder(headers.client.STARTGAME));
        await connection.awaitMessageWithHeader(headers.server.OK);
    },
    /**
     * @param {Connection} connection
     */
    async joinGameMessageSequence(connection) {
        connection.send(HeaderEncoder(headers.client.ISHOST, new Uint8Array([0])));
        await connection.awaitMessageWithHeader(headers.server.OK);

        connection.send(HeaderEncoder(headers.client.JOINLOBBY, textEncoder.encode(this.joinCodeInput.value)));
        const result = await Promise.any([
            resolveTo(connection.awaitMessageWithHeader(headers.server.OK), joinResults.OK),
            resolveTo(connection.awaitMessageWithHeader(headers.server.LOBBYNOTEXIST), joinResults.NOTEXIST),
            resolveTo(connection.awaitMessageWithHeader(headers.server.LOBBYNOTACCEPT), joinResults.NOTACCEPT),
        ]);

        if (result == joinResults.NOTEXIST) {
            this.joinFailMenu.style.display = 'block';
            this.joinFailText.innerText = 'Lobby does not exist.';
            throw new Error('requested lobby does not exist');
        } else if (result == joinResults.NOTACCEPT) {
            this.joinFailMenu.style.display = 'block';
            this.joinFailText.innerText = 'Lobby did not accept join request (lobby was full or already started game).';
            throw new Error('requested lobby did not accept join request');
        } else this.joinMenu.style.display = 'block';
    },

    /**
     * @param {Connection} connection
     * @returns {Promise<{ socketKeys: string[], randomseed: number }>}
     */
    async startGame(connection) {
        const socketKeys = await this.getSocketKeys(connection);
        const randomseed = new Uint32Array(await connection.awaitMessageWithHeader(headers.server.RANDOMSEED))[0];

        this.hostMenu.style.display = 'none';
        this.joinMenu.style.display = 'none';

        return { socketKeys, randomseed };
    },
    /**
     * @param {Connection} connection
     * @returns {Promise<string[]>}
     */
    async getSocketKeys(connection) {
        const socketKeysBuffer = new Uint8Array(await connection.awaitMessageWithHeader(headers.server.ALLSOCKETKEYS));

        const socketKeys = [];
        for (let offset = 0; offset < socketKeysBuffer.byteLength; offset += socketKeyLength)
            socketKeys.push(textDecoder.decode(socketKeysBuffer.slice(offset, offset + socketKeyLength)));

        return socketKeys;
    }
}