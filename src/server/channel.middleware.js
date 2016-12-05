const logger = require('../logger');
const cache = require('../util/simple-cache')('socket-clients');

module.exports = (channel) => (socket, next) => {
    if (cache.has(socket.id)) {
        next();
    } else {
        logger.debug(`Connection rejected for ${socket.id}: Connecting to '${channel}' before default channel`);
        socket.disconnect();
    }
};
