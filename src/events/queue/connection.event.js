const _ = require('lodash');
const logger = require('../../logger');
const Auth = require('../../auth');
const channel = require('./channel');

module.exports = function connection(mgr) {
    logger.info(`Client connected to ${channel}. ID: ${this.client.id}`);
};
