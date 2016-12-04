const Config = require('../config').database;

let db = require('./db').createDB(Config.name);

module.exports = db;
