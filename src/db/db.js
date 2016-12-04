const r = require('rethinkdb');
const Promise = require('bluebird');
const cache = require('../util/simplecache')('db');
const logger = require('../logger');
const timestamp = require('../util/timestamp');
const Table = require('./table');
const {promiseRun} = require('./connection');
const Config = require('../config').database;

const MS = 'ms';

const DB = module.exports = {

    table: function (tableName, db=this) {
        return Table.createTable(tableName, db);
    },

    ready: function (db=this) {
        return db.scope && Promise.resolve(db) ||
            new Promise((resolve, reject) => {
                let start = timestamp(MS),
                    handle = setInterval(() => {
                        if (db.scope) {
                            clearInterval(handle);
                            resolve(db);
                        } else if (start + Config.readyTimeout < timestamp(MS)) {
                            reject(new Error('DB Creation Timeout'));
                        }
                }, Config.readyTimeoutTick);
            });
    },

    deleteDB: function (dbName=this.dbName) {
        return dbName && cache.del(cacheKey(dbName)) && dropDB(dbName) ||
            Promise.reject(new Error('No dbName supplied to delete'));
    },

    createDB: function (dbName, tableName) {
        let db = cache.get(cacheKey(dbName), DB.createNewDB(dbName));

        return tableName && db.table(tableName) || db;
    },

    createNewDB: function (dbName) {
        let scope = null,
            db = Object.defineProperties(Object.create(this), {
                dbName: {
                    value: dbName,
                    writable: false,
                    enumerable: true
                },
                scope: {
                    enumerable: false,
                    get: () => scope
                }
            });

        upsertDB(db).then(() => {
            scope = r.db(dbName);
        }).catch(logger.error);
        cache.set(cacheKey(dbName), db);
        return db;
    }
};

/** Run Wrappers **/

function dropDB(dbName) {
    let q = r
        .dbList()
        .contains(dbName)
        .do(databaseExists => {
            return r.branch(
                databaseExists,
                r.dbDrop(dbName),
                {dbs_dropped: 0});
        });

    return promiseRun(q).then(ret => ret.dbs_dropped);
}

function upsertDB(db) {
    let q = r
        .dbList()
        .contains(db.dbName)
        .do(databaseExists => {
            return r.branch(
                databaseExists,
                {dbs_created: 0},
                r.dbCreate(db.dbName));
        });

    return promiseRun(q);
}

/** Helpers **/

function cacheKey(dbName) {
    return `db.${dbName}`;
}
