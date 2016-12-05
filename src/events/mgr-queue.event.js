const _ = require('lodash');
const Manager = require('../manager');
const Downloader = require('../downloader');
const createError = require('./error');
const Config = require('../config');

module.exports = function mgrQueue(mgr, data) {
    let {destination, login, urls} = data,
        out = _.map(urls, url => { return {url, success: false, error: 'bad link'}; });
        dir = _.get(Config.libraries, destination, false);

    return dir && urls
        ? Downloader.getMetadata(...urls)
            .then(arr => _.forEach(arr, metadata => _.assign(
                _.find(out, {url: metadata.url}),
                tryQ(mgr, dir, login, metadata)
            )))
            .then(() => {
                this.client.emit('mgr-queue.success', out);
            })
            .catch(e => {
                this.client.emit('mgr-queue.failure', createError('400', e));
            })
        : this.client.emit('mgr-queue.failure', createError('400'));
};

function tryQ(mgr, dir, login, metadata) {
    let out;

    try {
        Manager.queueDownload(mgr, dir, login, metadata);
        out = {success: true};
    } catch (e) {
        out = {success: false, error: e};
    }
    return out;
}
