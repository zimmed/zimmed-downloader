const Config = require('../config').database;
const logger = require('../util/logger');
const r = require('rethinkdb');

let connection = null;

module.exports = {connection, promiseRun};

/** Run Wrappers **/

function promiseRun(reqlQuery, toArray=false) {
    return connection && run(reqlQuery, toArray) || connect(reqlQuery, toArray);
}

function run(reqlQuery, toArray=false) {
    return new Promise((resolve, reject) => {
        try {
            reqlQuery.run(connection, (err, cursor) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(handleCursor(cursor, toArray));
                }
            });
        } catch (e) {
            reject(e);
        }
    });
}

function connect(reqlQuery, toArray=false) {
    return new Promise((resolve, reject) => {
        r.connect({host: Config.host, port: Config.port}, (err, con) => {
            if (err) {
                logger.error(`Error connection to database at ${Config.host}:${Config.port}\n${err}`);
                reject(err);
            } else {
                connection = con;
                resolve(run(reqlQuery, toArray));
            }
        });
    });
}

function handleCursor(cursor, toArray=false) {
    return new Promise((resolve, reject) => {
        if (toArray) {
            cursor.toArray((err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        } else {
            resolve(cursor);
        }
    });
}
