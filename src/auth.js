const _ = require('lodash');
const cache = require('zimmed-simple-cache')('auth');
const timestamp = require('zimmed-timestamp');
const cypher = require('zimmed-cypher');
const Config = require('./config');

const RSA = cypher.rsa;
const HMAC = cypher.hmac;
const KEY = Config.service.apiKey;
const REQUEST_TIMEOUT = Config.governor.requestTimeout;
const NAME = Config.service.name;

const Auth = {

    response: (data, encrypt=false) => {
        let ts = timestamp('ms');

        data = encrypt ? {encrypted: cache.get('pub').encrypt(data)} : data;
        return {hmac: HMAC(KEY, ts, data), ts, data};
    },

    hmacIsValid: (hmac, ts, ...data) => {
        let vTime = parseInt(ts) < timestamp('ms') + REQUEST_TIMEOUT;

        return vTime && hmac === HMAC(KEY, ts, ...data);
    },

    parseRequest: ({hmac, ts, data}) => {
        let parsed;

        if (Auth.hmacIsValid(hmac, ts, data)) {
            parsed = _.has(data, 'encrypted') && cache.get('pem').decrypt(data.encrypted) || data;
        } else {
            parsed = null;
        }

        return parsed;
    },

    setPublicKey: (pubKey) => {
        return pubKey && cache.set('pub', RSA.load(pubKey));
    },

    createPair: () => {
        cache.set('pem', RSA.create(Config.RSA.bits, Config.RSA.exp)).pub();
    },

    buildConnectionQuery: () => {
        let {hmac, ts, name} = Auth.response(NAME);

        return `hmac=${hmac}&ts=${ts}&name=${name}`;
    }
};

module.exports = Auth;
