const _ = require('lodash');
const logger = require('../logger');
const Auth = require('../auth');

module.exports = function connection() {
    logger.info(`Connection to host established. Client ID: ${this.id}`);
    this.emit('auth-key', Auth.response({pubKey: Auth.createPair()}));
};
