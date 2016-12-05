const room = require('../config').server.updateChannel;

module.exports = function mgrSubscribe(mgr) {
    this.socket.join(room);
};
