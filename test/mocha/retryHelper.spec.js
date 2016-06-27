'use strict';

var retryHelper = require('../../lib/retryHelper');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var mockPromise = sinon.spy(function(obj) {
    return new Promise((resolve, reject) => {
        obj.count++;
        if (obj.count < 3) {
            reject(new Error('an error occurred'));
        } else {
            resolve(obj);
        }
    });
});

describe('retryHelper', () => {
    describe('retry()', () => {
        beforeEach(function() {
            mockPromise.reset();
        });

        it('with standard option should succeed', done => {
            var obj = {
                count: 0
            };
            retryHelper.retry(function() {
                    return mockPromise(obj);
                })
                .then(obj => {
                    expect(mockPromise).to.have.callCount(3);
                    expect(obj.count).to.equal(3);
                    done();
                })
                .catch(done);
        });

        it('with standard option should fail after 3 tries', done => {
            var obj = {
                count: -1
            };
            retryHelper.retry(function() {
                    return mockPromise(obj);
                }, {
                    max_tries: 3,
                    interval: 1,
                    backoff: 1
                })
                .then(obj => {
                    done(new Error('should throw an error'));
                })
                .catch(err => {

                    expect(mockPromise).to.have.callCount(3);
                    expect(obj.count).to.equal(2);
                    done();
                });
        });

        it('with specific option should succeed', done => {
            var obj = {
                count: -1
            };
            retryHelper.retry(function() {
                    return mockPromise(obj);
                }, {
                    max_tries: 4,
                    interval: 1,
                    backoff: 1
                })
                .then(obj => {
                    expect(mockPromise).to.have.callCount(4);
                    expect(obj.count).to.equal(3);
                    done();
                })
                .catch(done);
        });
    });

});
