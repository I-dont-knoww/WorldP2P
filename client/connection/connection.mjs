import EventEmitter from '../../utils/eventemitter.mjs';
import { awaitDOMEvent } from '../../utils/promise.mjs';
import headers from '../../headers.mjs';

import { HeaderDecoder } from './decoder.mjs';
import { HeaderEncoder } from './encoder.mjs';

import { textDecoder } from '../../utils/textDecoderAndEncoder.mjs';

export default async function createConnection(url) {
    const socket = new WebSocket(url);
    socket.binaryType = 'arraybuffer';

    await awaitDOMEvent('message', socket);

    return new Connection(socket);
}

export class Connection extends EventEmitter {
    /**
     * @param {WebSocket} socket
     */
    constructor(socket) {
        super();

        this.socket = socket;
        this.createListeners();
        this.decoder = new HeaderDecoder(this);

        this.key = undefined;
    }

    createListeners() {
        this.socket.addEventListener('open', () => this.emit('open'));
        this.socket.addEventListener('message', event => this.emit('message', event.data));
        this.socket.addEventListener('close', event => this.emit('close', event.code, event.reason));

        this.socket.addEventListener('error', error => this.emit('error', error));
    }

    /**
     * @param {boolean} isHost
     */
    async initiate() {
        this.send(HeaderEncoder(headers.client.OK));
        this.key = textDecoder.decode(await this.awaitMessageWithHeader(headers.server.YOURSOCKETKEY));
    }

    /**
     * @param {Uint8Array|ArrayBuffer} data
     */
    send(data) {
        this.socket.send(data);
    }

    /**
     * @param {string} header
     * @returns {Promise<Uint8Array>}
     */
    async awaitMessageWithHeader(header) {
        return new Promise(resolve => {
            this.decoder.once(header, resolve);
        });
    }
}