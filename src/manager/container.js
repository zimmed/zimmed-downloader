const path = require('path');
const _ = require('lodash');
const Login = require('./login');


const State = {
    BAD: 'BAD',
    READY: 'READY',
    FETCHING: 'FETCHING',
    PROCESSING: 'PROCESSING',
    DOWNLOADING: 'DOWNLOADING',
    PAUSED: 'PAUSED',
    ERROR: 'ERROR',
    COMPLETE: 'COMPLETE'
};
const OK = 0;

const Container = module.exports = {

    createFromDB: ({state, dir, name, size, url, log, login}) => {
        return {
            state,
            login,
            name,
            dir,
            file: path.join(dir, name),
            size: size,
            url,
            log,
            src: null,
            cookie: null,
            transferred: null,
            rate: null,
            progress: 0,
            eta: null,
            connections: 0,
            stripForUpdate: function () {
                return Container.stripForUpdate(this);
            },
            stripForPub: function () {
                return Container.stripForPub(this);
            },
            stripForDB: function () {
                return Container.stripForDB(this);
            }
        };
    },

    create: (dir, metadata, login) => {
        if (metadata.state !== OK) {
            throw new Error('Cannot create download container for item with bad link: ' + metadata.url);
        }
        if (login) {
            Login.set(login.domain, login.user, login.pass);
        }

        return Container.createFromDB({
            state: State.READY,
            login: login.domain,
            name: metadata.name,
            dir,
            size: metadata.size,
            url: metadata.url,
            log: null
        });
    },

    update: (container, data) => {
        return Object.assign(container, data);
    },

    stripForDB: ({state, login, dir, name, size, url, log}) => {
        return {id: url, state, login, dir, name, size, url, log};
    },

    stripForPub: ({state, dir, name, size, url, log}) => {
        return {state, dir, name, size, url, log};
    },

    stripForUpdate: ({url, transferred, rate, progress, eta, connections}) => {
        return {url, update: {transferred, rate, progress, eta, connections}};
    }

};

Container.State = State;
