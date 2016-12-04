const aes = require('./aes');
const rsa = require('./rsa');

module.exports = {

    encrypt: (data, key) => {
        return aes.encrypt(key, data);
    },

    decrypt: ({content, tag, ts}, key) => {
        return aes.decrypt(key, content, tag, ts);
    },

    createRSA: (bits, exp) => rsa.create(bits, exp)
};
