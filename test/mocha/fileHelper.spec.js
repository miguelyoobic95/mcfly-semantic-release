'use strict';
var fileHelper = require('../../lib/fileHelper');
var path = require('path');
var expect = require('chai').expect;
const packageName = 'dummy';

function getFullFilename(filename) {
    return path.resolve(process.cwd(), filename );
}
describe('fileHelper', () => {
    describe('readTextFile()', () => {
        it('without dirname should succeed', () => {
            var res = fileHelper.readTextFile('./test/assets/package.json');
            expect(res.length).to.be.above(1);
        });

        it('with dirname should succeed', () => {
            var res = fileHelper.readTextFile('./package.json', './test/assets');
            expect(res.length).to.be.above(1);
        });
    });

    describe('readJsonFile()', () => {
        it('without dirname should succeed', () => {
            var res = fileHelper.readJsonFile('./test/assets/package.json');
            expect(res.name).to.equal(packageName);
        });

        it('with dirname should succeed', () => {
            var res = fileHelper.readJsonFile('./package.json', './test/assets');
            expect(res.name).to.equal(packageName);
        });
    });

    describe('readFiles()', () => {
        it('should return ./package.json if no files provided', () => {
            fileHelper.getFiles()
                .then(res => {
                    expect(res).to.deep.equal([getFullFilename('./package.json')]);
                });
        });

        it('should return files by names provided', () => {
            const files = ['./test/assets/package.json', './test/assets/config.xml'];
            fileHelper.getFiles(files)
                .then(res => {
                    expect(res).to.deep.equal(files.map(getFullFilename));
                });
        });

        it('should return files with absolute path', () => {
            const files = [
                getFullFilename('./test/assets/package.json'),
                getFullFilename('./test/assets/config.xml')
            ];
            fileHelper.getFiles(files)
                .then(res => {
                    expect(res).to.deep.equal(files);
                });
        });

        it('should return files by names provided', () => {
            const files = ['./test/assets/**/package.json', './test/assets/**/config.xml'];
            fileHelper.getFiles(files)
                .then(res => {
                    expect(res.length).to.equal(5);
                    expect(res).to.deep.equal([
                        getFullFilename( './test/assets/package.json'),
                        getFullFilename('./test/assets/folder1/package.json'),
                        getFullFilename('./test/assets/folder1/folder2/package.json'),
                        getFullFilename('./test/assets/config.xml'),
                        getFullFilename('./test/assets/folder1/folder2/config.xml')
                    ]);
                });
        });

    });

});
