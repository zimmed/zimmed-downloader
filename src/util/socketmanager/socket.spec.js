const expect = require('chai').expect;
const SocketManager = require('./socket');
const EM = require('../eventmanager');

describe('A SocketManager', () => {
    it('should create', () => {
        let game = {}, sm;
        expect(SocketManager).to.have.property('create');
        expect(SocketManager).to.have.property('get');
        sm = SocketManager.create('ex1', 'localhost', 6001, game, EM.create());
        expect(sm).to.exist;
        expect(sm).to.have.property('eventManager');
        expect(sm).to.have.property('connectionServer');
        expect(sm).to.have.property('connectionGroup');
        expect(sm).to.have.property('httpServer');
        expect(sm).to.have.property('model');
        expect(sm.model).to.equal(game);
        game.prop = 'prop';
        expect(sm.model).to.equal(game);
    });
});
