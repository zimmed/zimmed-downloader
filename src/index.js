const Promise = require('bluebird');
const DownloadManager = require('./manager');
const Server = require('./server');
const logger = require('./logger');
const Config = require('./config');
const updateChannel = Config.server.updateChannel;

let SM = null;
const getSM = () => SM ? Promise.resolve(SM) : Promise.reject() ;

module.exports = () => {
    let model = DownloadManager.create(mgrOpts),
        init = Server(model);

    init().then(sm => {
        SM = sm;
        logger.info(`Socket server listening at ${sm.host}:${sm.port}...`);
    }).catch(e => {
        logger.error(`Failed to start socket server: ${e}`);
    });
};

const mgrOpts = _.assign({
    onDLQueued: (mgr, con) => {
        getSM()
            .then(sm => {
                sm.connectionGroup.broadcast('')
            })
    },
    onDLBegin: (mgr, con) => {

    },

}, Config.downloader);
