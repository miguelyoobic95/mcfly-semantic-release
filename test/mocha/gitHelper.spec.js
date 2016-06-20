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
    describe('getRemoteRepository', () => {
        it('should return remote repository', (done) => {

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
    });
});
