const _ = require('lodash');
const key = require('../config').keys.loginAESKey;
const cypher = require('../util/cypher');
const Cache = require('../util/simple-cache');
const timestamp = require('../util/timestamp');
const dbTable = require('../db').table('download-logins');


const Login = module.exports = {

    create: (domain, user, pass) => {
        user = cypher.encrypt(user, key);
        pass = cypher.encrypt(pass, key);
        return {id: domain, user, pass};
    },

    set: (domain, username, password, ts) => {
        return Login.getTime(domain)
            .then(time => {
                if (ts > time) {
                    let {id, user, pass} = Login.create(domain, username, password);

                    return time && dbTable.update(id, {user, pass, ts}) || dbTable.insert({id, user, pass, ts});
                }
                return domain;
            })
            .then(() => domain);
    },

    get: (domain) => {
        return Login.getData(domain)
            .then(data => {
                return {
                    user: cypher.decrypt(data.user, key),
                    pass: cypher.decrypt(data.pass, key)
                };
            });
    },

    getTime: (domain) => {
        return Login.getData(domain)
            .then(data => data.ts)
            .catch(() => 0)
    },

    getData: (domain) => {
        return domain && dbTable.get(domain) || Promise.reject('Login.getData: No domain provided');
    },

    clear: (domain) => {
        return domain && dbTable.delete(domain) || dbTable.deleteAll();
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
