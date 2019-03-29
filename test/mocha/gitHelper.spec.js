'use strict';

var gitHelper = require('../../lib/gitHelper');
var expect = require('chai').expect;
var _ = require('lodash');

describe('gitHelper', () => {
    describe('getCurrentBranch()', () => {
        it('should return current branch', async () => {
            expect( await gitHelper.getCurrentBranch()).to.not.be.null;
        });
    });

    describe('transformRemote()', () => {
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

        it('should succeed with an http url ending with /', () => {
            var remote = {
                name: 'origin',
                refs: {
                    fetch: 'https://github.com/mcfly-io/mcfly-semantic-release/',
                    push: 'https://github.com/mcfly-io/mcfly-semantic-release/'
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
        it('should return remote origin repository', async () => {
            let remote = await gitHelper.getRemoteRepository();
            expect(remote.url).to.not.be.null;
            expect(remote.repo).to.not.be.null;
            expect(remote.owner).to.not.be.null;
            expect(_.startsWith(remote.url, 'https://')).to.be.true;
        });

        it('should throw error with an unknow remote', async () => {
            try {
                await gitHelper.getRemoteRepository('dummy');
            } catch (err) {
                expect(err).not.to.be.null;
            }
        });
    });

    describe('isClean()', () => {
        it('should return a boolean', async () => {
            expect(await gitHelper.isClean()).to.be.a('boolean');
        });
    });
});