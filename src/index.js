const _ = require('lodash');
const Promise = require('bluebird');
const DownloadManager = require('./manager');
const Server = require('./server');
const logger = require('./logger');
const Config = require('./config');
const Container = require('./manager/container');
const UPDATE_CHANNEL = require('./events/queue/channel');

let SM = null;
const getSM = () => SM ? Promise.resolve(SM) : Promise.reject() ;

module.exports = () => {
    DownloadManager.dbClearActive()
        .then(() => DownloadManager.dbGetQueued())
        .then(queued => _.isArray(queued) && _.map(queued, f => Container.createFromDB(f)))
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
        sm.group().broadcast('mgr-queue-change', con.stripForPub());
    });
}

function queueUpdate(mgr, con) {
    getSM().then(sm => {
        sm.group(UPDATE_CHANNEL).broadcast('mgr-queue-update', con.stripForUpdate());
    });
}
