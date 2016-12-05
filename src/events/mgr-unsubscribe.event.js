const room = require('../config').server.updateChannel;

module.exports = function mgrSubscribe() {
    this.socket.leave(room);
};
