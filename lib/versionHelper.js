'use strict';

global.Promise = require('bluebird');

const fs = require('fs');
const path = require('path');
const semver = require('semver');
const _ = require('lodash');
const fileHelper = require('./fileHelper');
const XML = require('node-jsxml').XML;

/**
 * Filters a list of files given an extension
 * @param  {String[]} files     list of files to filter
 * @param  {String} extension  extension starting with '.' ('.json', '.xml', ...)
 * @returns {String[]}           filtered list of files
 */
var filterFiles = function(files, extension) {
    if (!extension) {
        return files;
    }
    return files.filter(function(file) {
        return path.extname(file) === extension;
    });
};

/**
 * Bumps version given a bump type
 * @param  {String} currentVersion version to bump ('1.2.0', '0.0.12')
 * @param  {String} bumpType       'patch', 'minor' or 'major'
 * @returns {String}                bumped version
 */
var bump = function(currentVersion, bumpType) {
    if (!currentVersion) {
        return '0.0.1';
    }
    let nextVersion;
    switch (bumpType) {
        case 'patch':
        case 'minor':
        case 'major':
            nextVersion = semver.inc(currentVersion, bumpType);
            break;
        default:
            nextVersion = semver.inc(currentVersion, 'patch');
            break;

    }
    return nextVersion;
};

var getOutputFile = function(filename, outputDir) {
    var outputFile = filename;
    if (outputDir) {
        outputFile = path.join(outputDir, path.basename(filename) + path.extname(filename));
    }
    return outputFile;
};

var bumpFiles = function(files, version, outputDir) {
    var jsonFiles = filterFiles(files, '.json');
    var xmlFiles = filterFiles(files, '.xml');
    var jsonBump = Promise.map(jsonFiles, (file) => {

        var json = fileHelper.readJsonFile(file);
        json.version = version;
        return Promise.fromCallback(function(cb) {
            fs.writeFile(getOutputFile(file), JSON.stringify(json, null, 4), cb);
        });
    });
    var xmlBump = Promise.map(xmlFiles, (file) => {
        var xml = new XML(String(fileHelper.readTextFile(file)));
        xml.attribute('version').setValue(version);
        return Promise.fromCallback(function(cb) {
            fs.writeFile(getOutputFile(file), xml.toXMLString(), cb);
        });
    });
    return Promise.all([xmlBump, jsonBump]);
};

module.exports = {
    filterFiles,
    bump
};
