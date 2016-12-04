const _ = require('lodash');
const cache = require('../util/simple-cache')('auth');
const key = require('../config').keys.authHashKey;
const timestamp = require('../util/timestamp');
const hash = require('../util/cypher/hash');
const createKey = require('../util/cypher').createRSA;
const Config = require('../config').RSA;

const REQUEST_TIMEOUT = 2000;

const Auth = {

    hmacIsValid: (hmac, ts, ...data) => {
        let vTime = parseInt(ts) < timestamp('ms') + REQUEST_TIMEOUT;

        return vTime && hmac === hash.base64(key, hash.base64(key, ts, ...data));
    },

    session: (sessionId) => {
        return cache.get(sessionId, null);
    },

    parseRequest: ({hmac, ts, sessionId, data}) => {
        let auth = Auth.session(sessionId),
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
                key: createKey(Config.bits, Config.exp),
                id
            });
    },

    generateId: (seed) => {
        let k = _.shuffle(key.split('')).join('');
            id = hash.base64(k, hash.base64(key, seed, timestamp('ms')));

        return cache.has(id) && Auth.generateId(seed) || id;
    }
};

module.exports = Auth;
