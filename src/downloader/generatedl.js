const proc = require('child_process');
const path = require('path');
const _ = require('lodash');
const Promise = require('bluebird');
const Config = require('../config').captcha;
const cmdRequire = require('zimmed-cli').cmd;


// Because WebStorm has dumb inspections
const cmdRequirePass = (...args) => Promise.resolve(cmdRequire(...args));
const Json = JSON;

const OK = 0;
const HALF_SECOND = 500;
const PREFIX = 'JSON:';
const JSON_RETURN = { // See man plowdown for --printf option
    name: '%f',
    src: '%d',
    url: '%u',
    cookie: '%C'
};

const generate = module.exports = (opts, url) => {
    return new Promise((resolve, reject) => {
        cmdRequirePass('plowdown', 'plowshare')
            .then(() => {
                let error = '',
                    down = generate.spawnPlowdown(opts, url);

                down.stdout.setEncoding('utf8');
                down.stdout.on('data', data => {
                    data = generate.parseData(data);
                    return data && resolve(data);
                });
                down.stderr.on('data', data => error += data.toString());
                down.on('exit', code => code !== OK && reject(dlError(url, code, error)));
            });
    });
};

generate.spawnPlowdown = ({
    user=null,
    pass=null,
    captchaTimeout=HALF_SECOND,
    maxRetries=2
}={}, url) => {
    let args = [
        `--max-retries=${maxRetries}`,
        `--timeout=${captchaTimeout}`,
        '-q',
        '--skip-final',
        `--printf=${PREFIX}${Json.stringify(JSON_RETURN)}%n`
    ];

    if (user && pass) {
        args.push('-a', `${user}:${pass}`);
    }
    if (Config.use && Config.service) {
        args.push(`--${Config.service}=${Config.apiKey || Config.user + ':' + Config.pass}`);
    } else {
        args.push('--captchamethod=none');
    }
    args.push(url);
    return proc.spawn('plowdown', args);
};

generate.parseData = data => {
    data = data.toString();
    return _.startsWith(data, PREFIX) && Json.parse(data.substr(PREFIX.length)) || false;
};

function dlError(url, code, error) {
    return new Error(`[${code}] Failed to generate final link for ${url}: ${error}`);
}
