#!/usr/bin/env node

'use strict';
global.Promise = require('bluebird');

const args = require('yargs').argv;
const chalk = require('chalk');
const changelogScript = require('../lib/changelog-script');
const gitHelper = require('../lib/githelper');
const githubHelper = require('../lib/githubHelper');
const inquirer = require('inquirer');
const path = require('path');
const versionHelper = require('../lib/versionHelper');
const _ = require('lodash');

var files = args.files ? [].concat(args.files) : [];

if (files.length === 0) {
    files.push('./package.json');
}
files = _.map(files, (file) => {
    return path.isAbsolute(file) ? file : path.join(process.cwd(), file);
});

var msg = {};
msg.currentVersion = versionHelper.getCurrentVersion(path.join(process.cwd(), './package.json'));
msg.nextVersion = versionHelper.bump(msg.currentVersion, args.type);

gitHelper.getCurrentBranch()
    .then((currentBranch) => {
        if (currentBranch !== 'master') {
            throw new Error('To create a release you must be on the master branch');
        }
        return;
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
        console.log(chalk.yellow('Github authentication...'));
        msg.username = answers.username || msg.username;
        msg.password = answers.password;
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
        console.log(chalk.yellow('Bumping files...'));
        return versionHelper.bumpFiles(files, msg.nextVersion)
            .then(() => msg);
    })
    .then((msg) => {
        console.log(chalk.yellow('Commiting version...'));
        return gitHelper.commitVersion(msg.nextVersion)
            .then(() => msg);
    })
    .delay(1000)
    .then((msg) => {
        console.log(chalk.yellow('Publishing version...'));
        return githubHelper.createRelease(msg);
    })
    .then((res) => {
        console.log(chalk.green(`Release ${res.name} successfully published!`));
    })
    .catch(function(err) {
        console.log(chalk.red(err));
    });
