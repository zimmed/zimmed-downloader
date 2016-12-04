const SocketManager = require('../util/socketmanager');
const EventManager = require('../util/eventmanager');
const Config = require('../config').server;

module.exports = (model) => {
    let em = EventManager.create(Config.eventPath),
        sm = SocketManager.create(Config.name, Config.host, Config.port, model, em);

    return () => sm.init();
};
