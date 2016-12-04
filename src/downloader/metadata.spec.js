const expect = require('chai').expect;
const Config = require('../test-config');
const Size = require('../util/byte-size');
const metadata = require('./metadata');

const OK = '0';

describe('Metadata retriever', () => {

    it('should exist', () => {
        expect(metadata).to.exist;
        expect(metadata).to.be.a('function');
    });

    it('should retrieve metadata for rapidgator link (May take a second...)', (done) => {
        expect(() => {
            metadata(Config.rgLink)
                .then(data => {
                    expect(data).to.be.ok;
                    expect(data).to.be.an('Object');
                    expect(data).to.have.property('name');
                    expect(data).to.have.property('state');
                    expect(data).to.have.property('hash');
                    expect(data).to.have.property('size');
                    expect(data).to.have.property('url');
                    expect(data.name).to.equal(Config.linkName);
                    expect(data.state).to.equal(OK);
                    expect(data.hash).to.be.empty;
                    // expect(Size(data.size).best()).to.equal(Size(Config.linkSize).best());
                    // Rapidgator is dumb. They use MB inconsistently.
                    expect(data.url).to.equal(Config.rgLink);
                    done();
                }).catch(done)
        }).to.not.throw(Error);
    }).timeout(Config.passthroughTimeout);

    it('should retrieve metadata for multiple links at once (Will take a few seconds...)', (done) => {
        metadata(Config.rgLink, 'http://invalid.wrong/no_file_here.htm', Config.rgLink)
            .then(data => {
                expect(data).to.be.ok;
                expect(data).to.be.an('array');
                expect(data.length).to.equal(2);
                expect(data[0]).to.eql(data[1]);
                expect(data[0]).to.have.property('name');
                expect(data[0]).to.have.property('state');
                expect(data[0].name).to.equal(Config.linkName);
                expect(data[0].state).to.equal(OK);
                done();
            }).catch(done);
    }).timeout(Config.passthroughTimeout);
});
