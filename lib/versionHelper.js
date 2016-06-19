'use strict';

global.Promise = require('bluebird');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const semver = require('semver');
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
        outputFile = path.join(outputDir, path.basename(filename));
    }
    return outputFile;
};

var bumpFiles = function(files, version, outputDir) {
    var jsonFiles = filterFiles(files, '.json');
    var xmlFiles = filterFiles(files, '.xml');
    var jsonBump = Promise.map(jsonFiles, (file) => {

        var json = fileHelper.readJsonFile(file);

        json.version = version;
        let retval = JSON.stringify(json, null, 4);
        return Promise.fromCallback(function(cb) {
                fs.writeFile(getOutputFile(file, outputDir), retval, cb);
            })
            .then(() => {
                return {
                    file: file,
                    content: retval
                };
            });
    });
    var xmlBump = Promise.map(xmlFiles, (file) => {
        var xml = new XML(String(fileHelper.readTextFile(file)));
        let retval;
        xml.attribute('version').setValue(version);
        return Promise.fromCallback(function(cb) {
                retval = xml.toXMLString();
                fs.writeFile(getOutputFile(file, outputDir), retval, cb);
            })
            .then(() => {
                return {
                    file: file,
                    content: retval
                };
            });
    });
    return Promise.all([xmlBump, jsonBump])
        .then(_.flatten);
};

module.exports = {
    filterFiles,
    bump,
    bumpFiles
};
