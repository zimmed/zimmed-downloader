const SocketManager = require('../util/socketmanager');
const EventManager = require('../util/eventmanager');
const Auth = require('../auth');
const logger = require('../logger');
const Config = require('../config').server;

module.exports = (model) => {
    let em = EventManager.create(Config.eventPath),
        sm = SocketManager.create('', Config.host, Config.port, model, em);

    return () => sm.init(middleware);
};

function middleware(socket, next) {
    let query = socket.handshake.query,
        auth = query && Auth.create(query);

    if (auth) {
        logger.debug(`Connection established for ${socket.id} -> ${auth.id}: ${(JSON).stringify(query)}`);
        socket.emit('new-session', {sessionId: auth.id});
        next();
    } else {
        logger.debug(`Connection rejected for ${socket.id}: ${(JSON).stringify(query)}`);
        socket.disconnect();
    }
}
