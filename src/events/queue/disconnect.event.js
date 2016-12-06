const logger = require('../../logger');
const channel = require('./channel');

module.exports = function disconnect() {
    logger.info(`Client disconnected from ${channel}. ID: ${this.client.id}`);
};
