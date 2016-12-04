var crypto = require('crypto');
var b64 = require('./b64');

var ALG = 'sha1';

var Hash = module.exports = {

    hash: function (alg, out, key, ...data) {
        let str = data.map(i => JSON.stringify(i)).join(':');

        return crypto.createHmac(alg, key).update(str).digest(out);
    },

    hex: function (key, ...data) {
        return Hash.hash(ALG, 'hex', key, ...data);
    },

    base64: function (key, ...data) {
        return b64.encode(Hash.hash(ALG, 'base64', key, ...data), 'base64');
    }
};
