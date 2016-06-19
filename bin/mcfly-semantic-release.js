'use strict';
global.Promise = require('bluebird');
var execAsync = Promise.promisify(require('child_process').exec);
const simpleGit = require('simple-git')();
const chalk = require('chalk');
const changelog = require('conventional-changelog');
const GitHubApi = require('github');
const inquirer = require('inquirer');
const versionHelper = require('../lib/versionHelper');
// Repo constants
const repoOwner = 'hassony2';
const repoName = 'deploy-test';

function logStreamResults(result) {
    var stdout = result.stdout;
    var stderr = result.stderr;
    if (stdout) {
        console.log(chalk.gray(stdout));
    }
    if (stderr) {
        console.log(chalk.red(stderr));
    }
}

function makeChangelog(version) {
    return new Promise(function(resolve, reject) {
        var changelogString = '';
        var changeStream = changelog({
            preset: 'angular'
        }, {
            version: version
        });
        changeStream.on('error', function(err) {
            console.log(err);
            reject(err);
        });
        changeStream.on('data', (chunk) => {
            changelogString += chunk;
        });
        changeStream.on('end', () => {
            resolve(changelogString);
        });
    });
}

const github = new GitHubApi({
    protocol: 'https',
    timeout: 0
});
const pkg = require('../package.json');
const currentVersion = pkg.version;
let versionarg = process.argv[2];
if (versionarg !== 'patch' && versionarg !== 'minor' && versionarg !== 'major') {
    versionarg = 'patch';
}
const nextVersion = versionHelper.bump(currentVersion, versionarg);

var credentials = {};
var changelogContent;
execAsync('git config user.email')
    .then((username) => {
        try {
            username = username.trim();
            credentials.username = username;
        } catch (err) {}
        return inquirer.prompt([{
            type: 'input',
            message: 'Please enter your GitHub username',
            name: 'username',
            default: username,
            when: function() {
                return username.length <= 0;
            },
            validate: function(input) {
                return input !== '';
            }
        }, {
            type: 'password',
            message: 'Please enter your GitHub password',
            name: 'password',
            validate: function(input) {
                return input !== '';
            }
        }]);
    })
    .then((answers) => {
        credentials.username = answers.username || credentials.username;
        credentials.password = answers.password;

        github.authenticate({
            type: 'basic',
            username: credentials.username,
            password: credentials.password
        });
        return new Promise(function(resolve, reject) {
            github.misc.getRateLimit({}, function(err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    })
    .then((result) => {
        logStreamResults(result);
        return makeChangelog(nextVersion);
    })
    .then((changelogResult) => {
        changelogContent = changelogResult;
        console.log(changelogContent);
        console.log('npm version ' + versionarg);
        return execAsync('npm version ' + versionarg);

    })
    .then((result) => {
        logStreamResults(result);
        console.log('git push origin v' + nextVersion + ' --porcelain');
        //return execAsync('git push origin v' + nextVersion + ' --porcelain');
        return simpleGit.push('origin', 'v' + nextVersion);
    })
    .then((result) => {
        logStreamResults(result);
        console.log('delay before release...');
    })
    .delay(1000)
    .then(() => {
        var versionName = 'v' + nextVersion;

        github.authenticate({
            type: 'basic',
            username: credentials.username,
            password: credentials.password
        });

        return new Promise(function(resolve, reject) {
            github.repos.createRelease({
                user: repoOwner,
                repo: repoName,
                tag_name: versionName,
                name: versionName,
                body: changelogContent
            }, function(err, res) {
                if (err) {
                    reject(err);
                } else {

                    resolve(res);
                }
            });
        });
    })
    .then((res) => {
        console.log('release published at ', res.published_at);
        console.log(chalk.green('finished'));
    })
    .catch(function(err) {
        console.log(chalk.red(err));
    });
