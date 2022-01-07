'use strict';

/**
 * varants used through the 
 * @returns {array}  an array of predefined variables
 */
function getConstants() {
    return {
    /** ***************************************************************
		**  CONFIGURATION VARIABLES:
		**    Most of these settings were removed from Site Preferences.
		**    If customization is needed, change their values here.
		******************************************************************/
        
        //Payware Specific Constants
        PaywareFunctionType: 'PAYMENT', 
        PaywareCommand: 'PRE_AUTH',
        PaywarePaymentType: 'CREDIT',
        PaywarePresentFlag: '1',
        PaywareTransAcount: '1.00',
        PaywareTaxAmount: '0.00',

        RequestCatalogMessageType: 'REQUEST_CATALOG',
        RequestQuoteMessageType: 'REQUEST_QUOTE',
        NewsletterMessageType: 'NEWSLETTER',
        MessageTypeStatusCreated: '0',
        UNKNOWN_STRING: 'unknown',
        VALID_STRING: 'valid',
        ACCEPT_ALL_STRING: 'accept_all',
        INTEGRATION_ERROR_FILE: 'AcmeIntegrationError',
        FEDEX_ERROR: "FEDEX ERROR:",
        ORDER_ERROR: 'ORDER ERROR:',
        GOOGLE_CAPTCHA_ERROR: 'GOOGLE CAPTCHA ERROR:',
        S2K_ERROR: 'S2K_ERROR',
        VERTEX_ERROR: 'VERTEX_ERROR',
        PAYWARE_ERROR: 'PAYWARE_ERROR',
        PAYAPAL_ERROR: 'PAYPAL_ERROR',
        BRITEVERIFY_ERROR: 'BRITEVERIFY_ERROR',
        US_CURRENCY_CUDE: 'USD'




    };
}

exports.getConstants = getConstants;