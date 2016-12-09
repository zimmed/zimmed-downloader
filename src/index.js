const _ = require('lodash');
const Promise = require('bluebird');
const DownloadManager = require('./manager');
const Client = require('./client');
const logger = require('./logger');
const Config = require('./config');
const Container = require('./manager/container');

let SM = null;
const getSM = () => SM ? Promise.resolve(SM) : Promise.reject() ;

module.exports = () => {
    DownloadManager.dbClearActive()
        .then(() => DownloadManager.dbGetQueued())
        .then(queued => _.isArray(queued) && _.map(queued, f => Container.createFromDB(f)))
        .then(queued => DownloadManager.create(mgrOpts, queued))
        .then(downloadManager => Client(downloadManager))
        .then(init => init())
        .then(socketManager => {
            SM = socketManager;
            logger.info(`Listening to host at ${SM.host}:${SM.port}...`);
        })
        .catch(e => logger.error(`Failed to connect to socket server: ${e}`));
};

const mgrOpts = _.assign({
    onDLQueued: queueChange,
    onDLBegin: queueChange,
    onDLEnd: queueChange,
    onDLError: (mgr, con, error) => {
        logger.warn(`Downloader ERROR [${con.url}]: ${error}`);
    }
}, Config.downloader);

function queueChange(mgr, con) {
    getSM().then(sm => {
        sm.connection.emit('mgr-queue-change', con.stripForPub());
    });
}
