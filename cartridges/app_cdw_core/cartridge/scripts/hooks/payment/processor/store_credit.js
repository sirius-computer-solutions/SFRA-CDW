'use strict';

var collections = require('*/cartridge/scripts/util/collections');

var PaymentInstrument = require('dw/order/PaymentInstrument');
var PaymentMgr = require('dw/order/PaymentMgr');
var GiftCertMgr = require('dw/order/GiftCertificateMgr');
var GiftCert = require('dw/order/GiftCertificate');
var PaymentStatusCodes = require('dw/order/PaymentStatusCodes');
var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger');
var logger = Logger.getLogger("Payment","payware");
var HookMgr = require('dw/system/HookMgr');


/**
 * Verifies that store creidt information is a valid . If the information is valid a
 * store credit instrument is created
 * @param {dw.order.Basket} basket Current users's basket
 * @param {Object} paymentInformation - the payment information
 * @return {Object} returns an error object
 */
function Handle(basket, paymentInformation) {
    var currentBasket = basket;
    var cardErrors = {};

    var serverErrors = [];
    // Get all payment instruments, instead of only METHOD_STORE_CREDIT
    var paymentInstruments = currentBasket.getPaymentInstruments();
        

    collections.forEach(paymentInstruments, function (item) {
        currentBasket.removePaymentInstrument(item);
        logger.debug("Inside the collection...");
        logger.debug("Inside the payInsturments::"+item.getGiftCertificateCode());
    });

    var basketTotalGrossPrice = currentBasket.totalGrossPrice.value;
    var storeCreditBalance;
    if(customer.registered && customer.profile && customer.profile.custom && customer.profile.custom.b2bUser && customer.profile.custom.b2bAccountNumber 
            && customer.profile.custom.b2bPayByTerms &&  customer.profile.custom.b2bCreditLimit && customer.profile.custom.b2bWebEnabled) {
                storeCreditBalance = customer.profile.custom.b2bCreditLimit;
    } else {
        cardErrors[paymentInformation.storeCreditCode.value] = Resource.msg('invalid.store.credit.option', 'storeCredit', null);
        return { fieldErrors: [cardErrors], serverErrors: serverErrors, error: true };

    }
    
    Transaction.wrap(function () {
        if (storeCreditBalance >= basketTotalGrossPrice) {
            var paymentInstrument = currentBasket.createPaymentInstrument(
                "STORE_CREDIT", currentBasket.totalGrossPrice
            );
        } else {
            cardErrors[paymentInformation.storeCreditCode.value] = 'Store Credit has lower balance ('+storeCreditBalance+') than the basket totalGrossPrice ('+basketTotalGrossPrice+').';
            return { fieldErrors: [cardErrors], serverErrors: serverErrors, error: true };
        }
       // paymentInstrument.setBankAccountNumber(paymentInformation.storeCreditCode.value);
        paymentInstrument.custom.storeCreditAccountNumber = paymentInformation.storeCreditCode.value;
        var webReferenceNumber;
        if(paymentInformation.webReferenceNumber) {
            webReferenceNumber = paymentInformation.webReferenceNumber.value;
           // paymentInstrument.setBankRoutingNumber(paymentInformation.webReferenceNumber.value);
            paymentInstrument.custom.webReferenceNumber = paymentInformation.webReferenceNumber.value;
        }

    });

    return { fieldErrors: cardErrors, serverErrors: serverErrors, error: false };
}

/**
 * Authorizes a payment using a store creidt.
 * @param {number} orderNumber - The current order's number
 * @param {dw.order.PaymentInstrument} paymentInstrument -  The payment instrument to authorize
 * @param {dw.order.PaymentProcessor} paymentProcessor -  The payment processor of the current
 *      payment method
 * @return {Object} returns an error object
 */
function Authorize(orderNumber, paymentInstrument, paymentProcessor) {
    var serverErrors = [];
    var fieldErrors = {};
    var error = false;

    try {
        Transaction.wrap(function () {

        paymentInstrument.paymentTransaction.setTransactionID(orderNumber);
        paymentInstrument.paymentTransaction.setAmount(paymentInstrument.paymentTransaction.amount);
        paymentInstrument.paymentTransaction.setPaymentProcessor(paymentProcessor);


        });
    } catch (e) {
        var a= e;
        error = true;
        serverErrors.push(
            Resource.msg('error.technical', 'checkout', null)
        );
    }

    return { fieldErrors: fieldErrors, serverErrors: serverErrors, error: error };
}

exports.Handle = Handle;
exports.Authorize = Authorize;

