const _ = require('lodash');
const r = require('rethinkdb');
const {promiseRun} = require('./connection');
const cache = require('../util/simple-cache')('db');
const timestamp = require('../util/timestamp');
const Config = require('../config').database;

const MS = 'ms';

const Table = module.exports = {
    exec: function (query, toArray=false, table=this) {
        return table.ready().then(() => promiseRun(query, toArray));
    },

    deleteWhere: function (filter, returnChanges=false, table=this) {
        return table.exec(table.scope.filter(filter).delete({returnChanges}));
    },

    getWhere: function (filter, table=this) {
        return table.exec(table.scope.filter(filter, true));
    },

    updateWhere: function (filter, data, table=this) {
        return table.exec(table.scope.filter(filter).update(data));
    },

    getAll: function (table=this) {
        return table.exec(table.scope, true);
    },

    deleteAll: function (returnChanges=false, table=this) {
        return table.exec(table.scope.delete({returnChanges}));
    },

    insert: function (doc_or_docs, table=this) {
        return table.exec(table.scope.insert(doc_or_docs));
    },

    delete: function (uid, returnChanges=false, table=this) {
        return table.exec(table.scope.get(uid).delete({returnChanges}));
    },

    update: function (uid, data, table=this) {
        return table.exec(table.scope.get(uid).update(data));
    },

    get: function (uid, table=this) {
        return table.exec(table.scope.get(uid));
    },

    ready: function (table=this) {
        return table.scope && Promise.resolve(table) ||
            new Promise((resolve, reject) => {
                let start = timestamp(MS),
                    handle = setInterval(() => {
                        if (table.scope) {
                            clearInterval(handle);
                            resolve(table);
                        } else if (start + Config.readyTimeout < timestamp(MS)) {
                            reject(new Error('DBTable Creation Timeout'));
                        }
                    }, Config.readyTimeoutTick);
                });
    },

    createTable: function (tableName, db) {
        return cache.get(cacheKey({dbName: db.dbName, tableName}), Table.createNewTable(tableName, db));
    },

    createNewTable: function (tableName, db) {
        let scope = null,
            table = Object.defineProperties(Object.create(this), {
                name: {
                    value: `${db.dbName}.${tableName}`,
                    writable: false,
                    enumerable: true
                },
                dbName: {
                    value: db.dbName,
                    writable: false,
                    enumerable: true
                },
                tableName: {
                    value: tableName,
                    writable: false,
                    enumerable: true
                },
                scope: {
                    enumerable: false,
                    get: () => scope
                }
            });

        db.ready()
            .then(() => upsertTable(table))
            .then(() => {
                scope = db.scope.table(tableName);
            })
            .catch(_.noop);
        cache.set(cacheKey(table), table);
    }
};

function upsertTable (table) {
    let q = r.db(table.dbName)
        .tableList()
        .contains(table.tableName)
        .do(tableExists => {
            return r.branch(
                tableExists,
                {tables_created: 0},
                r.db(table.dbName).tableCreate(table.tableName));
        });

    return promiseRun(q);
}

function cacheKey({dbName, tableName}) {
    return `db.${dbName}.${tableName}`;
}
