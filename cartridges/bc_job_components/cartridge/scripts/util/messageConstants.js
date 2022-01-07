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

        RequestCatalogMessageType: 'REQUEST_CATALOG',
        RequestQuoteMessageType: 'REQUEST_QUOTE',
        NewsletterMessageType: 'NEWSLETTER',
        MessageTypeStatusCreated: '0',
        NewsletterFileNamePrefix: 'Newsletter',
        RequestQuoteFileNamePrefix: 'RequestQuote',
        RequestCatalogFileNamePrefix: 'RequestCatalog',
        MessageTypeStatusProcessed: '1',
        MessageJSONExtension: '.json'




    };
}

exports.getConstants = getConstants;
