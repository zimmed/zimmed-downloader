/**
 * Handler for all uncaught events
 */

const logger = require('../logger');

module.exports = function defaultHandler(eventName, mgr, data) {
    logger.warn(`Uncaught event (${eventName}): ${(JSON).stringify(data)}`);
};
