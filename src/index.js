const _ = require('lodash');
const Promise = require('bluebird');
const DownloadManager = require('./manager');
const Server = require('./server');
const logger = require('./logger');
const Config = require('./config');
const UPDATE_CHANNEL = require('./events/queue/channel');

let SM = null;
const getSM = () => SM ? Promise.resolve(SM) : Promise.reject() ;

module.exports = () => {
    DownloadManager.clearOutActive()
        .then(() => DownloadManager.getPreviouslyQueued())
        .then(queued => _.isArray(queued) && queued.length && queued)
        .then(queued => DownloadManager.create(mgrOpts, queued))
        .then(downloadManager => Server(downloadManager))
        .then(init => init())
        .then(socketManager => {
            SM = socketManager;
            logger.info(`Socket server listening at ${SM.host}:${SM.port}...`);
        })
        .catch(e => logger.error(`Failed to start socket server: ${e}`));
};

const mgrOpts = _.assign({
    onDLQueued: queueChange,
    onDLBegin: queueChange,
    onDLEnd: queueChange,
    onDLProcess: queueUpdate,
    onDLProgress: queueUpdate,
    onDLError: (mgr, con, error) => {
        logger.warn(`Downloader ERROR [${con.url}]: ${error}`);
    }
}, Config.downloader);

function queueChange(mgr, con) {
    getSM().then(sm => {
        sm.group().broadcast('mgr-queue-change', con.strip());
    });
}

function queueUpdate(mgr, con) {
    const progressProperties = [
        'transferred',
        'total',
        'eta',
        'rate',
        'progress'
    ];

    getSM().then(sm => {
        sm.group(UPDATE_CHANNEL).broadcast('mgr-queue-update', con.strip(progressProperties));
    });
}
