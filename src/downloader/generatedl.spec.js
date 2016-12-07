const expect = require('chai').expect;
const generate = require('./generatedl');
const Config = require('../test-config');

describe('Download Generator', () => {

    it('should exist', () => {
        expect(generate).to.exist;
        expect(generate).to.be.a('function');
    });

    it('should grab the passthrough data for rapidgator (Takes a second....)', (done) => {
        expect(() => {
            generate(Config.rgAcct, Config.rgLink)
                .then(data => {
                    expect(data).to.be.ok;
                    expect(data).to.have.property('name');
                    expect(data).to.have.property('src');
                    expect(data).to.have.property('url');
                    expect(data).to.have.property('cookie');
                    expect(data.name).to.equal(Config.linkName);
                    expect(data.src).to.be.a('string');
                    expect(data.src).to.match(/^http(s|):\/\/[a-z0-9]+\.rapidgator.net\/.+$/i);
                    expect(data.url).to.equal(Config.rgLink);
                    expect(data.cookie).to.equal('');
                    done();
                }).catch(done)
        }).to.not.throw(Error);
    }).timeout(Config.passthroughTimeout);
});
