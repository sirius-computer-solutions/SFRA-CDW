'use strict';

var googleRecaptchaService = new (require('*/cartridge/scripts/googleRecaptchaService.js'))();
var preferences = require('*/cartridge/config/preferences');
var Logger = require('dw/system/Logger');
var Site = require('dw/system/Site');
/**
 * validate google captcha token
 *
 * @param {Object} dataObj - token of the key
 * @returns 
 */
function validateToken(token){
    var result = null
    if(!!token){
        var reqPayLoad = {};
        reqPayLoad.token = token;
        reqPayLoad.apiKey = Site.getCurrent().getCustomPreferenceValue('googeReCaptchaSecretKey');
        result = googleRecaptchaService.validateToken(reqPayLoad);
    }
    
    var reCaptchaBotScoreThreshold = preferences.reCaptchaBotScoreThreshold;
	Logger.debug("result.score" + result.score);

    if(result.score <= reCaptchaBotScoreThreshold ) {
        session.custom.isbot = true;
    	Logger.debug("session.custom.isbot" + session.custom.isbot);

    } else {
    	  session.custom.isbot = false;
      	Logger.debug("session.custom.isbot" + session.custom.isbot);
    }
    return result;
}

exports.validateToken = validateToken;