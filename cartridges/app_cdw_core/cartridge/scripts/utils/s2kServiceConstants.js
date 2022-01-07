'use strict';

/**
 * S2K Integration related constants. 
 * @returns {array}  an array of predefined variables
 */
function getConstants() {
    return {
        /** ***************************************************************
            **  CONFIGURATION VARIABLES:
            **    These constants are used for S2K Intgeration related 
            **    functionality.
            ******************************************************************/
            
            // S2K Integration related constants

            AUTHORIZATION_TOKEN_CACHE_LOOKUP_ID: 's2kRestAuthorizationToken',
            AUTHORIZATION_TOKEN_NAME: 's2kAPIToken',

            HTTP_METHOD_GET: 'GET',
            HTTP_METHOD_PUT: 'PUT',
            HTTP_METHOD_POST: 'POST',

            RETRIEVE_TOKEN_API_ACTION: 'GetRequestToken',
            CHECK_EXISTING_ACCOUNT_API_ACTION: 'CheckExistingAccount',
            GET_REP_INFO_API_ACTION: 'GetRepInfo',
            RETRIEVE_ACCOUNT_INFO_API_ACTION: 'GetAccountInfo',
            GIFT_CARD_API_ACTION: 'ApplyGiftCard',
            GIFT_CARD_RETRIEVE_BAL_ACTION: 'balance',
            GIFT_CARD_AUTH_ACTION: 'apply',
            GIFT_CARD_UN_AUTH_ACTION: 'remove',
            GET_B2B_PRICE_ACTION: 'GetPrice',
            
            

            API_TRANSACTION_ID_DATE_FORMAT: 'yyyyMMddHHmmss',
            HOUR_OF_DAY: 'HH',
            API_SESSION_ID_PARAMETER_KEY: 'sessionId=',
            API_VAI_TOKEN_PARAMETER_KEY: 'VAI-TOKEN ',
            API_USER_ID_PARAMETER_KEY: 'userId',
            API_TRANSACTION_ID_PARAMETER_KEY: 'transactionid',
            API_REQUEST_TOKEN_PARAMETER_KEY: 'requestToken',
            API_AUTHORIZATION_PARAMETER_KEY: 'Authorization',

            API_CUSTOMER_ID_PARAMETER_KEY: 'customerId',
            API_ZIP_CODE_PARAMETER_KEY: 'zipCode',
            ADD_ADDRESS_ACTION: 'ShippingAddress',
            GET_ORDERS: 'GetOrders',
            GET_ORDER_DETAILS: 'GetOrderDetails',
            ADDRESS_ACTIVE: 'A',
            ADDRESS_INACTIVE: 'I',
            ADDRESS_DELETE: 'D',
            GET_VARSITY_TRANSIT: 'GetVarsityTransit',
            S2KCOUNTRY_CODE: 'USA',
            COUNTRY_CODE: 'US',

            SUBMIT_ORDER_API_ACTION: 'SubmitOrder'

    };
}

exports.getConstants = getConstants;
