const logger = require('../logger');

module.exports = function connection(args) {
    logger.info(`Client connected. ID: ${this.client.id}`);
};
