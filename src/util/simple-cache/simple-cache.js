const cacheRegistry = {};

const simpleCache = module.exports = (id) => {
    return cacheRegistry.hasOwnProperty(id) && cacheRegistry[id] || simpleCache.createCache(id);
};

simpleCache.createCache = (id) => {
    let store = {},
        cache = {
            set: function(key, value) {
                let i, l, scope, keys = key.split('.');

                if (keys.length === 1) {
                    store[key] = value;
                } else {
                    scope = store;
                    for (i = 0, l = keys.length - 1; i < l; i++) {
                        scope[keys[i]] = {};
                        scope = scope[keys[i]];
                    }
                    scope[keys[keys.length-1]] = value;
                }
                return value;
            },

            get: (key, def) => {
                let i, l, scope, keys = key.split('.');

                if (keys.length === 1) {
                    return store.hasOwnProperty(key) && store[key] || def;
                }
                scope = store;
                for (i = 0, l = keys.length; i < l; i++) {
                    if (!scope.hasOwnProperty(keys[i])){
                        return def;
                    }
                    scope = scope[keys[i]];
                }
                return scope;
            },

            del: function(key) {
                let final, scope, keys = key.split('.');

                if (keys.length === 1) {
                    delete store[key];
                } else {
                    final = keys.pop();
                    scope = this.get(keys.join('.'));
                    if (typeof(scope) !== 'undefined') {
                        delete scope[final];
                    }
                }
                return true;
            }
        };
    cacheRegistry[id] = cache;
    return cache;
};

simpleCache.wipe = (cache) => {
    if (Array.isArray(cache)) {
        cache.forEach((el) => {
            if (typeof(cache) === 'object') {
                simpleCache.wipe(el);
            }
        });
        cache.splice(0, cache.length);
    } else {
        Object.keys(cache).forEach((key) => {
            if (typeof(cache[key]) === 'object') {
                simpleCache.wipe(cache[key]);
            }
            delete cache[key];
        });
    }
};

simpleCache.wipeAll = () => {
    simpleCache.wipe(cacheRegistry);
};
