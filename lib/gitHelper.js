'use strict';
global.Promise = require('bluebird');

const git = require('simple-git')();
const _ = require('lodash');

var getCurrentBranch = function() {
    return Promise
        .fromCallback((cb) => {
            git.branch(cb);
        })
        .then(branches => {
            return branches.current;
        });
};

var commitVersion = function(version) {
    return Promise
        .fromCallback((cb) => {
            git
                .add('./*')
                .commit('docs(changelog): version ' + version)
                .addAnnotatedTag(version, 'v' + version)
                .push('origin', 'master')
                .pushTags('origin', cb);
        });
};

var getRemoteRepository = function() {
    return Promise
        .fromCallback((cb) => {
            git
                .getRemotes(true, cb);
        })
        .then(remotes => {
            return _.chain(remotes)
                .find(remote => {
                    return remote.name === 'origin';
                })
                .value();
        })
        .then(remote => {
            if (!remote) {
                throw new Error('"origin" remote repository is not configured');
            }
            console.log(remote);
            var repoUrl = remote.refs.push;
            var ownerRepo = repoUrl.split('/').slice(-2);
            return {
                url: repoUrl,
                owner: ownerRepo[0],
                repo: ownerRepo[1]
            };
        });
};

module.exports = {
    getCurrentBranch,
    commitVersion,
    getRemoteRepository
};
