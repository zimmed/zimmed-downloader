const _ = require('lodash');
const path = require('path');
const Auth = require('./auth');
const SocketManager = require('zimmed-socket-client');
const EventManager = require('zimmed-event');
const Config = require('../config').governor;

module.exports = (model) => {
    let sm = SocketManager.create(
        Config.host,
        Config.port,
        EventManager.create(Config.eventPath),
        model,
        Config.channel
    );

    return () => sm.init(Auth.buildConnectionQuery());
};
