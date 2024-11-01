import * as websocket from './websocket.mjs';
import { HeaderDecoder } from './decoder.mjs';
import { HeaderEncoder } from './encoder.mjs';
import headers from '../headers.mjs';

import { getSeed } from '../utils/random.mjs';
import EventEmitter from '../utils/eventemitter.mjs';
import GameHandler from './gamehandler.mjs';

import { MAXLOBBYSIZE } from '../game/game.mjs';

import { once } from 'events';

export const clientStates = {
    INQUEUE: 0,
    INLOBBY: 1,
    LEFT: 2
};
export const lobbyStates = {
    WAITING: 0,
    STARTED: 1,
    CLOSED: 2
};

const LobbyHandler = {
    queue: [],
    lobbies: [],

    initiate(server) {
        websocket.listen(server, async connection => {
            const newClient = this.handleClientJoin(connection);
            connection.on('close', this.handleClientClose.bind(this, newClient));

            console.log(`new client: ${newClient.connection.key}`);

            try {
                const isHostPromise = newClient.awaitMessageWithHeader(headers.client.ISHOST);

                newClient.send(HeaderEncoder(headers.server.OK));
                await newClient.awaitMessageWithHeader(headers.client.OK);
                newClient.send(HeaderEncoder(headers.server.YOURSOCKETKEY, Buffer.from(newClient.connection.key)));

                const isHost = (await isHostPromise)[0] == 1;
                if (isHost) this.hostGame(newClient);
                else this.joinGame(newClient);
            } catch (e) { }
        });
    },
    handleClientJoin(connection) {
        const newClient = new Client(connection, this);
        this.queue.push(newClient);
        return newClient;
    },
    handleClientClose(client) {
        console.log(`client ${client.connection.key} has left`); // maybe sus
        client.leave();
    },

    async hostGame(client) {
        try {
            console.log(`client ${client.connection.key} hosting game`);

            const newLobby = new Lobby(client);
            this.kickClient(client);

            this.lobbies.push(newLobby);
            client.send(HeaderEncoder(headers.server.OK));

            await client.awaitMessageWithHeader(headers.client.STARTGAME);
            client.send(HeaderEncoder(headers.server.OK));

            newLobby.startGame();
        } catch (e) { }
    },
    async joinGame(client) {
        try {
            client.send(HeaderEncoder(headers.server.OK));

            const lobbyKey = (await client.awaitMessageWithHeader(headers.client.JOINLOBBY)).toString('utf8');
            const lobbyToJoin = this.lobbies.find(v => v.key == lobbyKey);

            console.log(`client ${client.connection.key} joining game ${lobbyKey}`);

            if (typeof lobbyToJoin == 'undefined') {
                client.send(HeaderEncoder(headers.server.LOBBYNOTEXIST));
                client.connection.sendCloseFrame(1000, 'lobby does not exist');
            } else {
                if (lobbyToJoin.addClient(client)) {
                    this.kickClient(client);

                    client.send(HeaderEncoder(headers.server.OK));
                } else {
                    client.send(HeaderEncoder(headers.server.LOBBYNOTACCEPT));
                    client.connection.sendCloseFrame(1000, 'lobby did not accept join request');
                }
            }
        } catch (e) { }
    },

    kickClientIndex(index) {
        if (index < 0 || index >= this.queue.length) return null;

        const temp = this.queue[index];
        this.queue[index] = this.queue.at(-1);
        this.queue[this.queue.length - 1] = temp;
        this.queue.pop();
        return temp;
    },
    kickClient(client) {
        const index = this.queue.findIndex(v => v.connection.key == client.connection.key);
        if (index == -1) return null;

        return this.kickClientIndex(index);
    },

    leaveClient(client) {
        this.kickClient(client);
    },

    removeLobby(lobby) {
        if (lobby.players.length > 0) throw new Error('lobby being removed is not empty');

        const index = this.lobbies.findIndex(v => v.key == lobby.key);

        const temp = this.lobbies[index];
        this.lobbies[index] = this.lobbies.at(-1);
        this.lobbies[this.lobbies.length - 1] = temp;
        this.lobbies.pop();
    }
}; export default LobbyHandler;

export class Lobby extends EventEmitter {
    constructor(host) {
        super();

        this.players = [];
        this.addClient(host);

        this.key = host.connection.key;

        this.state = lobbyStates.WAITING;
    }

    startGame() {
        this.state = lobbyStates.STARTED;

        this.sendAllKeys();

        const seed = getSeed();
        this.sendRandomSeed(seed);

        GameHandler(this);
    }

    sendAllKeys() {
        const numberOfKeys = this.players.length;
        const sizeBuffer = Buffer.alloc(1);
        sizeBuffer.writeUint8(numberOfKeys);

        const keyBuffers = [];
        for (let i = 0; i < this.players.length; i++) {
            const key = this.players[i].connection.key;
            keyBuffers.push(Buffer.from(key, 'utf8'));
        }

        this.sendToAll(HeaderEncoder(headers.server.ALLSOCKETKEYS, Buffer.concat(keyBuffers)));
    }

    sendRandomSeed(seed) {
        const buffer = Buffer.alloc(4);
        buffer.writeUint32BE(seed);

        this.sendToAll(HeaderEncoder(headers.server.RANDOMSEED, buffer));
    }

    addClient(client) {
        if (this.state == lobbyStates.STARTED) return false;
        if (this.players.length == MAXLOBBYSIZE) return false;

        this.players.push(client);
        client.join(this.key);
        client.holder = this;

        this.sendToAll(HeaderEncoder(headers.server.NEWPLAYER));

        return true;
    }

    sendToAll(data) {
        for (let i = 0; i < this.players.length; i++) this.players[i].send(data);
    }

    kickClientIndex(index) {
        if (index < 0 || index >= this.players.length) return null;

        const temp = this.players[index];
        this.players[index] = this.players.at(-1);
        this.players[this.players.length - 1] = temp;
        this.players.pop();
        return temp;
    }

    kickClient(client) {
        const index = this.players.findIndex(v => v.connection.key == client.connection.key);
        if (index == -1) return null;

        return this.kickClientIndex(index);
    }

    leaveClient(client) {
        this.kickClient(client);
        this.emit('leave', client.connection.key);

        if (this.players.length == 0) LobbyHandler.removeLobby(this);
    }
}

class Client {
    constructor(connection, lobbyhander) {
        this.connection = connection;
        this.decoder = new HeaderDecoder(connection);

        this.holder = lobbyhander;
        this.state = clientStates.INQUEUE;

        this.abortController = new AbortController();
    }

    join(lobbyKey) {
        this.state = clientStates.INLOBBY;
    }

    leave() {
        this.abortController.abort();

        this.state = clientStates.LEFT;
        this.holder.leaveClient(this);
    }

    send(data) {
        this.connection.send(data);
    }

    async awaitMessageWithHeader(header) {
        const [val] = await once(this.decoder, header, { signal: this.abortController.signal });
        return val;
    }
}