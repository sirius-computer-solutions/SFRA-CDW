'use strict';

const serviceName = 'int.varsity.rest';
const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
const Resource = require('dw/web/Resource');

var Site = require('dw/system/Site');
var varsityConstants = require('*/cartridge/scripts/utils/varsityConstants').getConstants();
var varsityResponseCache = require('dw/system/CacheMgr').getCache(varsityConstants.VARSITY_RESPONSE);
var zipCodeCache = require('dw/system/CacheMgr').getCache(varsityConstants.ZIP_CODE);
var Logger = require('dw/system/Logger');
var logger = Logger.getLogger("varsity","varsity");

function getVarsityReponse(svc, postalCode) {

    var zipCode = varsityResponseCache.get(varsityConstants.ZIP_CODE);
    var response = zipCodeCache.get(varsityConstants.VARSITY_RESPONSE);
    if (postalCode && postalCode.equals(zipCode)) {
        return response;
    }

    var result = svc.setThrowOnError().call({
        makeCall: true
    });

    if (result.isOk()) {
        var serviceResponse = svc.getResponse();
        if (serviceResponse.success) {
            zipCodeCache.put(varsityConstants.ZIP_CODE, PostalCode);
            varsityResponseCache.put(varsityConstants.VARSITY_RESPONSE, serviceResponse);
            return serviceResponse;
        }
        if (!serviceResponse.success) {
            logger.error("Error on http request");
			return null;
        } 
    } else {
        logger.error("Error on http request");
		return null;
    }
}

function createRequest(svc, data) {
    var {
        zipCode,
        makeCall
    } = data;

    if(makeCall) {
        var body = {
            PostalCode: zipCode,
            Warehouse: Site.current.getCustomPreferenceValue(varsityConstants.WAREHOUSE_ID),
            Country: varsityConstants.COUNTRY
        };

        svc.addHeader(varsityConstants.CONTENT_TYPE ,varsityConstants.APPLICATION);
        return body ? JSON.stringify(body) : '';
    }

    response = getVarsityReponse(svc, zipCode);
}

/**
 * Creates the Error Message
 *
 * @param {string} errorName error message name
 * @returns {string} errorMsg - Resource error message
 */
 function createErrorLog(errorName) {
    var defaultMessage = Resource.msg('service.generalerror', 'int_varsity', null);
    var errorMsg = Resource.msg('varsity.error.' + errorName, 'int_varsity', defaultMessage);
    return errorMsg;
}

module.exports = (function () {
    var {
        msgf
    } = Resource;
    var restService;
    try {
        restService = LocalServiceRegistry.createService(serviceName, {
            createRequest: createRequest,
            parseResponse: function (service, httpClient) {
                return JSON.parse(httpClient.getText());
            },
            getRequestLogMessage: function (request) {
                return request;
            },
            getResponseLogMessage: function (response) {
                return response.text;
            }
        });
    } catch (error) {
        createErrorLog(msgf('service.error', 'int_varsity', null, serviceName));
        throw new Error();
    }

    return {
        call: function (data) {
            var result;
            try {
                result = restService.setThrowOnError().call(data);
            } catch (error) {
                createErrorLog(msgf('service.generalerror', 'int_varsity', null, serviceName));
                throw new Error();
            }
            if (result.isOk()) {
                return restService.response;
            }
            if (error.errorMessage) {
                createErrorLog(msgf('varsity.errors.apierror', 'int_varsity', null, data.path));
                throw new Error(error.errorMessage);

            }
            if (!result.errorMessage) {
                createErrorLog(msgf('service.wrongendpoint', 'int_varsity', null, data.path));
                throw new Error();
            }
        }
    };
}());