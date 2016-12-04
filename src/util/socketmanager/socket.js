const express = require('express');
const http = require('http');
const _ = require('lodash');
const io = require('socket.io');

const SMRegistry = {};
const httpServer = http.createServer(express());
const ioServer = io(httpServer, {serveClient: false});

const Socket = module.exports = {

    get: name => {
        return _.get(SMRegistry, name, null);
    },

    filter: function filter(client, sm=this) {
        return Object.defineProperties({}, {
            client: {
                value: client,
                writable: false,
                enumerable: true
            },
            server: {
                value: sm.connectionServer,
                writable: false,
                enumerable: true
            },
            group: {
                value: sm.connectionGroup,
                writable: false,
                enumerable: true
            }
        });
    },

    init: function init(sm=this) {
        return new Promise((resolve, reject) => {
            sm.connectionGroup.on('connection', (client) => {
                sm.eventManager.handle('connection', {}, sm.model, sm.filter(client));
                Object.keys(sm.eventManager.routes).forEach((e) => {
                    if (e !== 'connection') {
                        client.on(e, (data) => sm.eventManager.handle(e, data, sm.model, sm.filter(client)));
                    }
                });
            });
            try {
                sm.httpServer.listen(sm.port, () => {
                    resolve(sm);
                });
            } catch (e) {
                reject(e);
            }
        });
    },

    create: function create(name='default', host, port, model=null, eventManager) {
        if (SMRegistry.hasOwnProperty(name)) {
            throw `Socket Manager for '${name}' is already defined.`;
        }
        SMRegistry[name] = Object.defineProperties(Object.create(this), {
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
            name: {
                value: name,
                writable: false,
                enumerable: true
            },
            httpServer: {
                get: () => {
                    return httpServer;
                },
                enumerable: false
            },
            connectionServer: {
                get: () => {
                    return ioServer;
                },
                enumerable: false
            },
            connectionGroup: {
                value: ioServer.of('/' + name),
                writable: false,
                enumerable: false
            },
            eventManager: {
                value: eventManager,
                enumerable: false,
                writable: false
            }
        });
        return SMRegistry[name];
    }
};
