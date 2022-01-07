'use strict';

/**
 * Varsity Integration related constants. 
 * @returns {array}  an array of predefined variables
 */
function getConstants() {
    return {
        /** ***************************************************************
            **  CONFIGURATION VARIABLES:
            **    These constants are used for Varsity Intgeration related 
            **    functionality.
            ******************************************************************/
            
            // Varsity Integration related constants
            HTTP_METHOD_POST: 'POST',
            CONTENT_TYPE: 'Content-Type',
            APPLICATION: 'text/json',
            VARSITY_RESPONSE: 'varsityResponse',
            ZIP_CODE: 'zipCode',
            COUNTRY: 'US',
            WAREHOUSE_ID: 'warehouseId'

    };
}

exports.getConstants = getConstants;
