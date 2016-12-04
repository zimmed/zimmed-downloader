/**
 * Main application config.
 *
 * [✓] Changeable configuration
 * [x] Important configuration value; do not change
 */
module.exports = {

    serverName: '*****',   // [✓] CHANGE THIS; must be a unique identifier for this server instance.
                                    //      Be sure to name it something simple and easy to remember, because
                                    //      you and shared users will need to select the server by this name
                                    //      when sending download requests from the web client.

    logger: {
        logLevel: 'debug', // [✓] Bunyan logger level. See bunyan node package readme for more info.
        logName: 'Downloader' // [✓] This can literally be whatever you want. Has no impact on anything.
    },

    // Database is not currently used.
    database: {
        host: 'localhost',
        port: '32778',
        name: 'Downloader',
        readyTimeout: 10000, // ms
        readyTimeoutTick: 5 // ms
    },

    keys: {
        authHashKey: '*****', // [x] Must be concurrent with web server for HMAC authentication.
        loginAESKey: '*****'  // [✓] Independent to this server instance, can be any key. This will be used
                                         //      for AES encryption of fileSharing account logins that are stored in
                                         //      the server memory (for queued downloads). HONOR SYSTEM.
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

    // Captcha-solve service information. 9kweu is recommended (account required), but you may also set `use` to false
    //    to force aborts when captchas are requested. 9kweu referral link: https://www.9kw.eu/register_139321.html
    captcha: {
        use: false,
        service: '9kweu',
        apiKey: '*****',  // Set this or user/pass depending on service requirements - both not needed
        user: null,
        pass: null,
    }
};
