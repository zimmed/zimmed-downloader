const _ = require('lodash');
const expect = require('chai').expect;
const Size = require('./byte-size');

const Ki = 1024;

describe('byteSize', () => {

    it('should exist', () => {
        expect(Size).to.exist;
        expect(Size).to.be.a('function');
    });

    it('should instantiate a size object from byte num', () => {
        let s = null;

        expect(() => s = Size(Ki)).to.not.throw(Error);
        expect(s).to.be.ok;
        expect(s).to.have.property('value');
        expect(s.value).to.be.a('function');
        expect(s.value()).to.equal(Ki);
        expect(Size(0)).to.not.be.ok;
    });

    it('should create a size object from bits', () => {
        let sizes = [
            {s: Size('8000bps'), b: 1000},
            {s: Size('64b/s'), b: 8},
            {s: Size('8000000b'), b: 1000000},
            {s: Size('8Bit'), b: 1},
            {s: Size('80BITS'), b: 10},
            {s: Size('9.2'), b: 9}
        ];

        _.forEach(sizes, obj => {
            let size = obj.s, expected = obj.b;

            expect(size).to.be.ok;
            expect(size.value()).to.equal(expected);
        });
        expect(Size('2.3b')).to.not.be.ok;
    });

    it('should create a size object from bytes', () => {
        let sizes = [
            {s: Size('1024B'), b: 1024},
            {s: Size('10bytes'), b: 10},
            {s: Size('80B/s'), b: 80},
            {s: Size('1.49B'), b: 1},
            {s: Size('3.5'), b: 4}
        ];

        _.forEach(sizes, obj => {
            let size = obj.s, expected = obj.b;

            expect(size).to.be.ok;
            expect(size.value()).to.equal(expected);
        });
    });

    it('should create a size object from kilo notation', () => {
        let sizes = [
            {s: Size('4KB'), b: 4000},
            {s: Size('8Kb'), b: 1000},
            {s: Size('1024KiB'), b: Ki * Ki},
            {s: Size('2k'), b: 2000},
            {s: Size('3K'), b: 3000},
            {s: Size('0.5KB/s'), b: 500},
            {s: Size('8kbps'), b: 1000},
            {s: Size('4Kb'), b: 500}
        ];

        _.forEach(sizes, obj => {
            let size = obj.s, expected = obj.b;

            expect(size).to.be.ok;
            expect(size.value()).to.equal(expected);
        });
    });

    it('should create a size object from mega notation', () => {
        let sizes = [
            {s: Size('4MB'), b: 4000000},
            {s: Size('8Mb'), b: 1000000},
            {s: Size('1024MiB'), b: Ki * Ki * Ki},
            {s: Size('2m'), b: 2000000},
            {s: Size('3M'), b: 3000000},
            {s: Size('0.5MB/s'), b: 500000},
            {s: Size('8mbps'), b: 1000000},
            {s: Size('4Mb'), b: 500000}
        ];

        _.forEach(sizes, obj => {
            let size = obj.s, expected = obj.b;

            expect(size).to.be.ok;
            expect(size.value()).to.equal(expected);
        });
    });

    it('should create a size object from giga notation', () => {
        let sizes = [
            {s: Size('4GB'), b: 4000000000},
            {s: Size('8Gb'), b: 1000000000},
            {s: Size('1024GiB'), b: Ki * Ki * Ki * Ki},
            {s: Size('2g'), b: 2000000000},
            {s: Size('3G'), b: 3000000000},
            {s: Size('0.5GB/s'), b: 500000000},
            {s: Size('8gbps'), b: 1000000000},
            {s: Size('4Gb'), b: 500000000}
        ];

        _.forEach(sizes, obj => {
            let size = obj.s, expected = obj.b;

            expect(size).to.be.ok;
            expect(size.value()).to.equal(expected);
        });
    });

    it('should create a size object from tera notation', () => {
        let sizes = [
            {s: Size('4TB'), b: 4000000000000},
            {s: Size('8Tb'), b: 1000000000000},
            {s: Size('1024TiB'), b: Ki * Ki * Ki * Ki * Ki},
            {s: Size('2t'), b: 2000000000000},
            {s: Size('3T'), b: 3000000000000},
            {s: Size('0.5TB/s'), b: 500000000000},
            {s: Size('8tbps'), b: 1000000000000},
            {s: Size('4Tb'), b: 500000000000}
        ];

        _.forEach(sizes, obj => {
            let size = obj.s, expected = obj.b;

            expect(size).to.be.ok;
            expect(size.value()).to.equal(expected);
        });
    });

    describe('value output', () => {

        it('should give bytes by default', () => {
            let size = Size('1KiB');

            expect(size.value()).to.equal(Ki);
        });

        it('should provide decimal places when requested', () => {
            let size = Size('0.25KiB');

            expect(size.value()).to.equal(256);
            expect(size.value('KiB')).to.equal(0);
            expect(size.value('KiB', 1)).to.equal(0.3);
            expect(size.value('KiB', 2)).to.equal(0.25);
            expect(size.value('KiB', 5)).to.equal(0.25);
            expect(size.value('M')).to.equal(0);
            expect(size.value('M', 3)).to.equal(0);
            expect(size.value('M', 6)).to.equal(0.000256);
        });

        it('should show bits when requested', () => {
            let size = Size('1KiB');

            expect(size.value('b')).to.equal(Ki * 8);
            expect(size.value('Bit')).to.equal(Ki * 8);
        });

        it('should show kilo notation when requested', () => {
            let size = Size('4K');

            expect(size.value('k')).to.equal(4);
            expect(size.value('KiB')).to.equal(4);
            expect(size.value('kb')).to.equal(32);
            expect(size.value('kB')).to.equal(4);
        });

        it('should show mega notation when requested', () => {
            let size = Size('0.5GiB');

            expect(size.value('m')).to.equal(537);
            expect(size.value('MiB')).to.equal(512);
            expect(size.value('mb')).to.equal(4295);
            expect(size.value('mB')).to.equal(537);
        });

        it('should show giga notation when requested', () => {
            let size = Size('0.5TiB');

            expect(size.value('g')).to.equal(550);
            expect(size.value('GiB')).to.equal(512);
            expect(size.value('gb')).to.equal(4398);
            expect(size.value('gB')).to.equal(550);
        });

        it('should show tera notation when requested', () => {
            let size = Size('512TiB');

            expect(size.value('t')).to.equal(563);
            expect(size.value('TiB')).to.equal(512);
            expect(size.value('tb')).to.equal(4504);
            expect(size.value('tB')).to.equal(563);
        });
    });

    describe('best output', () => {

        it('should find the best output for any given size', () => {
            expect(Size(4).best()).to.equal('4');
            expect(Size('999KiB').best()).to.equal('999KiB');
            expect(Size('99.59KiB').best()).to.equal('99.6KiB');
            expect(Size('9.44444KiB').best()).to.equal('9.44KiB');
            expect(Size('1024MiB').best()).to.equal('1GiB');
            expect(Size('1280GiB').best()).to.equal('1.25TiB');
            expect(Size('123TB').best()).to.equal('112TiB');
            expect(Size('999999TiB').best()).to.equal('977PiB');
        });
    });
});
