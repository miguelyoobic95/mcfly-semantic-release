'use strict';
const expect = require('chai').expect;
let versionHelper = require('../../lib/versionHelper');

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

        it('should default to patch when no bumpType', () => {
            expect(versionHelper.bump('1.0.12')).to.equal('1.0.13');
        });

        it('should default to patch when bumpType is invalid', () => {
            expect(versionHelper.bump('1.0.12', 'something')).to.equal('1.0.13');
        });

        it('should return 0.0.1 when initial version is empty', () => {
            expect(versionHelper.bump()).to.equal('0.0.1');
        });
    });

    describe.only('bumpFiles()', () => {

        it('should succeed', (done) => {
            versionHelper.bumpFiles(['./test/assets/package.json', './test/assets/bower.json', './test/assets/config.xml'], '2.4.11', './test/results')
                .then(res => {
                    done();
                })
                .catch(done);
        });
    });

});
