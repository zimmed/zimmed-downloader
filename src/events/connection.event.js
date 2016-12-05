const _ = require('lodash');
const logger = require('../logger');
const Auth = require('../auth');

module.exports = function connection(mgr) {
    let simpleQ = {
        active: _.map(mgr.active, c => { return {name: c.name, state: c.state}; }),
        queue: _.map(mgr.queue, c => { return {name: c.name, state: c.state}; })
    };

    logger.info(`Client connected. ID: ${this.client.id}`);
    this.client.emit('mgr-file-list', Auth.response(simpleQ));
};
