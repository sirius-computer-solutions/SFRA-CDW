'use strict'

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger');
var IntegrationConstants = require('*/cartridge/scripts/utils/cdwConstants').getConstants();
var errorLogger = require('dw/system/Logger').getLogger(IntegrationConstants.INTEGRATION_ERROR_FILE,"gogoeCaptcha");


var GoogleRecaptchaService = function () {
    /**
    * Helper method for validating google recaptcha
    *
    * @param {Object} data The JSON data to send in the body of the request
    *
    */
    this.validateToken = function (data) {
        var validateTokenService = LocalServiceRegistry.createService('google.recaptcha.https.post', {
            createRequest: function (service, params) {
                service.addHeader('Content-Type','application/json');
                service.addParam('secret', data.apiKey);
                service.addParam('response', data.token);
                service.setRequestMethod('POST');
                Logger.info('Request:\n{0}', JSON.stringify(data.requestJSON));
                return JSON.stringify(data.requestJSON);
            },
            parseResponse: function (service, httpClient) {
                Logger.info('Response:\n{0}', httpClient.text);
                return JSON.parse(httpClient.text);
            },
            filterMessage: function (res){
                return res;
            }
        });

        var result = validateTokenService.call(JSON.stringify(data));
        if (result.status != 'OK' || !result.object) {
            errorLogger.fatal(IntegrationConstants.GOOGLE_CAPTCHA_ERROR+" Error Connecting to Google ReCaptcha.");
            Logger.error('Validate token service failure: {0}', result.errorMessage);
            return null;
        }
        return result.object;
    };
};
module.exports = GoogleRecaptchaService;