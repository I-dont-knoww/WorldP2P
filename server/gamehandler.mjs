import { Lobby } from './lobby.mjs';
import { HeaderEncoder } from './encoder.mjs';

import { textEncoder } from '../utils/textDecoderAndEncoder.mjs';
import headers from '../headers.mjs';

/**
 * @param {Lobby} lobby
 */
export default function GameHandler(lobby) {
    for (let i = 0; i < lobby.players.length; i++) {
        const player = lobby.players[i];

        player.decoder.on(headers.client.REFLECT, data => lobby.sendToAll(data));
    }

    lobby.on('leave', socketKey => lobby.sendToAll(HeaderEncoder(headers.server.LEAVE, textEncoder.encode(socketKey))));
}