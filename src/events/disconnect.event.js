const logger = require('../logger');

module.exports = function disconnect() {
    logger.info(`Client disconnected. ID: ${this.client.id}`);
};
