const _ = require('lodash');
const crypto = require('crypto');
const hash = require('./hash').base64;
const b64 = require('./b64');
const timestamp = require('../timestamp');

const CRYPT_ALG = 'aes-256-ctr';

const AES = module.exports = {

    encrypt: (key, mixed) => {
        return _.isString(mixed) && AES.encryptUtf8(key, mixed) || AES.encryptJson(key, mixed);
    },

    decrypt: (key, mixed, tag, ts) => {
        let data = AES.decryptToUtf8(key, mixed, tag, ts);

        return data && AES.toJson(data) || data;
    },

    encryptUtf8: (key, data) => {
        let ts = timestamp('ms'),
            tag = hash(key, hash(key, data, ts)),
            cipher = crypto.createCipher(CRYPT_ALG, key + hash(tag, key, ts)),
            content = b64.encode(cipher.update(data, 'utf8', 'base64') + cipher.final('base64'), 'base64');

        return {content, tag, ts};
    },

    decryptToUtf8: (key, content, tag, ts) => {
        let cipher, data;

        ts = Number(ts);
        content = b64.decode(content, 'base64');
        cipher = crypto.createDecipher(CRYPT_ALG, key + hash(tag, key, ts));
        data = cipher.update(content, 'base64', 'utf8') + cipher.final('utf8');
        return (tag === hash(key, hash(key, data, ts))) && data || null;
    },

    encryptJson: (key, obj) => {
        return AES.encrypt(key, JSON.stringify(obj));
    },

    toJson: data => {
        try {
            return JSON.parse(data);
        } catch (e) {
            return null;
        }
    }
};
