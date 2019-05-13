#!/usr/bin/env node

/* eslint no-console:0 */
'use strict';
global.Promise = require('bluebird');

const chalk = require('chalk');
const changelogScript = require('../lib/changelog-script');
const retryHelper = require('../lib/retryHelper');
const fileHelper = require('../lib/fileHelper');
const gitHelper = require('../lib/githelper');
const githubHelper = require('mcfly-github');
const inquirer = require('inquirer');
const path = require('path');
const versionHelper = require('../lib/versionHelper');
const args = require('yargs')
    .option('files', { type: 'array',  desc: 'Files and files patterns to change'})
    .option('production', {type: 'boolean', desc: 'Generate production commit message'})
    .argv;

var files;
var msg = {};
msg.currentVersion = versionHelper.getCurrentVersion(path.join(process.cwd(), './package.json'));
msg.nextVersion = versionHelper.bump(msg.currentVersion, args.type);
fileHelper.getFiles(args.files)
    .then(res => {
        files = res;
        return gitHelper.getCurrentBranch();
    })
    .then((currentBranch) => {
        if (currentBranch !== 'master') {
            throw new Error('To create a release you must be on the master branch');
        }
        return;
    })
    .then(() => {
        return gitHelper.isClean()
            .then(res => {
                if (!res) {
                    throw new Error('Your repository has unstaged changes, you must commit your work before releasing a new version');
                }
                return res;
            });
    })
    .then(() => {
        return gitHelper.getRemoteRepository();
    })
    .then((repoInfo) => {
        msg.repo = repoInfo.repo;
        msg.owner = repoInfo.owner;
        msg.repoUrl = repoInfo.url;
    })
    .then(() => {
        return githubHelper.getUsername();
    })
    .then((username) => {
        msg.username = username;
        if (username) {
            console.log(`Hello ${chalk.bold(chalk.cyan(username))}, let's publish a new version ${chalk.bold(chalk.yellow(msg.nextVersion))}...`);
        }
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
            message: 'Please enter your GitHub password (leave blank to use $GITHUB_TOKEN)',
            name: 'password'
        }]);
    })
    .then((answers) => {
        console.log(chalk.yellow('Github authentication...'));
        msg.username = answers.username || msg.username;
        msg.password = answers.password || null;
        return githubHelper.getClient(msg.username, msg.password);
    })
    .then((github) => {
        msg.github = github;
        return;
    })
    .then(() => {
        console.log(chalk.yellow('Generating changelog...'));
        changelogScript.init(msg.repoUrl);
        return changelogScript.generate(msg.nextVersion)
            .then((changelogContent) => {
                msg.changelogContent = changelogContent;
                return msg;
            });
    })
    .then((msg) => {
        console.log(chalk.yellow('Bumping files...', files));
        return versionHelper.bumpFiles(files, msg.nextVersion)
            .then(() => msg);
    })
    .then((msg) => {
        console.log(chalk.yellow('Committing version...'));
        return gitHelper.commitVersion(msg.nextVersion, args.production, files)
            .then(() => msg);
    })
    .delay(1000)
    .then((msg) => {
        console.log(chalk.yellow('Publishing version...'));
        return retryHelper
            .retry(function() {
                return githubHelper.createRelease(msg);
            })
            .catch(err => {
                console.log(chalk.red('An error occurred when publishing the version'));
                console.log('Your changelog is:\n', msg.changelogContent);
                throw err;
            });
    })
    .then((res) => {
        console.log(chalk.green(`Release ${res.name} successfully published!`));
    })
    .catch(function(err) {
        console.log(chalk.red(err));
        return process.exit(1); //eslint-disable-line no-process-exit
    });