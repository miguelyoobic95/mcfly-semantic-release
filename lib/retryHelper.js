'use strict';
var retry = require('bluebird-retry');

/**
 * Retries with default options
 * @param   {Function} fn   	The function to retry (should return promise)
 * @param   {Object}   [opts] 	The options for the retry (optional)
 * @returns {Promise}        	The result as a resolved or rejected promise
 */
var retryFn = function(fn, opts) {
    opts = opts || {
        max_tries: 3,
        interval: 500,
        backoff: 2
    };
    return retry(fn, opts);
};

module.exports = {
    retry: retryFn
};
