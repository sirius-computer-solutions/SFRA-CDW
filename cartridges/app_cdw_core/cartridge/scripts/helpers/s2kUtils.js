'use strict';

const Encoding = require('dw/crypto/Encoding');
const Bytes = require('dw/util/Bytes');
const Resource = require('dw/web/Resource');
const Logger = require('dw/system/Logger');
var MessageDigest = require('dw/crypto/MessageDigest');
var s2kConstants = require('/app_acme_core/cartridge/scripts/utils/s2kServiceConstants').getConstants();
var s2kLogger = Logger.getLogger('S2K', 'S2K_General');

/**
 * Encodes the specified string value into encoded string.
 *
 * @param {String} value the value to be encoded
 * @returns {string} result - the encoded string
 */
 function encodeString(value) {
    var bytes = new Bytes(value);
    return Encoding.toBase64(bytes);
}

/**
 * Logs the error message in the error log.
 *
 * @param {string} err Error message
 */
function createErrorLog(err) {
    s2kLogger = s2kLogger || Logger.getLogger('S2K', 'S2K_General');
    if (!empty(err)) {
        s2kLogger.error(err.stack ? (err.message + err.stack) : err);
    } else {
        s2kLogger.debug('Empty log entry');
    }
    return;
}

/**
 * Creates the Error Message
 *
 * @param {string} errorName error message name
 * @returns {string} errorMsg - Resource error message
 */
function createErrorMsg(errorName) {
    var defaultMessage = Resource.msg('s2k.error.general', 's2kerrors', null);
    var errorMsg = Resource.msg('s2k.error.' + errorName, 's2kerrors', defaultMessage);
    return errorMsg;
}

/**
 * Builds and returns the unique transaction id. 
 * @returns {string} transactionId - the unique transaction id
 */
 function buildTransactionId() {
    // build the unique transaction id
    var Calendar = require('dw/util/Calendar');
    var StringUtils = require('dw/util/StringUtils');
    var cal = new Calendar();
    // retrieve as CST
    cal.setTimeZone("Etc/GMT+5");
    var transactionId = StringUtils.formatCalendar(cal, s2kConstants.API_TRANSACTION_ID_DATE_FORMAT);
    return transactionId;
}


/**
 * Check if the current time stamp is past the noon CST and returns the boolean
 * @returns {boolean} pastCSTNoon
 */
 function currentTimePastNoonCST() {
    var pastCSTNoon = false;
    var Calendar = require('dw/util/Calendar');
    var StringUtils = require('dw/util/StringUtils');
    var cal = new Calendar();
    // retrieve as CST
    cal.setTimeZone("Etc/GMT+5");
    var currentTime = StringUtils.formatCalendar(cal, s2kConstants.HOUR_OF_DAY);
    if(currentTime >= 12) {
        pastCSTNoon = true;
    }
    return pastCSTNoon;
}
/**
 * Builds the url with the specified query parameters
 * @param {string} url - Original url
 * @param {Object} params - Parameters to append
 * @returns {string} result url with appended query parameters
 */
function buildUrlWithQueryParams(url, params) {
    var newUrl = url;
    newUrl += (newUrl.indexOf('?') !== -1 ? '&' : '?') + Object.keys(params).map(function (key) {
        return key + '=' + encodeURIComponent(params[key]);
    }).join('&');

    return newUrl;
}

/**
 * Builds the request token using the transcation id and the salt.
 * @param {string} transactionId - the transaction id to hash
 * @param {Object} salt - the salt to use
 * @returns {string} request token - the request token value
 */
 function buildRequestToken(transactionId, salt) {
    var digest = new MessageDigest(MessageDigest.DIGEST_SHA_512);
    var transactionIdBytes = new Bytes(transactionId);
    var saltBytes = new Bytes(salt);
    digest.updateBytes(transactionIdBytes);
    digest.updateBytes(saltBytes);
    var hashedBytes = digest.digest();
    return Encoding.toHex(hashedBytes);
}

module.exports = {
    createErrorLog: createErrorLog,
    encodeString: encodeString,
    createErrorMsg: createErrorMsg,
    buildTransactionId: buildTransactionId,
    buildRequestToken: buildRequestToken,
    currentTimePastNoonCST: currentTimePastNoonCST,
    buildUrlWithQueryParams: buildUrlWithQueryParams
};
