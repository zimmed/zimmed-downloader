const Auth = require('../auth');
const logger = require('../logger');

let rejectCount = 0;
const rejectMax = 5;

module.exports = function auth(next, model, event) {
    let parsed = Auth.parseRequest(event);

    if (parsed === null) {
        logger.warn(`Auth Middleware rejected: ${(JSON).stringify(parsed)}`);
        if (rejectCount < rejectMax) {
            rejectCount += 1;
        } else {
            this.disconnect();
            logger.error(`Disconnected from host after ${rejectMax} requests failed authentication.`);
        }
    } else {
        logger.debug(`Auth Middleware accepted: ${(JSON).stringify(parsed)}`);
        next(model, parsed);
    }
};
