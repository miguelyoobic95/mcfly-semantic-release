'use strict';
global.Promise = require('bluebird');
var GitHubApi = require('github');
var jsonfile = require('jsonfile');
var fs = require('fs');
var execAsync = Promise.promisify(require('child_process').exec);
/**
 * Gets the git user name
 * @returns {Promise} The username
 */
var getUsername = function() {
    return execAsync('git config user.email')
        .then((username) => {
            if (username && username.length > 0) {
                username = username.trim();
            }
            return username;
        });
};
/**
 * Gets a connected github client
 * @param   {String} username   The github username
 * @param   {String} password   The github password
 * @returns {Object}            The github client
 */
var buildClient = function(username, password) {
    var github = new GitHubApi({
        // required
        version: '3.0.0',
        // optional
        debug: false,
        protocol: 'https',
        host: 'api.github.com', // should be api.github.com for GitHub
        pathPrefix: '', // for some GHEs; none for GitHub
        timeout: 5000
            //headers: {
            //    'user-agent': 'Some cool app' // GitHub is happy with a unique user agent
            //}
    });
    if (username && password) {
        github.authenticate({
            type: 'basic',
            username: username,
            password: password
        });
        return github;
    }
    if (process.env.GITHUB_TOKEN) {

        github.authenticate({
            type: 'oauth',
            token: process.env.GITHUB_TOKEN
        });
        return github;
    }

    if (fs.existsSync('./files/testAuth.json')) {
        var oauth = jsonfile.readFileSync('./files/testAuth.json');

        github.authenticate({
            type: 'oauth',
            token: oauth.token
        });
        return github;
    }

    return github;
};

/**
 * Checks the validity of the credentials
 * @param  {Object} github  The github client
 * @returns {Promise}       The github client
 */
var checkClient = function(github) {
    return new Promise(function(resolve, reject) {
        github.misc.getRateLimit({}, function(err, res) {
            if (err) {
                reject(err);
            } else {
                resolve(github);
            }
        });
    });
};

var getClient = function(username, password){
    var github = buildClient(username, password);
    return checkClient(github);
};

/**
 * Gets a specific repo
 * @param   {Object} github     The github client
 * @param   {Object} param      An object with the following properties: user, repo
 * @returns {Promise}           The resulting repository
 */
var getRepo = function(github, param) {

    var user = param.user;
    var repo = param.repo;

    if (repo.includes('/')) {
        var params = param.repo.split('/');
        user = params[0];
        repo = params[1];
    }

    return Promise.fromCallback(function(callback) {
        return github.repos.get({
            user: user,
            repo: repo
        }, callback);
    });
};

/**
 * Gets all the repo
 * @param   {Object} github     The github client
 * @param   {Object} param      An object with the following properties: per_page, page
 * @returns {Promise}           An array of the repos found
 */
var getAllRepos = function(github, param) {
    return Promise.fromCallback(function(callback) {
        return github.repos.getAll({
            per_page: param.per_page,
            page: param.page
        }, callback);
    });
};

/**
 * Gets the content of package.json
 * @param   {Object} github     The github client
 * @param   {Object} param      An object with the following properties: user, repo
 * @returns {Promise}           An array of the repos found
 */
var getPackageJson = function(github, param) {
    var user = param.user;
    var repo = param.repo;

    if (repo.includes('/')) {
        var params = param.repo.split('/');
        user = params[0];
        repo = params[1];
    }
    return Promise.fromCallback(function(callback) {
            return github.repos.getContent({
                user: user,
                repo: repo,
                path: 'package.json'
            }, callback);
        })
        .then(response => {
            var b64string = response.content;
            var buf = new Buffer(b64string, 'base64');
            var packageJson = JSON.parse(buf.toString());
            return packageJson;
        })
        .catch(err => null);
};

/**
 * Creates a token file
 * @param  {String} username   The github username
 * @param  {String} password   The github password
 * @param  {Strong} tokenName  The name of the token (visible in Person access tokens on https://github.com/settings/tokens)
 * @param  {String} filename   The filename to store the resulting token
 * @returns {Promise}          The result of the api call to create the token
 */
var createTokenFile = function(username, password, tokenName, filename) {
    var github = buildClient(username, password);
    return Promise.fromCallback(function(callback) {
            return github.authorization.create({
                scopes: ['user', 'public_repo', 'repo', 'repo:status', 'gist'],
                note: tokenName
            }, callback);

        })
        .then(res => {
            var jsonObject = {
                token: res.token
            };
            jsonfile.writeFileSync(filename, jsonObject, {
                spaces: 2
            });
            return res;
        });

};

module.exports = {
    getUsername,
    buildClient,
    getClient,
    getRepo,
    getAllRepos,
    getPackageJson,
    createTokenFile
};
