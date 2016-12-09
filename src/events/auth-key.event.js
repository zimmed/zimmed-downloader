const _ = require('lodash');
const Promise = require('bluebird');
const logger = require('../logger');
const Auth = require('../auth');
const Manager = require('../manager');

module.exports = function connection(mgr, data) {
    if (_.has(data, 'pubKey')) {
        Auth.setPublicKey(data.pubKey);
        Promise
            .all(Manager.dbGetActive(), Manager.dbGetQueued())
            .spread((active, queued) => {
                this.emit('mgr-queue-list', Auth.response({active, queued}, true));
            });
    } else {
        this.disconnect();
        logger.error(`Disconnected from host after providing invalid auth-key request.`);
    }
};
