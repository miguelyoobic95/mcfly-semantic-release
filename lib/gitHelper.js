'use strict';

const gitP = require('simple-git/promise');
const git = gitP(__dirname);
const _ = require('lodash');
const url = require('url');
/**
 * Gets the current branch
 * @returns {Promise.<String>} The name of the current branch
 */
const getCurrentBranch = async function() {
    let branches = await git.branch();
    return branches.current;
};

const commitVersion = async function(version, production) {
    let commitMessage = `chore(app): Version ${version} ${production ? ' production' : ''} `;
    try {
        await git.add('./*');
        await git.commit(commitMessage);
        await git.addAnnotatedTag(version, 'v' + version);
        await git.push('origin', 'master');
        await git.pushTags('origin');
    } catch (e) {
        throw new Error(e);
    }

};
/**
 * Transforms the remote result to an object with url, owner and repo
 * @param   {Object} remote The remote
 * @returns {Object}        The result
 */
const transformRemote = function(remote) {
    let repoUrl = remote.refs.push;
    repoUrl = _.endsWith(repoUrl, '.git') ? repoUrl.substr(repoUrl, repoUrl.length - 4) : repoUrl;

    if (_.startsWith(repoUrl, 'git@')) {
        let ownerRepo = repoUrl.split(':')[1].split('/');
        return {
            url: 'https://github.com/' + ownerRepo[0] + '/' + ownerRepo[1],
            owner: ownerRepo[0],
            repo: ownerRepo[1]
        };
    } else {
        let ownerRepo = url.parse(repoUrl).pathname.split('/');
        return {
            url: _.endsWith(repoUrl, '/') ? repoUrl.substring(0, repoUrl.length - 1) : repoUrl,
            owner: ownerRepo[1],
            repo: ownerRepo[2]
        };
    }
};

/**
 * Gets a remote repository
 * @param   {String} remotename         The name of the remote repository, default to 'origin'
 * @returns {Promise.<Object>}          The result object with url, owner, and repo
 */
const getRemoteRepository = async function(remotename) {
    remotename = remotename || 'origin';
    let remotes = await git.getRemotes(true);
    let remote = _.find(remotes, r => r.name === remotename);
    if (!remote) {
        throw new Error('"origin" remote repository is not configured');
    }
    return transformRemote(remote);
};

/**
 * Check if the repo is clean
 * @returns {Promise.<Boolean>} true if the repo is clean, false otherwise
 */
const isClean = async function() {
    let res = await git.status();
    return res.deleted.length + res.modified.length + res.created.length + res.conflicted.length <= 0;
};

module.exports = {
    getCurrentBranch,
    commitVersion,
    transformRemote,
    getRemoteRepository,
    isClean
};
