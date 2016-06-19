'use strict';

var githubHelper = require('../../lib/githubHelper');
var expect = require('chai').expect;

describe('githubHelper', () => {

    describe('getUsername()', () => {
        it('should succeed', (done) => {
            githubHelper.getUsername()
                .then(username => {
                    expect(username).not.to.be.null;
                    done();
                })
                .catch(done);
        });

    });

    describe('getClient()', () => {
        it('with json token file should succeed', () => {
            var github = githubHelper.getClient();
            expect(github.auth.token).to.exist;
        });

        it('with invalid token should throw an error', (done) => {
            var github = githubHelper.getClient('totoxxx', 'totoyyyy');
            githubHelper.getAllRepos(github, {})
                .catch(err => {
                    expect(err).to.exist;
                    done();
                });
        });
    });

    describe('getAllRepos()', () => {
        it('should succeed', (done) => {
            var github = githubHelper.getClient();
            githubHelper.getAllRepos(github, {})
                .then(repos => {
                    // check that we get a full page of 30 results (default paging for the gitub api)
                    expect(repos.length).to.be.equal(30);
                    done();
                })
                .catch(done);
        });

    });

    describe('getRepo()', () => {
        it('should succeed', (done) => {
            var github = githubHelper.getClient();
            var repoName = 'mcfly-io/ngux-loader';
            githubHelper.getRepo(github, {
                    repo: repoName
                })
                .then(repo => {
                    expect(repo.full_name).to.equal(repoName);
                    done();
                })
                .catch(done);
        });

    });

    describe('getPackageJson()', () => {
        it('when package.json exist it should succeed', (done) => {
            var github = githubHelper.getClient();
            var repoName = 'mcfly-io/ngux-loader';
            githubHelper.getPackageJson(github, {
                    repo: repoName
                })
                .then(packageJson => {
                    expect(packageJson).to.be.an('object');
                    expect(packageJson.name).to.equal('ngux-loader');
                    done();
                })
                .catch(done);
        });

        it('when package.json does not exist it should return null', (done) => {
            var github = githubHelper.getClient();
            var repoName = 'mcfly-io/wiki';
            githubHelper.getPackageJson(github, {
                    repo: repoName
                })
                .then(packageJson => {
                    expect(packageJson).to.be.null;
                    done();
                })
                .catch(done);
        });

    });
});
