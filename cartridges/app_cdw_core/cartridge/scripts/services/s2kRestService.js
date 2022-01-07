'use strict';

const serviceName = 'int.s2k.http';
const ServiceCredential = require('dw/svc/ServiceCredential');
const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
const Resource = require('dw/web/Resource');

var s2kConstants = require('/app_cdw_core/cartridge/scripts/utils/s2kServiceConstants').getConstants();
const tokenCache = require('dw/system/CacheMgr').getCache(s2kConstants.AUTHORIZATION_TOKEN_CACHE_LOOKUP_ID);

var IntegrationConstants = require('/app_cdw_core/cartridge/scripts/utils/cdwConstants').getConstants();
var errorLogger = require('dw/system/Logger').getLogger(IntegrationConstants.INTEGRATION_ERROR_FILE,"s2k");


const {
    createErrorLog,
    encodeString,
    buildTransactionId,
    buildRequestToken,
    buildUrlWithQueryParams
} = require('../helpers/s2kUtils');

/**
 * Creates the URL for the call.
 * @param  {dw.svc.ServiceCredential} credential current service credential
 * @param  {string} path REST action endpoint
 * @returns {string} url for a call
 */
function getUrlPath(credential, path) {
    var url = credential.URL;
    if (!url.match(/.+\/$/)) {
        url += '/';
    }
    url += path;
    return url;
}

/**
 * Checks if the token required for S2K service call exists in the cache. 
 * If the token does not exist in the cache or has expired, it is retrieved from 
 * S2K, and is saved in the cache. 
 * @param  {dw.svc.Service} service current service based on serviceName
 * @returns {string} S2K API authorization token
 */
function getToken(service) {
    var s2kAPIToken = tokenCache.get(s2kConstants.AUTHORIZATION_TOKEN_NAME);
    if (s2kAPIToken) {
        return s2kAPIToken;
    }
       
    var result = service.setThrowOnError().call({
        createToken: true
    });

    if (result.isOk()) {
        var serviceResponse = service.getResponse();
        if (serviceResponse.success && serviceResponse.accessToken) {
            var userCredentials = s2kConstants.API_SESSION_ID_PARAMETER_KEY + serviceResponse.accessToken;
            var authorizationToken = s2kConstants.API_VAI_TOKEN_PARAMETER_KEY + encodeString(userCredentials);
            // cache the token
            tokenCache.put(s2kConstants.AUTHORIZATION_TOKEN_NAME, authorizationToken);
            return authorizationToken;
        }
        if (!serviceResponse.success) {
            if(serviceResponse.message != "Invalid Transaction Id") {
                errorLogger.fatal(IntegrationConstants.S2K_ERROR+"Error Creating the token. Response " + JSON.stringify(serviceResponse)) ;
            }
            throw new Error(Resource.msgf('s2k.errors.tokenerror', 's2kerrors', null, serviceName));
        } 
    } else {
        if('object' in result)
        {
            errorLogger.fatal(IntegrationConstants.S2K_ERROR+"Response Object = " + JSON.stringify(result['object']));
        }
        if('errorMessage' in result)
        {
            errorLogger.fatal(IntegrationConstants.S2K_ERROR+"Response errorMessage = " + JSON.stringify(result['errorMessage']));
        }
        errorLogger.fatal(IntegrationConstants.S2K_ERROR+"Error Creating the token.");
        throw new Error(Resource.msgf('s2k.errors.tokenerror', 's2kerrors', null, serviceName));
    }
}

/** The createRequest callback for the service.
 * @param  {dw.svc.Service} service service instance
 * @param  {Object} data call data with path, method, body for a call or createToken in case of recursive call
 * @returns {string} request body
 */
function createRequest(service, data) {
    var credential = service.configuration.credential;
    if (!(credential instanceof ServiceCredential)) {
        var {
            msgf
        } = Resource;
        throw new Error(Resource.msgf('service.nocredentials', 's2kerrors', null, serviceName));
    }

    var {
        path,
        method,
        body,
        createToken
    } = data;

    // set the common service header elements
    service.addHeader('Accept', 'application/json');
    

    // recursive call to create the token
    if (createToken) {
        service.setRequestMethod(s2kConstants.HTTP_METHOD_GET);
        // set the base URL to retrieve the token from S2K
        var baseUrl = getUrlPath(credential, s2kConstants.RETRIEVE_TOKEN_API_ACTION);
        // build the request token parameter
        var transactionId = buildTransactionId();
        var securePassword = buildRequestToken(transactionId, credential.password);
        var serviceParams = {
            userId: credential.user, 
            transactionId: transactionId,
            requestToken: securePassword
        };
        service.setURL(buildUrlWithQueryParams(baseUrl, serviceParams));
        return '';
    }

    var token = getToken(service);
    if (token) {
        service.setURL(getUrlPath(credential, path));
        // include the authorization token
        service.addHeader('Authorization', token);
        service.addHeader('content-type','application/json');
        // default the service method (if needed)
        var serviceMethod = method || s2kConstants.HTTP_METHOD_GET;
        service.setRequestMethod(serviceMethod);
        if (serviceMethod === s2kConstants.HTTP_METHOD_GET) {
            service.addHeader('Content-Type', 'application/x-www-form-urlencoded');
            if (body) {
                // incorporate the elements as the query parameters
                var baseUrl = service.getURL();
                service.setURL(buildUrlWithQueryParams(baseUrl, body));
            }
            return '';
        }
        if (serviceMethod === s2kConstants.HTTP_METHOD_POST && path === s2kConstants.SUBMIT_ORDER_API_ACTION ) {
            service.addHeader('Accept', 'application/xml');
            service.addHeader('Content-Type', 'text/xml; charset=utf-8');
        }
        return body ? JSON.stringify(body) : '';
    } else {
        createErrorLog(Resource.msgf('s2k.errors.tokenerror', 's2kerrors', null, serviceName));
        errorLogger.fatal(IntegrationConstants.S2K_ERROR+"Error Creating the token.");
        throw new Error(Resource.msgf('s2k.errors.tokenerror', 's2kerrors', null, serviceName));
    }
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
                var responseText = httpClient.getText().toString();
                if(!empty(responseText) && responseText.includes("<")) {
                    return httpClient.getText();
                }
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
        createErrorLog(Resource.msgf('service.error', 's2kerrors', null, serviceName));
        errorLogger.fatal(IntegrationConstants.S2K_ERROR+"Error connecting to S2K.");
        throw new Error();
    }

    return {
        call: function (data) {
            var result;
            try {
                result = restService.setThrowOnError().call(data);
            } catch (error) {
                createErrorLog(Resource.msgf('service.generalerror', 's2kerrors', null, serviceName) + "Error Details::"+error);
                throw new Error();
            }
            if (result.isOk()) {
                return restService.response;
            }
            if (error.errorMessage) {
                createErrorLog(Resource.msgf('s2k.errors.apierror', 's2kerrors', null, data.path));
                errorLogger.fatal(IntegrationConstants.S2K_ERROR+"Error connecting to S2K.");
                throw new Error(error.errorMessage);

            }
            if (!result.errorMessage) {
                createErrorLog(Resource.msgf('service.wrongendpoint', 's2kerrors', null, data.path));
                errorLogger.fatal(IntegrationConstants.S2K_ERROR+"Error connecting to S2K.");
                throw new Error();
            }
        }
    };
}());