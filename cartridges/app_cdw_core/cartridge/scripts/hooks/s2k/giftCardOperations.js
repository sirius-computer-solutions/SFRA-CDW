'use strict';

var Resource = require('dw/web/Resource');
var Logger = require('dw/system/Logger');
var s2kConstants = require('*/cartridge/scripts/utils/s2kServiceConstants').getConstants();
var s2kLogger = Logger.getLogger('S2K', 'S2K_General');
var s2kRestService = require('*/cartridge/scripts/services/s2kRestService');

/**
 * Retrieves the GiftCard Balance from S2K.
 * @param {accountNumber} GiftCard Number
 * @return {Object} returns an error object
 */
 function Balance(gcNumber) {
    var serverErrors = [];
     var error = false;

    try {
        // populate the 'body' element with parameters 
        var body = { action : s2kConstants.GIFT_CARD_RETRIEVE_BAL_ACTION,
                     cardNo : gcNumber };

        // create the request object
        var data = { path : s2kConstants.GIFT_CARD_API_ACTION, 
                     method : s2kConstants.HTTP_METHOD_GET, 
                     body : body };
        // invoke the s2k service call
        var s2kServiceResponse = s2kRestService.call(data);
        if (s2kServiceResponse == null) {
            s2kLogger.error("No response was received from S2K");
            return {error:true};
        }
        if (s2kServiceResponse.success) {
            s2kLogger.debug("Request was successful. Response: " + s2kServiceResponse);
            return s2kServiceResponse;
        } else {
            if (s2kServiceResponse.message) {
                error = true;
                serverErrors.push (s2kServiceResponse.message, 's2k', null);
            }
        }
    } catch (e) {
        error = true;
        serverErrors.push (
            Resource.msg('error.technical', 's2k', null)
        );
    }

    return { serverErrors : serverErrors, error : error };
}

/**
 * Authorizes GiftCard Balance from S2K.
 * @param {accountNumber} GiftCard Number
 * @return {Object} returns an error object
 */
 function Authorize(gcNumber, gcAmount) {
    var serverErrors = [];
     var error = false;

    try {
        // populate the 'body' element with parameters 
        var body = { action : s2kConstants.GIFT_CARD_AUTH_ACTION,
                     cardNo : gcNumber,
                     amount:  gcAmount};

        // create the request object
        var data = { path : s2kConstants.GIFT_CARD_API_ACTION, 
                     method : s2kConstants.HTTP_METHOD_GET, 
                     body : body };
        // invoke the s2k service call
        var s2kServiceResponse = s2kRestService.call(data);
        if (s2kServiceResponse == null) {
            s2kLogger.error("No response was received from S2K");
            return {error:true};
        }
        if (s2kServiceResponse.success) {
            s2kLogger.debug("Request was successful. Response: " + s2kServiceResponse);
            return s2kServiceResponse;
        } else {
            if (s2kServiceResponse.message) {
                error = true;
                serverErrors.push (s2kServiceResponse.message, 's2k', null);
            }
        }
    } catch (e) {
        error = true;
        serverErrors.push (
            Resource.msg('error.technical', 's2k', null)
        );
    }

    return { serverErrors : serverErrors, error : error };
}

/**
 * UnAuthorizes GiftCard Balance from S2K.
 * @param {accountNumber} GiftCard Number
 * @return {Object} returns an error object
 */
 function UnAuthorize(gcNumber, gcAmount) {
    var serverErrors = [];
     var error = false;

    try {
        // populate the 'body' element with parameters 
        var body = { action : s2kConstants.GIFT_CARD_UN_AUTH_ACTION,
                     cardNo : gcNumber,
                     amount: gcAmount};

        // create the request object
        var data = { path : s2kConstants.GIFT_CARD_API_ACTION, 
                     method : s2kConstants.HTTP_METHOD_GET, 
                     body : body };
        // invoke the s2k service call
        var s2kServiceResponse = s2kRestService.call(data);
        if (s2kServiceResponse == null) {
            s2kLogger.error("No response was received from S2K");
            return {error:true};
        }
        if (s2kServiceResponse.success) {
            s2kLogger.debug("Request was successful. Response: " + s2kServiceResponse);
            return s2kServiceResponse;
        } else {
            if (s2kServiceResponse.message) {
                error = true;
                serverErrors.push (s2kServiceResponse.message, 's2k', null);
            }
        }
    } catch (e) {
        error = true;
        serverErrors.push (
            Resource.msg('error.technical', 's2k', null)
        );
    }

    return { serverErrors : serverErrors, error : error };
}

module.exports = {
    Balance: Balance,
    Authorize: Authorize,
    UnAuthorize: UnAuthorize
};
