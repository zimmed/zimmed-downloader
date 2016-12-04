const logger = require('../logger');

module.exports = function () {
    logger.info(`Client connected. ID: ${this.client.id}`);
};
