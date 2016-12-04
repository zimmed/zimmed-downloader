const expect = require('chai').expect;
const SimpleCache = require('./simple-cache');

describe('A Simple Cache', () => {

    beforeEach(() => {
        SimpleCache.wipeAll();
    });

    it('should create', () => {
        let cache = SimpleCache('test');
        expect(cache).to.exist;
        expect(cache).to.have.property('get');
        expect(cache).to.have.property('set');
        expect(cache).to.have.property('del');
    });

    it('should set, get and del', () => {
        let cache = SimpleCache('test');
        expect(cache.get('prop')).to.not.exist;
        expect(cache.get('prop', 50)).to.equal(50);
        expect(cache.get('prop')).to.not.exist;
        cache.set('prop', 10);
        expect(cache.get('prop')).to.equal(10);
        cache.set('some.obj.prop', {a: 'apple'});
        expect(cache.get('some.obj.prop.a')).to.equal('apple');
        expect(cache.get('some').obj.prop.a).to.equal('apple');
        cache.del('some.obj');
        expect(cache.get('some.obj')).to.not.exist;
        expect(cache.get('some')).to.exist;
    });

    it('should get existing caches', () => {
        let cache = SimpleCache('test'),
            copy = SimpleCache('test');
        expect(cache).to.equal(copy);
        cache.set('prop', 100);
        expect(copy.get('prop')).to.equal(100);
    });

    it('should not share namespaces', () => {
        let cache = SimpleCache('test'),
            other = SimpleCache('test2');
        expect(cache).to.not.equal(other);
        cache.set('prop', 100);
        expect(other.get('prop')).to.not.exist;
    });
});
