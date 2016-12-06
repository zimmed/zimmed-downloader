const _ = require('lodash');
const Auth = require('../auth');
const createError = require('./error');
const Config = require('../config').server;

module.exports = function mgrSubscribe(mgr, channel) {
    if (_.has(Config.channels, channel)) {
        this.client.join(channel);
    } else {
        this.client.emit('subscribe-failure', Auth.response(createError('400')));
    }
};
