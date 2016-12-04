const expect = require('chai').expect;
const RSA = require('./rsa');
const b64 = require('./b64');
const nodeRSA = require('node-rsa');

const ONE_K = 1024;
const SIGNED_TWO_BYTES = 32767;

describe('RSA', () => {

    it('should exist', () => {
        expect(RSA).to.exist;
        expect(RSA).to.have.property('create');
        expect(RSA.create).to.be.a('function');
    });

    it('should create with default params', () => {
        let key = null;

        expect(() => key = RSA.create()).to.not.throw(Error);
        expect(key).to.be.ok;
        expect(key).to.have.property('pub');
        expect(key).to.have.property('decrypt');
        expect(key.pub).to.be.a('function');
        expect(key.decrypt).to.be.a('function');
    });

    it('should create with specific params', () => {
        let key = null;

        expect(() => key = RSA.create(ONE_K, SIGNED_TWO_BYTES)).to.not.throw(Error);
        expect(key).to.be.ok;
        expect(key).to.have.property('pub');
        expect(key).to.have.property('decrypt');
        expect(key.pub).to.be.a('function');
        expect(key.decrypt).to.be.a('function');
    });

    describe('pub', () => {

        it('should produce the public key', () => {
            let key = RSA.create(),
                pubData = null;

            expect(() => pubData = key.pub()).to.not.throw(Error);
            expect(pubData).to.be.ok;
            expect(pubData).to.be.a('string');
            expect(pubData).to.equal(key.pub());
        });
    });

    describe('decrypt', () => {
        let key, pubKey, testString, testJson;

        beforeEach(() => {
            testString = 'Some sweet-ass data';
            testJson = {some: 'sweet-ass', data: 0, and: {more: 'data'}};
            key = RSA.create();
            pubKey = new nodeRSA(key.pub());
        });

        it('should decrypt string data encrypted from the public key', () => {
            let encrypted = b64.encode(pubKey.encrypt(testString, 'base64', 'utf8')),
                decrypted = null;

            expect(() => decrypted = key.decrypt(encrypted)).to.not.throw(Error);
            expect(decrypted).to.be.ok;
            expect(decrypted).to.be.a('string');
            expect(decrypted).to.equal(testString);
        });

        it('should decrypt json data encrypted from the public key', () => {
            let encrypted = b64.encode(pubKey.encrypt(testJson, 'base64', 'utf8')),
                decrypted = null;

            expect(() => decrypted = key.decrypt(encrypted)).to.not.throw(Error);
            expect(decrypted).to.be.ok;
            expect(decrypted).to.be.an('Object');
            expect(decrypted).to.eql(testJson);
        });

    });

});
