const _ = require('lodash');
const generateDownloadLink = require('./generatedl');
const downloadFile = require('./download');


const Downloader = module.exports = {

    /**
     * Pre-process file-sharing public link for download
     * @param {Object} opts - Process options
     * @param {string} opts.user - Username for hosting account
     * @param {string} opts.pass - Password for hosting account
     * @param {number} opts.maxRetries - Max number of connection retries
     * @param {number} opts.captchaTimeout - Time in ms to wait for captcha solve before timing out (non-premium)
     * @param {string} url - The public URL to access
     */
    preProcess: (opts, url) => {
        return generateDownloadLink(opts, url);
    },

    /**
     * Execute download for given source.
     * @param {Object} opts - Download options
     * @param {number} opts.connections - Maximum number of connections for single download
     * @param {string} opts.dir - The output path for the file (dir only)
     * @param {number} opts.timeout - Timeout in seconds for establishing a connection with the host
     * @param {number|string} opts.maxOverallSpeed - Speed cap for download (0: Unlimited)
     * @param {string} fileSource - The URL to download
     * @param {string} fileName - The name of the file to save as
     * @param {string} [cookie=''] - Path to cookie file needed for download
     * @returns {Promise}
     */
    download: (opts, fileSource, fileName, cookie) => {
        return downloadFile(opts, fileSource, fileName, cookie);
    }
};
