const chai = require('chai');
const expect = require('chai').expect;
const mktemp = require('mktemp');
const rmdir = require('rmdir');
const fs = require('fs');
const path = require('path');
const download = require('./download');
const Config = require('../test-config');
const Size = require('../util/byte-size');

const FILE_SRC = Config.httpLink;
const FILE_SIZE = Config.linkSize;
const FILE_SIZE_BEST = Size(FILE_SIZE).best();
const DL_TIMEOUT = 30;
const TEMP_DIR_MASK = 'XXXXX';
const TEMP_FILE_NAME = 'DLTest.zip';

const SECOND = 1000;
const MiB = 1048576;
const KiB = 1024;

describe('Download', () => {

    describe('stripUnicode', () => {
        const buffer = '\r \n\r \u001b[32;3m[\u001bNOTICE\u001b] [9m\u001bSome things\u001b.\r\n';
        const expected = '[NOTICE] Some things.';

        it('should filter buffer into a nice string', () => {
            let str;

            expect(() => { str = download.stripUnicode(buffer); }).to.not.throw(Error);
            expect(str).to.equal(expected);
        });
    });

    describe('parseData', () => {
        const notice = 'Some things [NOTICE] The notice message.';
        const payloadNotice = 'The notice message.';
        const updateETA = '[#12345 2.5KiB/10KiB(25%) CN:2 DL:1.0KiB/sec ETA:6s]';
        const payloadUpdateETA = {transferred: Math.floor(2.5 * KiB + 0.5), total: Math.floor(10 * KiB + 0.5), progress: 25, connections: 2, rate: KiB, eta: '6s'};
        const update = '[#12345 2.5MiB/10.4MiB(24%) CN:2 DL:1.4MiB/sec]';
        const payloadUpdate = {transferred: Math.floor(2.5 * MiB + 0.5), total: Math.floor(10.4 * MiB + 0.5), progress: 24, connections: 2, rate: Math.floor(1.4 * MiB + 0.5), eta: '0s'};
        const bad = 'Some random data';

        describe('parseNotice', () => {

            it('should parse notices', () => {
                expect(download.parseNotice(notice)).to.eql({type:'notice', payload: payloadNotice});
                expect(download.parseNotice(update)).to.not.be.ok;
                expect(download.parseNotice(bad)).to.not.be.ok;
            });
        });

        describe('parseUpdate', () => {

            it('should parse updates', () => {
                expect(download.parseUpdate(update)).to.eql({type:'update', payload: payloadUpdate});
                expect(download.parseUpdate(updateETA)).to.eql({type:'update', payload: payloadUpdateETA});
                expect(download.parseUpdate(notice)).to.not.be.ok;
                expect(download.parseUpdate(bad)).to.not.be.ok;
            })
        });

        it('should parse notice correctly', () => {
            expect(download.parseData(notice)).to.eql({type:'notice', payload: payloadNotice});
        });

        it('should parse update with ETA correctly', () => {
            expect(download.parseData(updateETA)).to.eql({type:'update', payload: payloadUpdateETA});
        });

        it('should parse update without ETA correctly', () => {
            expect(download.parseData(update)).to.eql({type:'update', payload: payloadUpdate});
        });

        it('should parse unrecognized data correctly', () => {
            expect(download.parseData(bad)).to.not.be.ok;
        });
    });

    describe(`spawnDownloader (Downloading ${FILE_SIZE_BEST} file; may take time...)`, () => {
        let tempPath = null;

        beforeEach(done => {
            mktemp.createDir(TEMP_DIR_MASK)
                .then(path => {
                    tempPath = path;
                    done();
                }).catch(done);
        });

        afterEach(done => {
            rmdir(tempPath, () => {
                tempPath = null;
                done();
            });
        });

        it(`should download a valid file (${FILE_SIZE_BEST})`, done => {
            let proc = null;

            expect(() => {
                proc = download.spawnDownloader({dir: tempPath}, FILE_SRC, TEMP_FILE_NAME);
            }).to.not.throw(Error);
            expect(proc).to.be.ok;
            expect(() => {
                proc.on('exit', code => {
                    expect(code).to.equal(0);
                    fs.stat(path.join(tempPath, TEMP_FILE_NAME), (err, stats) => {
                        expect(stats).to.be.ok;
                        expect(err).to.not.be.ok;
                        expect(Size(stats.size).best()).to.equal(Size(FILE_SIZE).best());
                        done();
                    });
                });
            }).to.not.throw(Error);
        }).timeout(DL_TIMEOUT * SECOND);

        it('should not download an invalid file', done => {
            const bad = 'http://localhost/does_not_exist.file';
            let proc = download.spawnDownloader({dir: tempPath}, bad, tempPath);

            expect(proc).to.be.ok;
            proc.on('exit', code => {
                expect(code).to.not.equal(0);
                expect(code).to.equal(1);
                fs.exists(path.join(tempPath, bad), exists => {
                    expect(exists).to.equal(false);
                    done();
                });
            });
        });
    });

    describe(`Self (Downloading ${FILE_SIZE_BEST} file; may take time...)`, () => {
        let tempPath = null;

        beforeEach(done => {
            mktemp.createDir(TEMP_DIR_MASK)
                .then(path => {
                    tempPath = path;
                    done();
                }).catch(done);
        });

        afterEach(done => {
            rmdir(tempPath, () => {
                tempPath = null;
                done();
            });
        });

        it(`should download a valid file (${FILE_SIZE_BEST})`, done => {
            download({
                dir: tempPath,
                datastream: {
                    write: (data) => {
                        expect(data).to.be.ok;
                        expect(data).to.have.property('type');
                        expect(data).to.have.property('payload');
                        if (data.type === 'update') {
                            expect(Size(data.payload.total).best()).to.equal(Size(FILE_SIZE).best())
                        }
                    }
                }
            }, FILE_SRC, TEMP_FILE_NAME)
                .then(completePath => {
                    expect(completePath).to.equal(path.join(tempPath, TEMP_FILE_NAME));
                    fs.stat(completePath, (err, stats) => {
                        expect(err).to.not.be.ok;
                        expect(stats).to.be.ok;
                        expect(Size(stats.size).best()).to.equal(Size(FILE_SIZE).best());
                        done(err);
                    });
                }).catch(done)
        }).timeout(DL_TIMEOUT * SECOND);
    });
});
