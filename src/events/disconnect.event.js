const logger = require('../logger');
const cache = require('../util/simple-cache')('socket-clients');

module.exports = function disconnect() {
    logger.info(`Client disconnected. ID: ${this.client.id}`);
    cache.del(this.client.id);
};
