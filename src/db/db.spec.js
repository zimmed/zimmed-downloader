var expect = require('chai').expect;
var DB = require('./db');

describe('The DB Manager', () => {

	it('should exist', () => {
		expect(DB).to.exist;
		expect(DB).to.have.property('createDB');
		expect(DB).to.have.property('table');
		expect(DB).to.have.property('ready');
	});
	it('should create a db ref', () => {
		let db = DB.createDB('test');

		expect(db).to.exist;
		expect(db).to.have.property('dbName');
		expect(db.dbName).to.equal('test');
		expect(db).to.have.property('ready');
		expect(db).to.have.property('table');
		expect(db).to.have.property('scope');
	});
	it('should create a db.table ref', () => {
		let table = DB.createDB('test', 'test');

		expect(table).to.exist;
		expect(table).to.have.property('name');
		expect(table.name).to.equal('test.test');
	});
	it('should upsert a new db ref and delete an existing ref', (done) => {
		let dbName = 'test' + Math.floor(Math.random() * 10000),
			db = DB.createDB(dbName);

		expect(db).to.exist;
		expect(db.dbName).to.equal(dbName);
		db.ready()
			.then((copy) => {
				expect(copy).to.exist;
				expect(copy).to.equal(db);
				return DB.deleteDB(dbName);
			})
            .then(deleted => {
                expect(deleted).to.equal(1);
                done();
            })
            .catch(done);
	});

});

describe('A DB Ref', () => {
	var _db;

	beforeEach(() => {
		_db = DB.createDB('test' + Math.floor(Math.random() * 10000));
	});

	afterEach(done => {
		return _db && _db.deleteDB().then(() => { _db = null; done(); }).catch(done) || done();
	});

	it('should delete itself', done => {
		_db.ready()
			.then((db) => {
				return db
					.deleteDB()
					.then(count => {
						expect(count).to.equal(1);
						_db = null;
						done();
					})
			})
			.catch(done);
	});

	it('should create a table', () => {
		let table = _db.table('test');

		expect(table).to.exist;
		expect(table).to.have.property('name');
		expect(table.name).to.equal(_db.dbName + '.test');
	});

	it('should ready itself', done => {
		_db.ready()
			.then((db) => {
				expect(db.scope).to.not.be.null;
				expect(db).to.equal(_db);
				done();
			})
			.catch(done);
	});
});
