'use strict';
global.Promise = require('bluebird');

const git = require('simple-git')();
const _ = require('lodash');

/**
 * Gets the current branch
 * @returns {Promise.<String>} The name of the current branch
 */
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
/**
 * Transforms the remote result to an object with url, owner and repo
 * @param   {Object} remote The remote
 * @returns {Object}        The result
 */
var transformRemote = function(remote) {
    var repoUrl = remote.refs.push;
    repoUrl = _.endsWith(repoUrl, '.git') ? repoUrl.substr(repoUrl, repoUrl.length - 4) : repoUrl;

    if (_.startsWith(repoUrl, 'git@')) {
        let ownerRepo = repoUrl.split(':')[1].split('/');
        return {
            url: 'https://github.com/' + ownerRepo[0] + '/' + ownerRepo[1],
            owner: ownerRepo[0],
            repo: ownerRepo[1]
        };
    } else {
        let ownerRepo = repoUrl.split('/').slice(-2);
        return {
            url: repoUrl,
            owner: ownerRepo[0],
            repo: ownerRepo[1]
        };
    }
};

/**
 * Gets a remote repository
 * @param   {String} remotename         The name of the remote repository, default to 'origin'
 * @returns {Promise.<Object>}          The result object with url, owner, and repo
 */
var getRemoteRepository = function(remotename) {
    remotename = remotename || 'origin';
    return Promise
        .fromCallback((cb) => {
            git
                .getRemotes(true, cb);
        })
        .then(remotes => {
            return _.chain(remotes)
                .find(remote => {
                    return remote.name === remotename;
                })
                .value();
        })
        .then(remote => {
            if (!remote) {
                throw new Error('"origin" remote repository is not configured');
            }
            return transformRemote(remote);
        });
};

/**
 * Check if the repo is clean
 * @returns {Promise.<Boolean>} true if the repo is clean, false otherwise
 */
var isClean = function() {
    return Promise
        .fromCallback(cb => {
            git.status(cb);
        })
        .then(res => {
            return res.deleted.length + res.modified.length + res.created.length + res.conflicted.length <= 0;
        });
};

module.exports = {
    getCurrentBranch,
    commitVersion,
    transformRemote,
    getRemoteRepository,
    isClean
};
