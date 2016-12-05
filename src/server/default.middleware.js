const Auth = require('../auth');
const logger = require('../logger');
const cache = require('../util/simple-cache')('socket-clients');

module.exports = (socket, next) => {
    let query = socket.handshake.query,
        auth = query && Auth.create(query);

    if (auth) {
        logger.debug(`Connection established for ${socket.id} -> ${auth.id}: ${(JSON).stringify(query)}`);
        cache.set(socket.id, auth.id);
        socket.emit('new-session', Auth.response({sessionId: auth.id}));
        next();
    } else {
        logger.debug(`Connection rejected for ${socket.id}: ${(JSON).stringify(query)}`);
        socket.disconnect();
    }
};
