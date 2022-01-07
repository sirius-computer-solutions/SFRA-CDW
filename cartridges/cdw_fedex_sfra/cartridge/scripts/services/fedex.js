'use strict';

/* API Includes */
var Logger = require('dw/system/Logger').getLogger('Fedex', 'service');
var IntegrationConstants = require('*/cartridge/scripts/utils/acmeConstants').getConstants();
var errorLogger = require('dw/system/Logger').getLogger(IntegrationConstants.INTEGRATION_ERROR_FILE,"fedex");

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

/* Local Includes */
var Configuration = require('*/cartridge/scripts/configuration');

/**
 * Retrieves HTTP Serivce for executing REST API call.
 *
 * @returns {dw.svc.HTTPService} HTTP service class for making REST API calls.
 */
function getFedexService() {
    return LocalServiceRegistry.createService('fedex.service.rest', {

        createRequest: function (svc, requestObject) {
            // Initialize the configuration object.
            var configuration = Configuration.init();

            // Set standard headers
            svc.addHeader('Content-Type', 'text/xml');
            svc.addHeader('User-Agent', 'SalesforceB2CCommerce-SiriusFedex');

            // Set the request method based on the request object configuration.
            if (requestObject.httpMethod) {
                svc.setRequestMethod(requestObject.httpMethod);
            }

            // Set the request endpoint URL based on the request object configuration.
            if (requestObject.endpoint) {
                svc.setURL(svc.configuration.credential.URL + requestObject.endpoint);
            }
            
            // Passed request object or empty object if none exists.
            var requestBody = new XML(requestObject.payload);
            var ns;

            if (requestObject.requestType === 'rates') {
                ns = new Namespace("http://fedex.com/ws/rate/v28");
                
            } else if (requestObject.requestType === 'avs') {
                ns = new Namespace("http://fedex.com/ws/addressvalidation/v4");
            } else {
                return requestBody;
            }

            requestBody.ns:: WebAuthenticationDetail.ns:: UserCredential.ns:: Key = svc.configuration.credential.user;
            requestBody.ns:: WebAuthenticationDetail.ns:: UserCredential.ns:: Password = svc.configuration.credential.password;
            requestBody.ns:: ClientDetail.ns:: AccountNumber = svc.configuration.credential.custom.AccountNumber;
            requestBody.ns:: ClientDetail.ns:: MeterNumber = svc.configuration.credential.custom.MeterNumber;            

            return requestBody;
        },

        parseResponse: function (svc, httpClient) {
            var response = new XML(httpClient.text);
            return response;
        },

        mockCall: function (svc: HTTPService, client: HTTPClient) {
            // Make the service return static response when in mocked mode (currently broken)
            Logger.info('Mocking service...');
            var mock = require('../mock/mock');
            var mockXML = new XML(mock.response);
            return {
                statusCode: 200,
                statusMessage: "Success",
                text: mockXML
            };
        }
    });
}

/**
 * Retrieves HTTP service and executes call to the Fedex REST API.
 *
 * @param {Object} requestObject Contains data for making REST API request.
 * @returns {Object} Response object from the REST API.
 */
function callService(requestObject) {

    if (!requestObject) throw new Error('Request object parameter required for API request.');

    var response;
    var requestType = requestObject.requestType;
    try {
        response = getFedexService().call(requestObject);
    } catch (e) {
        Logger.fatal('Error making Fedex API call when requesting {0}: {1}', [requestType,e]);
        errorLogger.fatal(IntegrationConstants.FEDEX_ERROR+"Fedex service call threw an exception when requesting {0}: {1}", [requestType,e]);
    }

    if (response && !response.ok) {
        Logger.error("Fedex {0} service call returned an unexpected response: {1}", [requestType,response.errorMessage]);
        errorLogger.error(IntegrationConstants.FEDEX_ERROR+"Fedex {0} service call returned an unexpected response: {1}", [requestType,response.errorMessage]);
    } 
    
    Logger.debug("request: " + requestObject.payload);

    return response;
}
 
/**
 * Fedex function declaration.
 */
function Fedex() {

}

/**
 * FEDEX rates POST
 */
Fedex.prototype.rates = {
    retrieve: function (requestPayload) {
        
        var requestObject = {
            endpoint: '/xml',
            httpMethod: 'POST',
            requestType: 'rates',
            payload: requestPayload
        };

        return callService(requestObject);
    }
};

/**
 * FEDEX avs POST
 */
 Fedex.prototype.avs = {
    retrieve: function (requestPayload) {
        
        var requestObject = {
            endpoint: '/xml',
            httpMethod: 'POST',
            requestType: 'avs',
            payload: requestPayload
        };

        return callService(requestObject);
    }
};

module.exports = Fedex;