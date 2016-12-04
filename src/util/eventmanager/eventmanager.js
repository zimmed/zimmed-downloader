const _ = require('lodash');
const glob = require('glob');
const path = require('path');

module.exports = {

    register: function (eventName, eventHandler, id=null, em=this) {
        if (!em.routes.hasOwnProperty(eventName)) {
            em.routes[eventName] = [];
        }
        em.routes[eventName].push({handler: eventHandler, id});
    },

    deregister: function (eventName, id=null, em=this) {
        if (em.routes.hasOwnProperty(eventName)) {
            em.routes[eventName] = _.filter(em.routes[eventName], r => {
                return id !== null && r.id !== id;
            });
        }
    },

    on: this.register,

    off: this.deregister,

    handle: function (eventName, eventData, model, self, em=this) {
        if (em.routes.hasOwnProperty(eventName)) {
            em.routes[eventName].forEach((r) => {
                r.handler.apply(self, [model, eventData]);
            });
        } else {
            throw new Error(`Uncaught event '${eventName}'`);
        }
    },

    create: function (eventPath=false) {
        let em = Object.defineProperties(Object.create(this), {
            routes: {
                value: {},
                writable: false,
                enumerable: false
            }
        });

        if (eventPath) {
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
