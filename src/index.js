const DownloadManager = require('./manager');
const Server = require('./server');
const logger = require('./logger');

module.exports = () => {
    let model = DownloadManager.create(),
        init = Server(model);

    init().then(sm => {
        logger.info(`Socket server listening at ${sm.host}:${sm.port}...`);
    }).catch(e => {
        logger.error(`Failed to start socket server: ${e}`);
    });
};
