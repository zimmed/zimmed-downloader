const _ = require('lodash');
const key = require('../config').keys.loginAESKey;
const cypher = require('../util/cypher');
const Cache = require('../util/simple-cache');
const timestamp = require('../util/timestamp');
const cache = Cache('logins');


const Login = module.exports = {

    create: (user, pass, ts) => {
        user = cypher.encrypt(user, key);
        pass = cypher.encrypt(pass, key);
        return {
            ts,
            decrypt: () => {
                return {
                    user: cypher.decrypt(user, key),
                    pass: cypher.decrypt(pass, key)
                };
            }
        };
    },

    set: (domain, user, pass, ts) => {
        if (ts > Login.getTime(domain)) {
            cache.set(domain, Login.create(user, pass, ts));
        }
        return domain;
    },

    get: (domain) => {
        return domain && cache.get(`${domain}.decrypt`, _.noop)() || {};
    },

    getTime: (domain) => {
        return domain && cache.get(`${domain}.ts`) || 0;
    },

    clear: (domain) => {
        return domain && cache.del(domain) || Cache.wipe(cache);
    },

    // getLoginForDownload: (url) => {
    //     let data = _.find(data, login => {
    //         return _.filter(login.tests, test => url.match(new RegExp(test))).length;
    //     });
    //
    //     return data && {
    //             user: cypher.decrypt()
    //         }
    // },

};
