const bunyan = require('bunyan');
const {logLevel, logName} = require('./config').logger;

module.exports = bunyan.createLogger({
    name: logName,
    streams: [
        {
            level: logLevel,
            stream: process.stdout,
            formatter: "pretty"
        },
        {
            level: "error",
            stream: process.stderr
        }
    ]
});
