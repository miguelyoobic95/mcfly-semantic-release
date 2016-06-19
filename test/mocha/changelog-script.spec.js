'use strict';
var changelogScript = require('../../lib/changelog-script');
var expect = require('chai').expect;

describe('changelog-script', () => {
    describe('readGitLog()', () => {
        it('when not tag given should return log from beginning', (done) => {
            changelogScript.readGitLog('^fix|^feat|^perf|BREAKING', '')
                .then(function(commits) {
                    expect(commits).to.be.an('array');
                    expect(commits.length).to.be.above(0);
                    done();
                })
                .catch(done);
        });
    });
    describe('generate()', () => {
        it('should return a string', (done) => {
            changelogScript.init({
                repository: 'http://test.com'
            });
            changelogScript.generate('1.0.0')
                .then((log) => {
                    expect(log).to.be.a('string');
                    expect(log.length).to.be.above(0);
                    done();
                })
                .catch(done);
        });
    });
    describe('getPreviousTag()', () => {
        it('should return a string tag or \'\'', (done) => {
            changelogScript.getPreviousTag()
                .then((tag) => {
                    expect(tag).to.match(/(^$|^[0-9]+\.[0-9]+\.[0-9]+$)/);
                    done();
                })
                .catch(done);
        });
    });
});
