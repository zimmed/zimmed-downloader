var _ = require('lodash');

module.exports = {
    
    encode: function (str, inType='utf8') {
        let b = inType !== 'base64' && (new Buffer(str, inType)).toString('base64') || str;

        return _.trimEnd(b.replace(/\//g, '_').replace(/\+/g, '-'), '=');
    },

    decode: function (base64, outType='utf8') {
        let str = base64.replace(/_/g, '/').replace(/-/g, '+');

        str = _.padEnd(str, '=', 4 - (str.length % 4));
        return outType !== 'base64' && (new Buffer(str, 'base64')).toString(outType) || str;
    }
};
