'use strict';

var messageHelper = require('~/cartridge/scripts/helpers/messageHelper');
var MessageConstants = require('*/cartridge/scripts/utils/acmeConstants').getConstants();
var Transaction = require('dw/system/Transaction');


function signup(signUpDetails, templateContext) {

        /**
         * Persist the data into Message Custom Object and ahve job comes and creates teh message for backend
         */
         
             Transaction.begin();
             try
             {
                 var messageObject = messageHelper.createMessage(MessageConstants.NewsletterMessageType, signUpDetails);
                 Transaction.commit();
             }
             catch (e)
             {
                return e;
                 Transaction.rollback();
             }

}

module.exports = {
    signup: signup
};