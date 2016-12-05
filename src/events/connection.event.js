const logger = require('../logger');

module.exports = function connection() {
    logger.info(`Client connected. ID: ${this.client.id}`);
};
