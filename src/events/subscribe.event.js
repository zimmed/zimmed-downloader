module.exports = function subscribe(mgr) {
    let socket = this,
        queueUpdate = (mgr_, con) => {
            socket.emit('mgr-queue-update', con.stripForUpdate());
        };

    mgr.opts.onDLProcess = queueUpdate;
    mgr.opts.onDLProgress = queueUpdate;
};
