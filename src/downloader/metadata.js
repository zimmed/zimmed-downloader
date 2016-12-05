const proc = require('child_process');
const Promise = require('bluebird');
const _ = require('lodash');
const cmdRequire = require('../util/cmd');


// Because WebStorm has dumb inspections
const cmdRequirePass = (...args) => Promise.resolve(cmdRequire(...args));
const Json = JSON;

const OK = 0;
const PREFIX = 'JSON:';
const JSON_RETURN = { // See man plowprobe for --printf option
    size: '%s',
    hash: '%h',
    name: '%f',
    state: '%c',
    url: "%u"
};

const metadata = module.exports = (...urls) => {
    return cmdRequirePass('plowprobe', 'plowshare')
        .then(() => new Promise((resolve, reject) => {
            let files = [],
                error = '',
                probe = metadata.spawnProbe(urls);

            probe.stdout.setEncoding('utf8');
            probe.stdout.on('data', data => {
                data = metadata.parseData(data);
                return data && files.push(data);
            });
            probe.stderr.on('data', data => error += data.toString());
            probe.on('exit', code => {
                if (files.length) {
                    resolve(files);
                } else {
                    reject(new Error(`Plowprobe failed [${code}]: ${error}`));
                }
            });
        }));
};

metadata.spawnProbe = urls => {
    return proc.spawn('plowprobe', [
        '--printf', `${PREFIX}${Json.stringify(JSON_RETURN)}%n`,
        ...urls
    ]);
};

metadata.parseData = data => {
    data = data.toString();
    return _.startsWith(data, PREFIX) && Json.parse(data.substr(PREFIX.length)) || false;
};
