const _ = require('lodash');
const nodeRSA = require('node-rsa');
const b64 = require('./b64');

const DEFAULT_KEY_LENGTH = 512;
const DEFAULT_EXP = 65535;

const RSA = module.exports = {

    create: (bits=DEFAULT_KEY_LENGTH, exp=DEFAULT_EXP) => {
        let key = (new nodeRSA()).generateKeyPair(bits, exp);

        return {
            pub: () => key.exportKey('public'),
            decrypt: content => {
                return RSA.decrypt(key, content);
            }
        };
    },

    decrypt: (key, content) => {
        let data = RSA.decryptToUtf8(key, content);

        try {
            return data && JSON.parse(data);
        } catch (e) {
            return data;
        }
    },

    decryptToUtf8: function (key, content) {
        return key.decrypt(b64.decode(content), 'utf8');
    },
};
