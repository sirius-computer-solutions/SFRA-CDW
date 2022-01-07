'use strict';

var Resource = require('dw/web/Resource');
var Logger = require('dw/system/Logger');
var s2kConstants = require('*/cartridge/scripts/utils/s2kServiceConstants').getConstants();
var s2kLogger = Logger.getLogger('S2K', 'S2K_General');
var s2kRestService = require('*/cartridge/scripts/services/s2kRestService');

/**
 * Order Status Lookup. Used for below scenarios
 *  B2C Guest - zipCode and OrderNumber
 *  B2C Registered - just with customerId or customerId and queryString
 *  B2B Registered - just with customerId (accountNumber) or customerId (accountNumber)  and queryString
 * @param {orderLookupObj} statusLookup {zipCode: 1234, queryString: 1234433} 
 * @return {Object} returns an error object
 */
 function OrderLookup(orderLookupQueryString) {
    var serverErrors = [];
     var error = false;

    try {
        // populate the 'body' element with parameters 
        var body = orderLookupQueryString;

        // create the request object
        var data = { path : s2kConstants.GET_ORDERS, 
                     method : s2kConstants.HTTP_METHOD_GET,
                     body: body
                   };

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
            Resource.msg('error.technical', 's2k', null)+"Error Details::"+e
        );
    }

    return { serverErrors : serverErrors, error : error };
}

/**
 * Order Details Lookup. Used for below scenarios
 *  B2C Guest - zipCode and OrderNumber
 *  B2C Registered - just with customerId or customerId and queryString
 *  B2B Registered - just with customerId (accountNumber) or customerId (accountNumber)  and queryString
 * @param {orderLookupObj} statusLookup {zipCode: 1234, queryString: 1234433} 
 * @return {Object} returns an error object
 */
 function OrderDetailsLookup(orderDetailsLookupQueryString) {
    var serverErrors = [];
     var error = false;

    try {
        // populate the 'body' element with parameters 
        var body = orderDetailsLookupQueryString;

        // create the request object
        var data = { path : s2kConstants.GET_ORDER_DETAILS, 
                     method : s2kConstants.HTTP_METHOD_GET,
                     body: body
                   };

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
            Resource.msg('error.technical', 's2k', null)+"Error Details::"+e
        );
    }

    return { serverErrors : serverErrors, error : error };
}

module.exports = {
    OrderLookup: OrderLookup,
    OrderDetailsLookup: OrderDetailsLookup
};
