/**
 * Handler for all uncaught events
 */

const logger = require('../logger');

module.exports = function defaultHandler(eventName, model, data) {
    logger.warn(`Uncaught event [${eventName}] from client ${this.client.id}: ${(JSON).stringify(data)}`);
};
