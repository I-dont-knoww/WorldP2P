import FileServer from './server/fileserver.mjs';
import LobbyHandler from './server/lobby.mjs';

const PORT = 8000 || process.env.PORT;

const server = FileServer('./', PORT);
LobbyHandler.initiate(server);