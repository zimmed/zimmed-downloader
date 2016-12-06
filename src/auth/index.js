const _ = require('lodash');
const cache = require('zimmed-simple-cache')('auth');
const KEY = require('../config').keys.authHashKey;
const timestamp = require('zimmed-timestamp');
const {hash, rsa} = require('zimmed-cypher');
const Config = require('../config').RSA;

const REQUEST_TIMEOUT = 2000;

const Auth = {

    HMAC: (key, ...data) => {
        return hash.base64(key, hash.base64(key, ...data));
    },

    response: data => {
        let ts = timestamp('ms');

        return {hmac: Auth.HMAC(KEY, ts, data), ts, data};
    },

    hmacIsValid: (hmac, ts, ...data) => {
        let vTime = parseInt(ts) < timestamp('ms') + REQUEST_TIMEOUT;

        return vTime && hmac === Auth.HMAC(KEY, ts, ...data);
    },

    session: (sessionId) => {
        return cache.get(sessionId, null);
    },

    parseRequest: ({hmac, ts, sessionId, data}, cachedSessionId) => {
        let auth = cachedSessionId === sessionId && Auth.session(sessionId),
            parsed;

        if (auth && Auth.hmacIsValid(hmac, ts, sessionId, data)) {
            parsed = _.has(data, 'encrypted') && auth.key.decrypt(data.encrypted) || data;
        } else {
            parsed = null;
        }

        return parsed;
    },

    create: ({hmac, ts, guestId}) => {
        let id = Auth.generateId(guestId),
            params = hmac && ts && guestId;

        return params && Auth.hmacIsValid(hmac, ts, guestId) && cache.set(id, {
                key: rsa.create(Config.bits, Config.exp),
                id
            });
    },

    generateId: (seed) => {
        let k = _.shuffle(KEY.split('')).join(''),
            id = Auth.HMAC(k, seed, timestamp('ms'));

        return cache.has(id) && Auth.generateId(seed) || id;
    }
};

module.exports = Auth;
