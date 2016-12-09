const _ = require('lodash');

module.exports = function subscribe(mgr) {
    mgr.opts.onDLProcess = _.noop;
    mgr.opts.onDLProgress = _.noop;
};
