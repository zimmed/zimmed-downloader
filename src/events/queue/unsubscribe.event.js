const channel = require('./channel');

module.exports = function() {
    this.client.leave(channel);
};
