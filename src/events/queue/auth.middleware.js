const createError = require('../error');
const Auth = require('../../auth');
const logger = require('../../logger');
const channel = require('./channel');
const cache = require('../../util/simple-cache')('socket-clients');

module.exports = function auth(next, model, event) {
    let parsed = Auth.parseRequest(event, cache.get(this.client.id));

    if (parsed === null) {
        logger.debug(`[${channel}] Auth Middleware rejected for ${this.client.id}: ${(JSON).stringify(parsed)}`);
        this.client.emit('disconnect', Auth.response(createError('401')));
        this.client.disconnect();
        cache.del(this.client.id);
    } else {
        logger.debug(`[${channel}] Auth Middleware accepted for ${this.client.id}: ${(JSON).stringify(parsed)}`);
        next(model, parsed);
    }
};
