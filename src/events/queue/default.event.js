/**
 * Handler for all uncaught events
 */

const logger = require('../../logger');
const channel = require('./channel');

module.exports = function defaultHandler(eventName, mgr, data) {
    logger.warn(`[${channel}] Uncaught event (${eventName}) from client ${this.client.id}: ${(JSON).stringify(data)}`);
};
