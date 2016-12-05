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
const publicProperties = [
    'state',
    'dir',
    'name',
    'size',
    'url',
    'log'
];

const Container = module.exports = {

    create: (dir, metadata, login) => {
        if (metadata.state !== OK) {
            throw new Error('Cannot create download container for item with bad link: ' + metadata.url);
        }
        if (login) {
            login = Login.set(login.domain, login.user, login.pass);
        }

        return {
            state: State.READY,
            login: login,
            name: metadata.name,
            dir: dir,
            file: path.join(dir, metadata.name),
            size: metadata.size,
            url: metadata.url,
            log: null,
            src: null,
            cookie: null,
            transferred: null,
            rate: null,
            progress: 0,
            eta: null,
            connections: 0,
            strip: function (include) {
                return Container.stripForDb(this, include);
            }
        };
    },

    update: (container, data) => {
        return Object.assign(container, data);
    },

    stripForDb: (container, include=[]) => {
        return _.assign(_.pick(container, _.concat(publicProperties, include)), {id: container.url});
    }
};

Container.State = State;
