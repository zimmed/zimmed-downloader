var expect = require('chai').expect;
var Hashes = require('./hash');

const HEX = 16;
const TWO_PLACES = 100;
const B64_MAX = 28;
const B64_MIN = 24;
const HEX_LEN = 40;

describe('The Hasher', () => {
    it('should hash to base64 correctly', () => {
        let Hash = Hashes.base64,
            key = 'fish123',
            ts = (new Date()).getTime(),
            data = (Math.random() * HEX * TWO_PLACES).toString(HEX);
            hash = Hash(key, ts, data);
        expect(hash).to.exist;
        expect(typeof(hash)).to.equal('string');
        expect(hash.length).to.be.lte(B64_MAX);
        expect(hash.length).to.be.gt(B64_MIN);
        expect(hash).to.equal(Hash(key, ts, data));
        expect(hash).to.not.equal(Hash(key, (new Date()).getTime(), data, Math.random()));
    });

    it ('should hash to hex correctly', () => {
        let Hash = Hashes.hex,
            key = 'fish123',
            ts = (new Date()).getTime(),
            data = (Math.random() * HEX * TWO_PLACES).toString(HEX),
            hash = Hash(key, ts, data);
        expect(hash).to.exist;
        expect(typeof(hash)).to.equal('string');
        expect(hash.length).to.equal(HEX_LEN);
        expect(hash).to.equal(Hash(key, ts, data));
        expect(hash).to.not.equal(Hash(key, (new Date()).getTime(), data, Math.random()));
    });
});
