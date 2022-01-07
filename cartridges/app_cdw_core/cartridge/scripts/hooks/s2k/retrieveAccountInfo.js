'use strict';

var Resource = require('dw/web/Resource');
var Logger = require('dw/system/Logger');
var s2kConstants = require('*/cartridge/scripts/utils/s2kServiceConstants').getConstants();
var s2kLogger = Logger.getLogger('S2K', 'S2K_General');
var s2kRestService = require('*/cartridge/scripts/services/s2kRestService');

/**
 * Retrieves the B2B account information from S2K.
 * @param {accountNumber} customerId B2B account number 
 * @param {quickCheck} quickCheck quick check indicator
 * @return {Object} returns an error object
 */
 function Handle(accountNumber, quickCheck) {
    var serverErrors = [];
     var error = false;

    try {
        // populate the 'body' element with parameters 
        var body = { customerId : accountNumber,
                     quickCheck : quickCheck };

        // create the request object
        var data = { path : s2kConstants.RETRIEVE_ACCOUNT_INFO_API_ACTION, 
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

exports.Handle = Handle;
