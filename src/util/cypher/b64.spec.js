const expect = require('chai').expect;
const b64 = require('./b64');

describe('Base64', () => {
    it('should have methods', () => {
        expect(b64).to.exist;
        expect(b64).to.have.property('encode');
        expect(b64).to.have.property('decode');
    });
    it('should work', () => {
        let utf8 = "Hello @ world!",
            hex = "ae4f9910df",
            utf8_base64 = b64.encode(utf8),
            hex_base64 = b64.encode(hex, 'hex');
        expect(utf8_base64).to.exist;
        expect(utf8_base64.length).to.be.gt(0);
        expect(utf8_base64).to.not.equal(utf8);
        expect(hex_base64).to.exist;
        expect(hex_base64.length).to.be.gt(0);
        expect(hex_base64).to.not.equal(hex);
        expect(b64.decode(utf8_base64)).to.equal(utf8);
        expect(b64.decode(hex_base64, 'hex')).to.equal(hex);
    });
});
