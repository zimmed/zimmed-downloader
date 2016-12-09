/**
 * Main application config.
 *
 * [✓] Changeable configuration; local to this server
 * [-] Paired value; must be consistent with cluster / web server
 * [x] Important configuration; changing will break the current code
 */

const path = require('path');

module.exports = {

    // Socket Server
    service: {
        name: 'Server',   // [✓] CHANGE THIS; must be a unique identifier used during downloader registration.
        apiKey: '0000000000000000'  // [✓] CHANGE THIS; Update to key provided by governor when downloader is registered.
    },
    governor: {
        host: 'localhost', // [✓] host-name/ip of governor socket server
        port: 6010, // [✓] port of governor socket server
        channel: 'downloader', // [-] channel governor expects connections on
        eventPath: path.join(__dirname, '/src/events'), // [x] path to socket event handlers
        requestTimeout: 1000 // [✓] Amount of time a request has to make it across the socket connection before
                             // becoming invalid.
    },

    keys: {
        loginAESKey: '0000000000000000'  // [✓] Independent to this server instance, can be any key. Recomended to use
                                         // random sequence of 16 or more upper-case letters, lower-case letters,
                                         // numbers, and symbols. Example: F0.3leQI-W@R;6a
    },

    downloader: {
        autoStart: true, // [✓] Automatically start downloader when a queue is available
    },

    libraries: {
        tv: '/mnt/nas/share/television', // [✓] Path to TV library
        movies: '/mnt/nas/share/movies', // [✓] Path to Movies library
        music: '/mnt/nas/share/music', // [✓] Path to Music library
        apps: '/mnt/nas/share/software', // [✓] Path to Software/Games library
        documents: '/mnt/nas/share/documents', // [✓] Path to EBooks/Documents library
        other: '/mnt/nas/share/misc' // [✓] Path to directory for all other downloads
    },

    // Captcha-solve service information. 9kweu is recommended (account required), but you may also set `use` to false
    //    to force aborts when captchas are requested. 9kweu referral link: https://www.9kw.eu/register_139321.html
    captcha: {
        use: false, // [✓] Use a captcha-solving service
        service: '9kweu', // [✓] Read `$ man plowdown` for more info
        apiKey: '*****',  // [✓] Set this or user/pass depending on service requirements - both not needed
        user: null,
        pass: null,
    },

    // Configuration for RSA key generation. This is used in the key-pair generation for the connected session,
    //  allowing the governor to encrypt using a unique public key, where their private counterpart
    //  is stored on this server instance within an in-memory cache. Default is 1Kb, with a 2^16-1 exponent. Lower
    //  bit-rate if impacting performance. Raising is unnecessary, since keys are for temporary sessions, and 1024-bit
    //  would take years to brute force with a cluster of super computers. 512-bit or higher is perfectly acceptable
    //  for these pairs, since they expire with the session.
    RSA: {
        bits: 512, // [✓] Higher bit-length is more secure, but takes longer to generate key pairs.
                    //  [on macbook pro: 512 = ~40ms, 1024 = ~400ms, 2048 = >3.0s]
        exp: 65535  // [✓] Only change if you know what you're doing. This is the exponent field of the RSA encryption
                    //  algorithm.
    },

    // [✓] RethinkDB configuration
    database: {
        host: 'localhost', // [✓]
        port: '32778', // [✓]
        name: 'Downloader', // [✓]
        readyTimeout: 5000, // [✓] ms; Amount of time to wait for db/table to create before timing out.
        readyTick: 5 // [✓] ms; Update rate to check for completion of db/table creation
    },

    logger: {
        logLevel: 'debug', // [✓] Bunyan logger level. See bunyan node package readme for more info.
        logName: 'Downloader' // [✓] This can literally be whatever you want. Has no impact on anything.
    }
};
