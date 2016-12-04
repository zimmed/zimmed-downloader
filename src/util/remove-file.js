const fs = require('fs');
const Promise = require('bluebird');

module.exports = (pathToFile) => {
    return new Promise((resolve, reject) => {
            fs.unlink(pathToFile, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        }).then(() => {
            return new Promise((resolve, reject) => {
                fs.unlink(pathToFile + '.part', err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            });
        });
};
