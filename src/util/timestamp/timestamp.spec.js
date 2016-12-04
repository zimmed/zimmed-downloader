const expect = require('chai').expect;
const timestamp = require('./timestamp');

const SECOND = 1000;
const MINUTE = 60000;

describe('Timestamp', () => {

    it('should generate a timestamp in seconds', () => {
        let ts = timestamp(),
            tsb = Math.floor((new Date()).getTime() / SECOND);

        expect(ts).to.exist;
        expect(typeof(ts)).to.equal('number');
        expect(ts).to.equal(tsb);
        expect(timestamp()).to.equal(timestamp('s'));
    });

    it('should generate a timestamp in milliseconds', () => {
        let ts = timestamp('ms'),
            tsb = (new Date()).getTime();

        expect(ts).to.exist;
        expect(typeof(ts)).to.equal('number');
        expect(ts).to.be.lte(tsb);
        expect(ts).to.be.gt(tsb - 50);
    });

    it('should generate a timestamp in minutes', () => {
        let ts = timestamp('m'),
            tsb = Math.floor((new Date()).getTime() / MINUTE);

        expect(ts).to.exist;
        expect(typeof(ts)).to.equal('number');
        expect(ts).to.equal(tsb);
    });
});
