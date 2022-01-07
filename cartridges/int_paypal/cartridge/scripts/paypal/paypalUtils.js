
'use strict';

const server = require('server');

const Encoding = require('dw/crypto/Encoding');
const Bytes = require('dw/util/Bytes');
const URLUtils = require('dw/web/URLUtils');
const Resource = require('dw/web/Resource');
const CacheMgr = require('dw/system/CacheMgr');
const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
const Logger = require('dw/system/Logger');

const {
    billingAgreementEnabled,
    isCapture,
    enabledLPMs,
    partnerAttributionId
} = require('../../config/paypalPreferences');

var {
    disableFunds,
    allowedCurrencies
} = require('../../config/sdkConfig');

var paypalLogger;

/**
 * Gets the disabled funding sources
 *
 * @returns {array} of disbled funding sources
 */
function disabledPaymentOptions() {
    if (empty(enabledLPMs)) {
        return disableFunds;
    }
    var lpmMethods = enabledLPMs.map(function (lpm) {
        return lpm.toLowerCase();
    });

    if (empty(lpmMethods)) {
        return disableFunds;
    }

    disableFunds = disableFunds.filter(function (fund) {
        return Array.indexOf(lpmMethods, fund) === -1;
    });
    return disableFunds;
}


/**
 * Gets client id from cache if it exists or creates it, saves to cache and returns from cache
 *
 * @returns {string} with client id
 */
function getClientId() {
    var prefsCache = CacheMgr.getCache('paypalPreferences');
    var serviceName = 'int_paypal.http.rest';
    var clientId = prefsCache.get('clientId');
    if (clientId) return clientId;
    var restService = LocalServiceRegistry.createService(serviceName, {});
    clientId = restService.configuration.credential.user;
    prefsCache.put('clientId', clientId);
    return clientId;
}

/**
 * Encodes purchase unit object into encoded string
 *
 * @param {Object} purchaseUnit purchase unit
 * @returns {string} encoded string
 */
function encodeString(purchaseUnit) {
    var bytes = new Bytes(JSON.stringify(purchaseUnit));
    return Encoding.toBase64(bytes);
}

/**
 * Determine if current currency supported by PP SDK
 * @param  {Array} allowedCurrenciesFromPP Allowed currencies for PP SDK
 * @param  {string} storeCurrency Current session currency
 * @returns {Boolen} Currency match state
 */
function isAllowedCurrency(allowedCurrenciesFromPP, storeCurrency) {
    return allowedCurrenciesFromPP.some(function (allowedCurrency) {
        return allowedCurrency === storeCurrency;
    });
}

/**
 * Creates SDK url for paypal button on billing page based on payment action and client id
 *
 * @returns {string} created url
 */
function createBillingSDKUrl() {
    var clientID = getClientId();
    var currentCurrencyCode = session.currency.currencyCode;
    var sdkUrl = 'https://www.paypal.com/sdk/js?client-id=' + clientID;
    var isActiveBa = customer.authenticated && billingAgreementEnabled;
    var isActiveLPM = !isActiveBa && isCapture && !empty(enabledLPMs);

    sdkUrl += isActiveLPM ? '&commit=true' : '&commit=false';

    if (!isCapture && !isActiveBa) {
        sdkUrl += '&intent=authorize';
    }

    if (billingAgreementEnabled) {
        sdkUrl += '&vault=true';
    }

    if (isAllowedCurrency(allowedCurrencies, currentCurrencyCode)) {
        sdkUrl += '&currency=' + currentCurrencyCode;
    }

    sdkUrl += '&disable-funding=' + disabledPaymentOptions().join(',');

    return sdkUrl;
}

/**
 * Creates SDK url for paypal button on cart page based on payment action and client id
 *
 * @returns {string} created url
 */
