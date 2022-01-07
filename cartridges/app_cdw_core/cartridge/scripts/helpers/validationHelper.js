'use strict';

var bvService = require('*/cartridge/scripts/services/bvService');
var ValidationConstants = require('*/cartridge/scripts/utils/cdwConstants').getConstants();
var emailHelper = require('*/cartridge/scripts/helpers/emailHelpers');
var Site = require('dw/system/Site');

/**
 * Method to check if the entered email address is valid by integrating with BriteVerify
 * @param {emailId} emailId
 * 
 * @returns {boolean} true/false
 */
 function valdateEmailId(emailId) {

    var validEmail = false;
    //Check if BriteVerify is enabled and call that service or else just call the emailHelper to return the validation

    var briteVerifyEnabled = Site.current.getCustomPreferenceValue('enableBriteVerify') || false;

    if(briteVerifyEnabled) {
        var service = bvService.BriteVerifyService;
        var data = "?address="+emailId+"&apikey=";
        var jsonResponse = service.call("GET", data);
        var jsonResponseObject = jsonResponse.object;

        if(jsonResponseObject == null || jsonResponseObject == ValidationConstants.VALID_STRING || jsonResponseObject == ValidationConstants.UNKNOWN_STRING || jsonResponseObject == ValidationConstants.ACCEPT_ALL_STRING) {
            validEmail = true;
        }
    } else {
        validEmail = emailHelper.validateEmail(emailId);
    }
   
    return validEmail;
}


/**
 * Method to check if the entered webrefernce number is valid
 * @param {emailId} emailId
 * 
 * @returns {boolean} true/false
 */
 function validWebReferenceNumber(webReferenceNumber) {

    var validWebReferenceNumber = false;
    var regEx = /^[0-9a-zA-Z\s]+$/;

    if(webReferenceNumber.toString().length > 20) {
        return false;
    }
    if(webReferenceNumber.match(regEx)) {
     return true;
    }   
    return validWebReferenceNumber;
}

module.exports = {
    valdateEmailId: valdateEmailId,
    validWebReferenceNumber: validWebReferenceNumber
};

