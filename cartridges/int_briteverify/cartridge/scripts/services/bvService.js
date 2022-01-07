'use strict';


const serviceName = 'int.briteverify.rest';
const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger1 = require('dw/system/Logger');
var Logger = Logger1.getLogger("Email","briteVerify");
const ServiceCredential = require('dw/svc/ServiceCredential');
var IntegrationConstants = require('*/cartridge/scripts/utils/cdwConstants').getConstants();
var errorLogger = require('dw/system/Logger').getLogger(IntegrationConstants.INTEGRATION_ERROR_FILE,"s2k");





var BriteVerifyService = LocalServiceRegistry.createService(serviceName, {
    createRequest: function (svc, callMethod, data) {
        var credential = svc.configuration.credential;
        if (!(credential instanceof ServiceCredential)) {
            var {
                msgf
            } = Resource; 
            throw new Error(msgf('service.nocredentials', 'paywareerrors', null, serviceName));
        }
        svc.setURL(svc.URL+data+credential.password);
        svc.setRequestMethod(callMethod);

        return data;
    },
    parseResponse: function (svc, httpClient) {
        Logger.debug('getRequestData::'+svc.requestData);


        if (httpClient.statusCode == 200 || httpClient.statusCode == 201) {
	    	var jsonResponse = JSON.parse(httpClient.getText());
            Logger.debug('Response ::'+ jsonResponse);
             var a = jsonResponse.status;

            return a;
		}
		else{
			Logger.error("Error on http request: "+ httpClient.getErrorText());
            errorLogger.fatal(IntegrationConstants.BRITEVERIFY_ERROR+ " Error Connecting to BriteVerify. Details:"+httpClient.getErrorText());
			var resp = null;
			return resp;
		}
    }
});



module.exports = {
    BriteVerifyService: BriteVerifyService
};