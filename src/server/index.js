const _ = require('lodash');
const SocketManager = require('../util/socketmanager');
const EventManager = require('../util/eventmanager');
const defaultMW = require('./default.middleware');
const channelMW = require('./channel.middleware');
const Config = require('../config').server;

module.exports = (model) => {
    let channels = _.values(_.mapValues(Config.channels, (name, {eventPath}) => {
            return {
                em: EventManager.create(eventPath),
                channel: name !== 'default' && name,
                middleware: name === 'default' ? defaultMW : channelMW(name)
            };
        })),
        sm = SocketManager.create(Config.host, Config.port, channels, model);

    return () => sm.init();
};
