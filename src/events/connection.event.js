const _ = require('lodash');
const Promise = require('bluebird');
const logger = require('../logger');
const Auth = require('../auth');
const Manager = require('../manager');

module.exports = function connection(mgr) {
    logger.info(`Client connected. ID: ${this.client.id}`);
    Promise
        .all(Manager.dbGetActive(), Manager.dbGetQueued())
        .spread((active, queued) => {
            this.client.emit('mgr-queue-list', Auth.response({active, queued}));
        });
};
