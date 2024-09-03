import { Lobby } from './lobby.mjs';
import headers from '../headers.mjs';

/**
 * @param {Lobby} lobby
 */
export default function GameHandler(lobby) {
    for (let i = 0; i < lobby.players.length; i++) {
        const player = lobby.players[i];

        player.decoder.on(headers.client.REFLECT, data => lobby.sendToAll(data));
    }
}