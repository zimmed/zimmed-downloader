const mv = require('mv');
const Promise = require('bluebird');

module.exports = (src, dest, opts) => {
    return new Promise((resolve, reject) => {
        let f = (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(dest);
            }
        };

        if (opts) {
            mv(src, dest, opts, f);
        } else {
            mv(src, dest, f);
        }
    });
};
