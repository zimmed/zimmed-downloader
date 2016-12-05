const createError = require('./error');
const Auth = require('../auth');
const logger = require('../logger');

module.exports = function auth(next, model, event) {
    let parsed = Auth.parseRequest(event);

    if (parsed === null) {
        logger.debug(`Auth Middleware rejected for ${this.client.id}: ${(JSON).stringify(parsed)}`);
        this.client.emit('disconnect', createError('401'));
        this.client.disconnect();
    } else {
        logger.debug(`Auth Middleware accepted for ${this.client.id}: ${(JSON).stringify(parsed)}`);
        next(model, parsed);
    }
};
