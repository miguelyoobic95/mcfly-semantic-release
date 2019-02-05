'use strict';
const expect = require('chai').expect;
const versionHelper = require('../../lib/versionHelper');
const fileHelper = require('../../lib/fileHelper');
const _ = require('lodash');

describe('versionHelper', () => {
    describe('filterFiles()', () => {
        it('should succeed when extension exists', () => {
            expect(versionHelper.filterFiles(['package1.json', 'package2.json', 'somefile1.xml', 'somefile1.xml'], '.json')).to.eql(['package1.json', 'package2.json']);
            expect(versionHelper.filterFiles(['package1.json', 'package2.json', 'somefile1.xml', 'somefile1.xml'], '.xml')).to.eql(['somefile1.xml', 'somefile1.xml']);

        });

        it('should returns empty array when extension does not exist', () => {
            expect(versionHelper.filterFiles(['package1.json'], '.xml')).to.eql([]);
        });

        it('should returns empty array  when list of files is empty', () => {
            expect(versionHelper.filterFiles([], '.xml')).to.eql([]);
        });

        it('should returns list as-is when extension is not provided', () => {
            var files = ['package1.json', 'package2.json', 'somefile1.xml', 'somefile1.xml'];
            expect(versionHelper.filterFiles(files)).to.eql(files);
        });
    });

    describe('bump()', () => {

        it('should succeed', () => {
            expect(versionHelper.bump('2.3.1', 'patch')).to.equal('2.3.2');
            expect(versionHelper.bump('2.3.1', 'minor')).to.equal('2.4.0');
            expect(versionHelper.bump('2.3.1', 'major')).to.equal('3.0.0');

        });
        it('should cater for prereleases', () => {
            expect(versionHelper.bump('2.3.1', 'prerelease')).to.equal('2.3.2-0');
            expect(versionHelper.bump('2.3.2-4', 'patch')).to.equal('2.3.2');
        });

        it('should default to patch when no bumpType', () => {
            expect(versionHelper.bump('1.0.12')).to.equal('1.0.13');
        });

        it('should default to patch when bumpType is invalid', () => {
            expect(versionHelper.bump('1.0.12', 'something')).to.equal('1.0.13');
        });

        it('should return 0.0.1 when initial version is empty', () => {
            expect(versionHelper.bump()).to.equal('0.0.1');
        });

        it('should return 0.0.1 when initial version is invalid', () => {
            expect(versionHelper.bump('something')).to.equal('0.0.1');
        });

    });

    describe('bumpFiles()', () => {

        it('should succeed', (done) => {
            var files = ['./test/assets/package.json', './test/assets/bower.json', './test/assets/config.xml'];
            var version = '3.4.11';
            versionHelper.bumpFiles(files, version, './test/results')
                .then(res => {
                    expect(res).to.be.an('array');
                    expect(res.length).to.equal(files.length);
                    var packageJson = fileHelper.readTextFile('./test/results/package.json');
                    var bowerJson = fileHelper.readTextFile('./test/results/bower.json');
                    var configXML = fileHelper.readTextFile('./test/results/config.xml');
                    expect(JSON.parse(packageJson).version).to.equal(version);
                    expect(JSON.parse(bowerJson).version).to.equal(version);
                    expect(configXML.indexOf(`version="${version}"`)).to.be.above(1);
                    expect(_.find(res, {
                        file: files[0]
                    }).content).to.equal(packageJson);
                    expect(_.find(res, {
                        file: files[1]
                    }).content).to.equal(bowerJson);
                    expect(_.find(res, {
                        file: files[2]
                    }).content).to.equal(configXML);
                    done();
                })
                .catch(done);
        });
    });

});
