'use strict';

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
    validEmail = emailHelper.validateEmail(emailId);
   
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

