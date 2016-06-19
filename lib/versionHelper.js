'use strict';

const path = require('path');
const semver = require('semver');

var filterFiles = function(files, extension) {
    if (!extension) {
        return files;
    }
    return files.filter(function(file) {
        return path.extname(file) === extension;
    });
};

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

module.exports = {
    filterFiles,
    bump
};
