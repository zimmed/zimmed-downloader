const expect = require('chai').expect;
const aes = require('./aes');

describe('AES Cipher', () => {
    it('should have the desired methods', () => {
        expect(aes).to.exist;
        expect(aes).to.have.property('encrypt');
        expect(aes).to.have.property('decrypt');
        expect(aes).to.have.property('encryptJson');
        expect(aes).to.have.property('toJson');
    });
    it('should encrypt and decrypt a utf-8 string', () => {
        let decryptedData,
            data = "Some utf8 content...",
            key = "fish123",
            encryptedData = aes.encryptUtf8(key, data);
        expect(encryptedData).to.exist;
        expect(encryptedData).to.have.property('content');
        expect(encryptedData).to.have.property('tag');
        expect(encryptedData).to.have.property('ts');
        expect(encryptedData.content.length).to.be.gt(0);
        expect(encryptedData.tag.length).to.be.gt(0);
        expect(encryptedData.ts).to.be.gt(0);
        expect(encryptedData.content).to.not.equal(data);
        expect(encryptedData.tag).to.not.eql(aes.encryptUtf8(key, data).tag);
        decryptedData = aes.decryptToUtf8(key, encryptedData.content, encryptedData.tag, encryptedData.ts);
        expect(decryptedData).to.not.be.null;
        expect(decryptedData).to.equal(data);
        expect(encryptedData).to.not.eql(aes.encryptUtf8('123fish', data));
        expect(encryptedData).to.not.eql(aes.encryptUtf8(key, "Some other content"));
        expect(aes.decryptToUtf8("wrong key", encryptedData.content, encryptedData.tag, encryptedData.ts)).to.be.null;
        expect(aes.decryptToUtf8(key, "Wrong data", encryptedData.tag, encryptedData.ts)).to.be.null;
        expect(aes.decryptToUtf8(key, encryptedData.content, "wrong tag", encryptedData.ts)).to.be.null;
        expect(aes.decryptToUtf8(key, encryptedData.content, encryptedData.tag, (new Date()).getTime())).to.be.null;
    });
    it('should encrypt and decrypt a JSON object', () => {
        let newData,
            key = 'WHATEVER',
            data = {
            prop: "my prop",
            arr: [1,2,{}],
            ok: {
                things: "things"
            }
        };
        // Sanity check
        expect(JSON.parse(JSON.stringify(data))).to.eql(data);
        // AES
        let {content, tag, ts} = aes.encryptJson(key, data);
        expect(content).to.exist;
        expect(tag).to.exist;
        expect(ts).to.exist;
        newData = aes.decrypt(key, content, tag, ts);
        expect(newData).to.not.be.null;
        expect(newData).to.eql(data);
        expect(aes.decrypt(key, content, tag, ts)).to.eql(newData);
        newData.prop = "something new";
        expect(newData).to.not.eql(data);
        expect(aes.decrypt(key, content, tag, ts)).to.not.eql(newData);
    });
});
