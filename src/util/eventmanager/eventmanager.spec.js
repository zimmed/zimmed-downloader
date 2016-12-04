const expect = require('chai').expect;
const EventManager = require('./eventmanager');

describe('The EventManager', () => {
    it('should create', () => {
        let emExample = EventManager.create();
        expect(emExample).to.exist;
        expect(emExample).to.have.property('handle');
        expect(typeof(emExample.handle)).to.equal('function');
        expect(emExample).to.have.property('register');
        expect(typeof(emExample.register)).to.equal('function');
        expect(emExample).to.have.property('routes');
        expect(typeof(emExample.routes)).to.equal('object');
    });
    it('should register and resolve handlers', (done) => {
        let game = {}, server = {}, client = {}, self = {client, server},
            emExample = EventManager.create(),
            eventAHandler = function (game, {arg1, arg2}={}) {
                expect(arg1).to.equal(10);
                expect(arg2).to.equal("ten");
                expect(this).to.have.property('client');
                expect(this).to.have.property('server');
                expect(game).to.exist;
                this._test_data = "expected";
            },
            eventAHandlerB = function () {
                expect(this).to.have.property('_test_data');
                expect(this._test_data).to.equal("expected");
                this._test_data = '';
            },
            eventBHandler = function (game) {
                expect(this.client).to.equal(client);
                expect(this.server).to.equal(server);
                expect(game).to.equal(game);
                done();
            };
        emExample.register('event a', eventAHandler);
        emExample.register('event a', eventAHandlerB, 'temp');
        emExample.register('event b', eventBHandler);
        emExample.handle('event a', {arg1: 10, arg2: 'ten'}, game, self);
        expect(self._test_data).to.equal('');
        emExample.deregister('event a', 'temp');
        emExample.handle('event a', {arg1: 10, arg2: 'ten'}, game, self);
        expect(self._test_data).to.equal('expected');
        emExample.handle('event b', null, game, {client, server});
    });
});
