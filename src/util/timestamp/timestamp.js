module.exports = function (type='s') {
    let t = new Date().getTime();

    return type === 'ms' && t ||
        type === 's' && Math.floor(t / 1000) ||
        type === 'm' && Math.floor(t / 60000) ||
        null;
};
