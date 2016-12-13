const _ = require('lodash');
const Manager = require('../manager');
const Config = require('../config');
const Auth = require('../auth');

const OK = 0;

module.exports = function mgrQueue(mgr, data) {
    let {destination, login, links} = data,
        dir = _.get(Config.libraries, destination, false),
        socket = this,
        out = _.map(links, meta=> {
            let e = meta.state === OK ? tryQ(mgr, dir, login, meta) : (meta.state !== OK && new Error('Bad link'));

            return e ? {url: meta.url, success: false, error: e} : {url: meta.url, success: true};
        });

    socket.emit('mgr-queue-response', Auth.response(out, true));
};

function tryQ(mgr, dir, login, metadata) {
    let out = false;

    try {
        Manager.queueDownload(mgr, dir, login, metadata);
    } catch (e) {
        out = e;
    }
    return out;
}
