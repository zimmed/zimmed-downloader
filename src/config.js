/**
 * Main application config.
 *
 * [✓] Changeable configuration; local to this server
 * [-] Paired value; must be consistent with cluster / web server
 * [x] Important configuration; changing will break the current code
 */

module.exports = {

    // Socket Server
    server: {
        name: 'Server',   // [✓] CHANGE THIS; must be a unique identifier for this server instance.
                          //      Be sure to name it something simple and easy to remember, because
                          //      you and shared users will need to select the server by this name
                          //      when sending download requests from the web client.
        host: '0.0.0.0', // [✓] 0.0.0.0 will broadcast to all local IPs, where localhost may only broadcast to one.
        port: 6001, // [✓]
        channels: {
            default: {eventPath: 'src/events'}, // [x] Relative path to server events directory for default socket channel
            queue: {eventPath: 'src/events/queue'} // [x] Event path for queue updates channel
        },
    },

    keys: {
        authHashKey: '0000000000000000', // [-] Must be concurrent with web server for HMAC authentication.
        loginAESKey: '0000000000000000'  // [✓] Independent to this server instance, can be any key. This will be used
                                         //      for AES encryption of fileSharing account logins that are stored in
                                         //      the server memory (for queued downloads). HONOR SYSTEM.
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

    // Configuration for RSA key generation. This is used in the key-pair generation for each connected session,
    //  allowing each user (from the web client) to encrypt using a unique public key, where their private counterpart
    //  is stored on this server instance within an in-memory cache. Default is 1Kb, with a 2^16-1 exponent. Lower
    //  bit-rate if impacting performance. Raising is unnecessary, since keys are for temporary sessions, and 1024-bit
    //  would take years to brute force with a cluster of super computers. 256-bit or higher is perfectly acceptable
    //  for these pairs, since they expire with the session.
    RSA: {
        bits: 1024, // [✓] Higher bit-length is more secure, but takes longer to generate key pairs.
                    //  [on macbook pro: 512 = ~40ms, 1024 = ~400ms, 2048 = >3.0s]
        exp: 65535  // [✓] Only change if you know what you're doing. This is the exponent field of the RSA encryption
                    //  algorithm.
    },

    // [✓] RethinkDB configuration
    database: {
        host: 'localhost',
        port: '32778',
        name: 'Downloader',
        readyTimeout: 5000, // ms
        readyTick: 5 // ms
    },

    logger: {
        logLevel: 'debug', // [✓] Bunyan logger level. See bunyan node package readme for more info.
        logName: 'Downloader' // [✓] This can literally be whatever you want. Has no impact on anything.
    }
};
