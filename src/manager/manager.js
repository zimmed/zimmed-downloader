const _ = require('lodash');
const path = require('path');
const mktemp = require('mktemp');
const rmdir = require('rmdir');
const Container = require('./container');
const Downloader = require('../downloader');
const Login = require('./login');
const mv = require('../util/move-file');
const rm = require('../util/remove-file');
const State = Container.State;


const TEMP_DIR_MASK = 'dl-XXXXXXXX';

const Manager = module.exports = {

    create: ({
        autoStart=true,
        maxConcurrent=4,
        maxConnections=4,
        maxSpeed=0,
        progressTickRate=1,
        onDLProgress=_.noop,
        onDLProcess=_.noop,
        onDLBegin=_.noop,
        onDLEnd=_.noop,
        onDLComplete=_.noop,
        onDLError=_.noop,
        onDLPause=_.noop,
        onDLQueued=_.noop
    }={}) => {
        let m = Object.defineProperties({}, {
            state: {
                value: autoStart ? State.READY : State.PAUSED,
                writable: true,
                enumerable: true,
                configurable: false
            },
            queue: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: []
            },
            active: {
                writable: false,
                configurable: false,
                enumerable: false,
                value: []
            },
            tempDir: {
                writable: true,
                configurable: false,
                enumerable: true,
                value: null
            },
            opts: {
                writable: false,
                configurable: false,
                enumerable: false,
                value: {
                    autoStart,
                    maxConcurrent,
                    maxConnections,
                    maxSpeed,
                    progressTickRate,
                    onDLProgress,
                    onDLBegin,
                    onDLEnd,
                    onDLComplete,
                    onDLProcess,
                    onDLError,
                    onDLPause,
                    onDLQueued
                }
            }
        });

        return m;
    },

    queueDownload: (mgr, dir, metadata, login) => {
        let c = Container.create(dir, metadata, login);

        mgr.queue.push(c);
        mgr.opts.onDLQueued(c);
        return mgr.queue.length < mgr.opts.maxConcurrent && mgr.state === State.READY && Manager.run(mgr);
    },

    run: mgr => {
        let promises = _.map(
            _.filter(mgr.queue, {state: State.READY})
                .splice(mgr.opts.maxConcurrent - mgr.active.length),
            con => Manager.download(mgr, con));
        mgr.state = State.READY;

        return promises.length && Promise.all(promises) || Manager.tearDown(mgr);
    },

    stop: mgr => {
        mgr.state = State.PAUSED;
    },

    getTempDir: mgr => {
        return mgr.tempDir && Promise.resolve(mgr.tempDir) ||
            mktemp.createDir(TEMP_DIR_MASK).then(path => {
                mgr.tempDir = path;
                return path;
            });
    },

    tearDown: mgr => {
        if (!mgr.opts.autoStart) {
            Manager.stop(mgr);
        }
        return new Promise((resolve, reject) => {
            rmdir(mgr.tempDir, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    },

    download: (mgr, con) => {
        let opts = null;

        Container.update(con, {state: State.FETCHING});
        mgr.queue.splice(mgr.queue.indexOf(con), 1);
        mgr.active.push(con);
        mgr.opts.onDLBegin(con);
        Manager.buildOpts(mgr, con)
            .then(o => (opts = o) && Downloader.preProcess(opts, con.url))
            .then(proc => Container.update(con, {src: proc.src, cookie: proc.cookie}))
            .then(() => Container.update(con, {state: State.DOWNLOADING}))
            .then(() => Downloader.download(opts, con.src, con.name, con.cookie))
            .then(filePath => Manager.moveFile(mgr, con, filePath))
            .then(finalPath => Container.update(con, {file: finalPath, state: State.COMPLETE}))
            .catch(error => Manager.handleError(mgr, opts, con, error))
            .finally(() => Manager.endDownload(mgr, con));
    },

    moveFile: (mgr, con, filePath) => {
        Container.update(con, {state: State.PROCESSING});
        mgr.opts.onDLProcess(con);
        return mv(filePath, con.file);
    },

    handleError: (mgr, opts, con, error) => {
        if (con.name) {
            rm(path.join(opts.dir, con.name));
        }
        Container.update(con, {state: State.ERROR});
        mgr.opts.onDLError(con, error);
    },

    endDownload: (mgr, con) => {
        mgr.active.splice(mgr.active.indexOf(con), 1);
        mgr.opts.onDLEnd(con);
        if (mgr.state === State.READY) {
            Manager.run(mgr);
        } else if (!mgr.active.length) {
            Manager.tearDown(mgr);
        }
    },

    buildOpts: (mgr, con) => {
        return Manager.getTempDir(mgr)
            .then(path => _.assign({
                dir: path,
                connections: mgr.opts.maxConnections,
                concurrent: mgr.opts.maxConcurrent,
                maxOverallSpeed: mgr.opts.maxSpeed,
                datastream: Manager.buildDataStream(mgr, con)
            }, Login.get(con.login)));
    },

    buildDataStream: (mgr, con) => {
        return {
            write: (data) => {
                if (data.type === 'update') {
                    Container.update(con, data.payload);
                    mgr.opts.onDLProgress(con);
                }
            }
        };
    }
};
