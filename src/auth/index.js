const _ = require('lodash');
const cache = require('../util/simplecache')('auth');
const key = require('../config').keys.authHashKey;
const hash = require('../util/cypher/hash');
const createKey = require('../util/cypher').createRSA;
const Config = require('../config').RSA;

const Auth = {

    hmacIsValid: (hmac, ...data) => {
        return hmac === hash.hex(key, hash.hex(key, ...data));
    },

    session: (sessionId) => {
        return cache.get(sessionId) || cache.set(sessionId, {
            key: createKey(Config.bits, Config.exp),
            id: sessionId
        });
    },

    decrypt: (sessionId, data) => {
        return Auth.session(sessionId).key.decrypt(data);
    },

    parseRequest: ({hmac, ts, sessionId, data}) => {
        return Auth.hmacIsValid(hmac, ts, sessionId, data) &&
            (sessionId && _.get(data, 'encrypted') ? Auth.decrypt(sessionId, data) : data) || null;
    }
};

module.exports = Auth;
