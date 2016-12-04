const _ = require('lodash');
const path = require('path');
const proc = require('child_process');
const Promise = require('bluebird');
const Size = require('../util/byte-size');
const cmdRequire = require('../util/cmd.js');


// Because WebStorm has dumb inspections
const cmdRequirePass = (...args) => Promise.resolve(cmdRequire(...args));

const OK = 0;
const EMPTY = '';
const THIRTY_SECONDS = 30;

const download = module.exports = (opts, src, filename, cookie='') => {
    return cmdRequirePass('aria2c', 'Aria2')
            .then(() => cmdRequirePass('unbuffer', 'expect'))
            .then(() => new Promise((resolve, reject) => {
                let child = download.spawnDownloader(opts, src, filename, cookie);

                child.stdout.setEncoding('utf8');
                child.stdout.on('data', data => download.processData(opts.datastream, data));
                child.on('exit', code => code === OK ? resolve(path.join(opts.dir, filename)) : reject(code));
            }));
};

download.processData = (stream, data) => {
    let out = stream && data && download.parseData(data);

    return out && stream.write(out);
};

download.spawnDownloader = ({
    connections=4,
    dir='~/',
    concurrent=1,
    timeout=THIRTY_SECONDS,
    maxOverallSpeed=0
}={}, src, filename, cookie) => {
    let args = [
        'aria2c',
        '-x', connections,
        '-j', concurrent,
        '--max-overall-download-limit=' + maxOverallSpeed,
        '-t', timeout,
        '-d', dir,
        '-o', filename
    ];

    if (cookie) {
        args.push('--load-cookies=' + cookie);
    }
    args.push(src);
    return proc.spawn('unbuffer', args);
};

download.parseData = data => {
    data = download.stripUnicode(data);

    return download.parseNotice(data) || download.parseUpdate(data);
};

download.stripUnicode = (buffer) => {

    return buffer
        .toString()
        .replace(/[\r\n]/g, EMPTY) // line breaks due to cursor repositioning of aria2c output
        .replace(/\[[\d;]+m/g, EMPTY) // unicode color codes
        .replace(/\u001b/g, EMPTY) // unicode escape char
        .trim();
};

download.parseNotice = (data) => {
    let notice = _.includes(data, '[NOTICE]') && data.slice(data.indexOf('[NOTICE]') + 9);

    return notice && {type: 'notice', payload: notice};
};

download.parseUpdate = (data) => {
    // [#<id> <transferred>/<total>(<progress>%) CN:<connections> DL:<rate> ETA:<eta>]
    let regex = /^\[#([^\s]+)\s([^\/]+)\/([^(]+)\(([^%]+)%\)\sCN:(\d)\sDL:([^\s\]]+)(?:\sETA:([^\]]+)]|])$/,
        matches = regex.exec(data);

    return matches && {
            type: 'update',
            payload: {
                transferred: Size(matches[2]).value(),
                total: Size(matches[3]).value(),
                progress: parseInt(matches[4]),
                connections: parseInt(matches[5]),
                rate: Size(matches[6]).value(),
                eta: matches[7] || '0s'
            }
        };
};
