const _ = require('lodash');
const Promise = require('bluebird');
const path = require('path');
const mktemp = require('mktemp');
const rmdir = require('rmdir');
const Container = require('./container');
const Downloader = require('../downloader');
const Login = require('./login');
const {moveFile, removeFile} = require('zimmed-cli');
const State = Container.State;
const dbTable = require('../db')('mgr-finished-files');


const TEMP_DIR_MASK = 'dl-XXXXXXXX';

const Manager = module.exports = {

    fileExists: (url) => {
        return dbTable
            .get(url)
            .then(items => items && items.length && items[0])
            .then(file => _.get(file, state, false));
    },

    dbClearActive: () => {
        return dbTable.updateWhere(activePredicate, {state: State.ERROR, log: 'Manager restart'});
    },

    dbGetQueued: () => {
        return dbTable.getWhere(file => file('state').eq(State.READY));
    },

    dbGetActive: () => {
        return dbTable.getWhere(activePredicate);
    },

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
    }={}, queue) => {
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
                value: queue || []
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
                    onDLProgress: (...args) => onDLProgress(m, ...args),
                    onDLBegin: (...args) => onDLBegin(m, ...args),
                    onDLEnd: (...args) => onDLEnd(m, ...args),
                    onDLComplete: (...args) => onDLComplete(m, ...args),
                    onDLProcess: (...args) => onDLProcess(m, ...args),
                    onDLError: (...args) => onDLError(m, ...args),
                    onDLPause: (...args) => onDLPause(m, ...args),
                    onDLQueued: (...args) => onDLQueued(m, ...args)
                }
            }
        });

        return m;
    },

    queueDownload: (mgr, dir, metadata, login) => {
        let c = Container.create(dir, metadata, login);

        return dbTable
            .insert(c.stripForDB())
            .then(() => mgr.queue.push(c))
            .then(() => mgr.opts.onDLQueued(c))
            .then(() => mgr.active.length < mgr.opts.maxConcurrent)
            .then(freeSlots => freeSlots && mgr.state === State.READY)
            .then(ready => ready && Manager.run(mgr));
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
        return dbTable
            .update(con.url, con.stripForDB())
            .then(() => mgr.queue.splice(mgr.queue.indexOf(con), 1))
            .then(() => mgr.active.push(con))
            .then(() => mgr.opts.onDLBegin(con))
            .then(() => Manager.buildOpts(mgr, con))
            .then(o => (opts = o) && Downloader.preProcess(opts, con.url))
            .then(proc => Container.update(con, {src: proc.src, cookie: proc.cookie}))
            .then(() => Container.update(con, {state: State.DOWNLOADING}))
            .then(() => Downloader.download(opts, con.src, con.name, con.cookie))
            .then(filePath => Manager.moveFile(mgr, con, filePath))
            .then(finalPath => Manager.completeDownload(mgr, con, finalPath))
            .catch(error => Manager.handleError(mgr, opts, con, error))
            .finally(() => Manager.endDownload(mgr, con));
    },

    moveFile: (mgr, con, filePath) => {
        Container.update(con, {state: State.PROCESSING});
        mgr.opts.onDLProcess(con);
        return moveFile(filePath, con.file);
    },

    completeDownload: (mgr, con, finalPath) => {
        Container.update(con, {file: finalPath, state: State.COMPLETE});
        mgr.opts.onDLComplete(con);
    },

    handleError: (mgr, opts, con, error) => {
        if (con.name) {
            removeFile(path.join(opts.dir, con.name));
        }
        Container.update(con, {state: State.ERROR, log: error});
        mgr.opts.onDLError(con, error);
    },

    endDownload: (mgr, con) => {
        return dbTable
            .update(con.url, con.stripForDB())
            .then(() => mgr.active.splice(mgr.active.indexOf(con), 1))
            .then(() => mgr.opts.onDLEnd(con))
            .then(() => mgr.state === State.READY)
            .then(ready => ready ? Manager.run : (!mgr.active.length && Manager.tearDown(mgr)));
    },

    buildOpts: (mgr, con) => {
        return Promise.all(Manager.getTempDir(mgr), Login.get(con.login))
            .spread((path, login) => {
                return {dir: path,
                    connections: mgr.opts.maxConnections,
                    concurrent: mgr.opts.maxConcurrent,
                    maxOverallSpeed: mgr.opts.maxSpeed,
                    datastream: Manager.buildDataStream(mgr, con),
                    user: login.user,
                    pass: login.pass
                };
            });
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


function activePredicate(file) {
    return file('state').ne(State.READY).and(file('state').ne(State.ERROR).and(file('state').ne(State.COMPLETE)));
}
