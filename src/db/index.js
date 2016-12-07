const Config = require('../config').database;
const db = require('zimmed-rethink').config(Config).create(Config.name);

module.exports = db;