function createCartSDKUrl() {
    var clientID = getClientId();
    var currentCurrencyCode = session.currency.currencyCode;
    var sdkUrl = 'https://www.paypal.com/sdk/js?client-id=' + clientID + '&commit=false&components=buttons,messages';
    var isActiveBa = customer.authenticated && billingAgreementEnabled;

    if (!isCapture && !isActiveBa) {
        sdkUrl += '&intent=authorize';
    }

    if (billingAgreementEnabled) {
        sdkUrl += '&vault=true';
    }

    if (isAllowedCurrency(allowedCurrencies, currentCurrencyCode)) {
        sdkUrl += '&currency=' + currentCurrencyCode;
    }

    sdkUrl += '&disable-funding=' + disabledPaymentOptions().join(',');

    return sdkUrl;
}

/**
 * Creates SDK url for paypal button on account page for vaulting based on client id
 *
 * @returns {string} created url
 */
function createAccountSDKUrl() {
    var clientID = getClientId();
    var sdkUrl = 'https://www.paypal.com/sdk/js?client-id=' + clientID + '&commit=false&vault=true&disable-funding=card';

    return sdkUrl;
}


/**
 * Get logger instance
 *
 * @param {string} err Error message
 */
function createErrorLog(err) {
    paypalLogger = paypalLogger || Logger.getLogger('PayPal', 'PayPal_General');
    if (!empty(err)) {
        paypalLogger.error(err.stack ? (err.message + err.stack) : err);
    } else {
        paypalLogger.debug('Empty log entry');
    }
    return;
}

/**
 * Get the client-side URLs of a given page
 *
 * @returns {Object} An objects key key-value pairs holding the URLs
 */
function getUrls() {
    return {
        getPurchaseUnit: URLUtils.https('Paypal-GetPurchaseUnit').toString(),
        getCartPurchaseUnit: URLUtils.https('Paypal-GetPurchaseUnit', 'isCartFlow', 'true').toString(),
        returnFromCart: URLUtils.https('Paypal-ReturnFromCart').toString(),
        cartPage: URLUtils.https('Cart-Show').toString(),
        billingSdkUrl: createBillingSDKUrl(),
        cartSdkUrl: createCartSDKUrl(),
        placeOrderStage: URLUtils.url('Checkout-Begin', 'stage', 'placeOrder').toString(),
        updateOrderData: URLUtils.url('Paypal-UpdateOrderDetails').toString(),
        createBillingAgreementToken: URLUtils.url('Paypal-GetBillingAgreementToken').toString(),
        createBillingAgreement: URLUtils.url('Paypal-CreateBillingAgreement').toString(),
        removeBillingAgreement: URLUtils.url('Paypal-RemoveBillingAgreement').toString(),
        saveBillingAgreement: URLUtils.url('Paypal-SaveBillingAgreement').toString(),
        getOrderDetails: URLUtils.url('Paypal-GetOrderDetails').toString(),
        paymentStage: URLUtils.https('Checkout-Begin', 'stage', 'payment').toString(),
        finishLpmOrder: URLUtils.url('Paypal-FinishLpmOrder').toString(),
        partnerAttributionId: partnerAttributionId
    };
}

/**
 * Creates the Error Message
 *
 * @param {string} errorName error message name
 * @returns {string} errorMsg - Resource error massage
 */
function createErrorMsg(errorName) {
    var defaultMessage = Resource.msg('paypal.error.general', 'paypalerrors', null);
    var errorMsg = Resource.msg('paypal.error.' + errorName, 'paypalerrors', defaultMessage);
    return errorMsg;
}

/**
 * Error handler for SubmitPayment endpoint
 * @param  {Object} req server request
 * @param  {Object} res server response
 * @param  {Error} error error instance
 * @param  {string} msg error text type for client
 * @returns {void}
 */
function errorHandle(req, res, error, msg) {
    if (error) createErrorLog(error);
    res.json({
        form: server.forms.getForm('billing'),
        fieldErrors: [],
        serverErrors: [createErrorMsg(msg)],
        error: true
    });
    this.emit('route:Complete', req, res);
}

module.exports = {
    getClientId: getClientId,
    createErrorLog: createErrorLog,
    encodeString: encodeString,
    getUrls: getUrls,
    createErrorMsg: createErrorMsg,
    createBillingSDKUrl: createBillingSDKUrl,
    createCartSDKUrl: createCartSDKUrl,
    createAccountSDKUrl: createAccountSDKUrl,
    errorHandle: errorHandle
};
