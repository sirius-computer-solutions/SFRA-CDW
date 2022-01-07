'use strict';

var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var UUIDUtils = require('dw/util/UUIDUtils');
var MessageConstants = require('*/cartridge/scripts/utils/acmeConstants').getConstants();
var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
const Transaction = require('dw/system/Transaction');
const Logger = require('dw/system/Logger');
const messageLog = Logger.getLogger('Message', 'Message');


/**
 * Attempts to create an message customObject for feed generation
 * @param {string} messageType
 * @param {string} messageObj
 * 
 * @returns {CustomObject}ObjectMgr} The order object created from the current basket
 */
 function createMessage(messageType, message) {
    var messageObj;

    try {
        messageObj = CustomObjectMgr.createCustomObject('Message', UUIDUtils.createUUID());
        messageObj.custom.messageType = messageType;
        var messageValue = JSON.stringify(message);
        messageObj.custom.message = messageValue;
        messageObj.custom.messageStatus = MessageConstants.MessageTypeStatusCreated;
        
    } catch (error) {
        messageLog.fatal("Error Occured while creating custom Message : " + error+ " --- Actual Message::"+message);
    }
    return messageObj;
}


/**
 * Attempts to create an message for newsltter and also updates the customer profile with the custom attribute
 * @param {boolelan} emailSignUp
 * @param {string} zipCode
 * 
 * @returns {boolean}
 */
 function handleNewsletterSignup(emailSignUp, zipCode, email) {
    Transaction.wrap(function () {
        try {
            if(emailSignUp) {

                if(zipCode == 'undefined' || empty(zipCode)) {
                    zipCode = '';
                }
                var nlDetails = {
                    "messageType": MessageConstants.NewsletterMessageType,
                    "email": email, 
                    "zipCode": zipCode
                };
                hooksHelper('app.newsletter.subscribe', 'signup', nlDetails, function () {});  

                if(customer.registered && customer.profile && customer.profile.custom) {
                    customer.profile.custom.newsletterSignUp = true;
                }

            } else {
                if(customer.registered && customer.profile && customer.profile.custom) {
                    customer.profile.custom.newsletterSignUp = false;
                }

            }
            
        } catch (error) {
            var a = error;
            messageLog.fatal("Error Occured while creating newsletter message and signup data : " + error);
            return false;
        }
    });
    return true;
}


module.exports = {
    createMessage: createMessage,
    handleNewsletterSignup: handleNewsletterSignup
};

