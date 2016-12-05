const express = require('express');
const http = require('http');
const _ = require('lodash');
const io = require('socket.io');
const cache = require('../simple-cache')('sm-registry');

const Socket = module.exports = {

    get: name => {
        return cache.get(name, null);
    },

    setup: (sm, groups) => {
        _.forEach(groups, ({em, middleware, channel}) => {
            if (middleware && _.isFunction(middleware)) {
                sm.group(channel).use(middleware);
            }
            sm.group(channel).on('connection', client => {
                em.handleDirect('connection', {}, sm.model, sm.filter(client));
                _.forEach(_.keys(em.routes), e => {
                    if (e !== 'connection') {
                        client.on(e, data => em.handle(e, data, sm.model, sm.filter(client)));
                    }
                });
            });
        });
        return cache.set(`${sm.host}:${sm.port}`, sm);
    },

    filter: function filter(client, sm=this) {
        return Object.defineProperties({}, {
            client: {
                value: client,
                writable: false,
                enumerable: true
            },
            server: {
                value: sm,
                writable: false,
                enumerable: true
            }
        });
    },

    init: function init(groups, sm=this) {
        return new Promise((resolve, reject) => {
            try {
                sm.httpServer.listen(sm.port, () => {
                    resolve(sm);
                });
            } catch (e) {
                reject(e);
            }
        });
    },

    create: function create(host, port, eventGroups, model=null) {
        const httpServer = http.createServer(express());
        const ioServer = io(httpServer, {serveClient: false});

        if (cache.has(`${host}:${port}`)) {
            throw `Socket Manager for '${host}:${port}' is already defined.`;
        }
        return Socket.setup(Object.defineProperties(_.create(this), {
            model: {
                value: model,
                writable: true,
                enumerable: false
            },
            host: {
                value: host,
                writable: false,
                enumerable: true
            },
            port: {
                value: port,
                writable: false,
                enumerable: true
            },
            httpServer: {
                get: () => httpServer,
                enumerable: false
            },
            connectionServer: {
                get: () => ioServer,
                enumerable: false
            },
            group: {
                value: (channel) => ioServer.of('/' + channel),
                writable: false,
                enumerable: false
            }
        }));
    }
};
