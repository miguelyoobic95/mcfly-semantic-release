'use strict';
var fileHelper = require('../../lib/fileHelper');
var expect = require('chai').expect;
const packageName = 'dummy';
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

});
