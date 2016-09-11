'use strict';

var gitHelper = require('../../lib/gitHelper');
var expect = require('chai').expect;
var _ = require('lodash');

describe('gitHelper', () => {
    describe('getCurrentBranch()', () => {
        it('should return current branch', (done) => {
            gitHelper.getCurrentBranch()
                .then(branch => {
                    expect(branch).to.not.be.null;
                    done();
                })
                .catch(done);
        });
    });

    describe('transformRemite()', () => {
        it('should succeed with an http url', () => {
            var remote = {
                name: 'origin',
                refs: {
                    fetch: 'https://github.com/mcfly-io/mcfly-semantic-release',
                    push: 'https://github.com/mcfly-io/mcfly-semantic-release'
                }
            };

            var retval = gitHelper.transformRemote(remote);
            expect(retval).to.deep.equal({
                url: 'https://github.com/mcfly-io/mcfly-semantic-release',
                owner: 'mcfly-io',
                repo: 'mcfly-semantic-release'
            });

        });

        it('should succeed with a git url', () => {
            var remote = {
                name: 'origin',
                refs: {
                    fetch: 'git@github.com:mcfly-io/mcfly-semantic-release.git',
                    push: 'git@github.com:mcfly-io/mcfly-semantic-release.git'
                }
            };

            var retval = gitHelper.transformRemote(remote);
            expect(retval).to.deep.equal({
                url: 'https://github.com/mcfly-io/mcfly-semantic-release',
                owner: 'mcfly-io',
                repo: 'mcfly-semantic-release'
            });
        });
    });

    describe('getRemoteRepository()', () => {
        it('should return remote origin repository', (done) => {

            gitHelper.getRemoteRepository()
                .then(remote => {
                    expect(remote.url).to.not.be.null;
                    expect(remote.repo).to.not.be.null;
                    expect(remote.owner).to.not.be.null;
                    expect(_.startsWith(remote.url, 'https://')).to.be.true;
                    done();
                })
                .catch(done);
        });

        it('should throw error with an unknow remote', (done) => {
            gitHelper.getRemoteRepository('dummy')
                .then(remote => {
                    done(new Error('should throw an error'));
                })
                .catch(err => {
                    expect(err).not.to.be.null;
                    done();
                });
        });
    });

    describe('isClean()', () => {
        it('should return a boolean', (done) => {

            gitHelper.isClean()
                .then(res => {
                    expect(res).to.be.a('boolean');
                    done();
                })
                .catch(done);
        });
    });
});
