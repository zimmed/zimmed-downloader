const _ = require('lodash');
const cache = require('zimmed-simple-cache')('auth');
const timestamp = require('zimmed-timestamp');
const {hash, rsa} = require('zimmed-cypher');
const Config = require('../config');


const KEY = Config.service.apiKey;
const REQUEST_TIMEOUT = Config.governor.requestTimeout;
const NAME = Config.service.name;

const Auth = {

    HMAC: (key, ...data) => {
        return hash.base64(key, hash.base64(key, ...data));
    },

    response: (data, encrypt=false) => {
        let ts = timestamp('ms');

        data = encrypt ? {encrypted: cache.get('pub').encrypt(data)} : data;
        return {hmac: Auth.HMAC(KEY, ts, data), ts, data};
    },

    hmacIsValid: (hmac, ts, ...data) => {
        let vTime = parseInt(ts) < timestamp('ms') + REQUEST_TIMEOUT;

        return vTime && hmac === Auth.HMAC(KEY, ts, ...data);
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
        return pubKey && cache.set('pub', rsa.load(pubKey));
    },

    createPair: () => {
        cache.set('pem', rsa.create(Config.RSA.bits, Config.RSA.exp)).pub();
    },

    buildConnectionQuery: () => {
        let {hmac, ts, name} = Auth.response(NAME);

        return `hmac=${hmac}&ts=${ts}&name=${name}`;
    }
};

module.exports = Auth;
