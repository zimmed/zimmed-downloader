const logger = require('../logger');

module.exports = function disconnect() {
    logger.info(`Disconnected from host.`);
};
