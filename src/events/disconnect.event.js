const logger = require('../logger');

module.exports = function () {
    logger.info(`Client disconnected. ID: ${this.client.id}`);
};
