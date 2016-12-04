const _ = require('lodash');
const glob = require('glob');
const path = require('path');

module.exports = {

    use: function (middlewareFunction, id=null, em=this) {
        em.middle.push({handler: middlewareFunction, id});
        return em;
    },

    register: function (eventName, eventHandler, id=null, em=this) {
        if (!em.routes.hasOwnProperty(eventName)) {
            em.routes[eventName] = [];
        }
        em.routes[eventName].push({handler: eventHandler, id});
        return em;
    },

    deregister: function (eventName, id=null, em=this) {
        if (em.routes.hasOwnProperty(eventName)) {
            em.routes[eventName] = _.filter(em.routes[eventName], r => {
                return id !== null && r.id !== id;
            });
        }
        return em;
    },

    on: this.register,

    off: this.deregister,

    handleDirect: function (eventName, eventData, model, self, em=this) {
        console.log('final...');
        if (em.routes.hasOwnProperty(eventName)) {
            _.forEach(em.routes[eventName], r => {
                r.handler.apply(self, [model, eventData]);
            });
        } else if (em.routes.hasOwnProperty('default')) {
            _.forEach(em.routes['_default_'], r => {
                r.handler.apply(self, [eventName, model, eventData]);
            });
        } else {
            throw new Error(`Uncaught event '${eventName}'`);
        }
    },

    handle: function (eventName, eventData, model, self, em=this) {
        let i = 0,
            next = (m, eData) => {
                console.log('next...');
                return i < em.middle.length ?
                    em.middle[i++].handler.apply(self, [next, m || model, eData || eventData]) :
                    em.handleDirect(eventName, eData || eventData, m || model, self);
            };

        console.log('handle...');
        next(model, eventData);
    },

    create: function (eventPath=false) {
        let em = Object.defineProperties(Object.create(this), {
            routes: {
                value: {},
                writable: false,
                enumerable: false
            },
            middle: {
                value: [],
                writable: false,
                enumerable: false
            }
        });

        if (eventPath) {
            // Discover middleware
            _.forEach(glob.sync(eventPath + '/**/*.middleware.js'), ef => {
                ef = path.relative(__dirname, ef);
                em.use(require(`./${ef}`));
            });
            // Discover events
            _.forEach(glob.sync(eventPath + '/**/*.event.js'), ef => {
                let name = ef.substring(ef.lastIndexOf('/') + 1, ef.indexOf('.event.js'));

                ef = path.relative(__dirname, ef);
                em.register(name, require(`./${ef}`));
            });
        }

        return em;
    }
};
