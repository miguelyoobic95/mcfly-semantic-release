#!/usr/bin/env node

'use strict';
global.Promise = require('bluebird');
var execAsync = Promise.promisify(require('child_process').exec);
const simpleGit = require('simple-git')();
const chalk = require('chalk');
const changelog = require('conventional-changelog');
const inquirer = require('inquirer');
const versionHelper = require('../lib/versionHelper');
const githubHelper = require('../lib/githubHelper');
const args = require('yargs').argv;
var files = [].concat(args.files);
console.log(process.cwd());
var aaaaa = require(files[0]);
console.log(aaaaa);
console.log(args.files);
return;
// Repo constants
// const repoOwner = 'hassony2';
// const repoName = 'deploy-test';

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

const pkg = require('../package.json');
const currentVersion = pkg.version;
let versionarg = process.argv[2];
if (versionarg !== 'patch' && versionarg !== 'minor' && versionarg !== 'major') {
    versionarg = 'patch';
}
const nextVersion = versionHelper.bump(currentVersion, versionarg);

var msg = {};
var changelogContent;

githubHelper.getUsername()
    .then((username) => {
        msg.username = username;
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
        msg.username = answers.username || msg.username;
        msg.password = answers.password;

        return githubHelper.getClient(msg.username, msg.password);
    })
    .then((github) => {
        msg.github = github;
        return makeChangelog(nextVersion);
    })
    .then((changelogResult) => {
        changelogContent = changelogResult;
        console.log(changelogContent);
        console.log('npm version ' + versionarg);
        return execAsync('npm version ' + versionarg);

    })
    .then((result) => {
        console.log('git push origin v' + nextVersion + ' --porcelain');
        //return execAsync('git push origin v' + nextVersion + ' --porcelain');
        return simpleGit.push('origin', 'v' + nextVersion);
    })
    .then((result) => {
        console.log('delay before release...');
    })
    .delay(1000)
    .then(() => {
        // var versionName = 'v' + nextVersion;

        // github.authenticate({
        //     type: 'basic',
        //     username: msg.username,
        //     password: msg.password
        // });

        // return new Promise(function(resolve, reject) {
        //     github.repos.createRelease({
        //         user: repoOwner,
        //         repo: repoName,
        //         tag_name: versionName,
        //         name: versionName,
        //         body: changelogContent
        //     }, function(err, res) {
        //         if (err) {
        //             reject(err);
        //         } else {

        //             resolve(res);
        //         }
        //     });
        // });
    })
    .then((res) => {
        console.log('release published at ', res.published_at);
        console.log(chalk.green('finished'));
    })
    .catch(function(err) {
        console.log(chalk.red(err));
    });
