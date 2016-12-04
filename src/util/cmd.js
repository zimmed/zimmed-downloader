const Promise = require('bluebird');
const commandExists = require('command-exists');

/**
 * Checks that given CLI command exists in current environment.
 * @param {string} cmd - The command to test.
 * @param {string} pkg - The associated package name to report to user.
 * @return {Promise<boolean>} - Resolves to true if command exists, otherwise rejects.
 */
module.exports = function cmdRequire(cmd, pkg) {
    return new Promise((resolve, reject) => {
        commandExists(cmd, (err, exists) => {
            if (exists && !err) {
                resolve(true);
            } else {
                reject(new Error(`Command ${cmd} not found. Downloader package requires installation of ${pkg}.`));
            }
        });
    });
};
