'use strict';

/* API Includes */
var Bytes = require('dw/util/Bytes');
var CacheMgr = require('dw/system/CacheMgr');
var MessageDigest = require('dw/crypto/MessageDigest');

/**
 * Generates a cache key based on the request body JSON payload.
 *
 * @param {Object} keyObject Object to be used to generate a cache key.
 * @returns {string} Hash string representation of the request payload.
 */
function getCacheKey(keyObject) {
    var bytes = new Bytes(keyObject);

    return new MessageDigest(MessageDigest.DIGEST_SHA_256).digest(bytes);
}

/**
 * Retrieves the Fedex_rates cache instance from the CacheMgr.
 *
 * @returns {dw.system.Cache} Cache instance.
 */
function getCustomCache() {
    return CacheMgr.getCache('Fedex_rates');
}

/**
 * Adds an entry to the cache instance.
 *
 * @param {Object} keyObject Object to be used to generate a cache key.
 * @param {Object} valueObject Object to be cached.
 */
function putCache(keyObject, valueObject) {
    var cache = getCustomCache();
    var key = getCacheKey(keyObject);

    cache.put(key, valueObject);
}

/**
 * Invalidates an entry in the cache instance.
 *
 * @param {Object} keyObject Request body object.
 */
function invalidateCache(keyObject) {
    var cache = getCustomCache();
    var key = getCacheKey(keyObject);

    cache.invalidate(key);
}

/**
 * Retreives an entry from the cache instance. Loads the expected data using the loader function
 * when cache entry does not exist, then caches the value returned by the loader function.
 *
 * @param {Object} keyObject Object to be used to generate a cache key.
 * @param {Function} loaderFunction Function to load the expected cache data in the absence of an entry.
 * @returns {Object|undefined} Cached value or undefined if loaderFunction not provided.
 */
function getCache(keyObject, loaderFunction) {
    var cache = getCustomCache();
    var key = getCacheKey(keyObject);
    var callback = (typeof loaderFunction === 'function') ? loaderFunction : null;

    return cache.get(key, callback);
}

module.exports = {
    putCache: putCache,
    invalidateCache: invalidateCache,
    getCache: getCache
};
