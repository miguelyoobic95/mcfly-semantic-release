'use strict';
var fs = require('fs');
var path = require('path');
var stripJsonComments = require('strip-json-comments');
var globby = require('globby');
var _ = require('lodash');
/**
 * Read a text file and return its content as a string
 * @param {String} filename The filename
 * @param {String} dirname The directory name (optional)
 * @returns {String} The file content as a string
 */
var readTextFile = function(filename, dirname) {
    // when dirname is null or undefined we read from local path, otherwise we read from absolute path
    if (dirname && !path.isAbsolute(filename)) {
        filename = path.resolve(path.join(dirname, filename));
    }
    var body = fs.readFileSync(filename, 'utf-8');
    return body;
};

/**
 * Read a json file and return its content as an object
 * @param {String} filename The filename
 * @param {String} dirname The directory name (optional)
 * @returns {Object} The file content as an object
 */
var readJsonFile = function(filename, dirname) {
    var body = readTextFile(filename, dirname);
    return JSON.parse(stripJsonComments(body));
};

/**
 *
 * @param {Array} patterns List of file patterns to resolve
 * @returns {Array} list of files matching patterns
 */
var getFiles = function(patterns) {
    if (!patterns) {
        patterns = ['./package.json'];
    }
    return globby(patterns)
    .then(res => _.map(res, (file) => {
        return path.isAbsolute(file) ? file : path.join(process.cwd(), file);
    }));

};
module.exports = {
    readJsonFile,
    readTextFile,
    getFiles
};
