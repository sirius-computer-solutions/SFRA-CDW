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
var logger = Logger.getLogger("Payment","giftcard");
var HookMgr = require('dw/system/HookMgr');
var MessageDigest = require('dw/crypto/MessageDigest');
var EncrptionUtils = require('*/cartridge/scripts/utils/encryptionUtils');
const encoding = require('dw/crypto/Encoding');

var Site = require('dw/system/Site');

/**
 * Creates a token. This should be replaced by utilizing a tokenization provider
 * @returns {string} a token
 */
function createToken() {
    return Math.random().toString(36).substr(2);
}

/**
 * Verifies that entered credit card information is a valid card. If the information is valid a
 * credit card payment instrument is created
 * @param {dw.order.Basket} basket Current users's basket
 * @param {Object} paymentInformation - the payment information
 * @return {Object} returns an error object
 */
function Handle(basket, paymentInformation) {
    var currentBasket = basket;
    var cardErrors = {};
    //var cardNumber = paymentInformation.cardNumber.value;
    //var cardSecurityCode = paymentInformation.securityCode.value;
    //var expirationMonth = paymentInformation.expirationMonth.value;
    //var expirationYear = paymentInformation.expirationYear.value;
    var serverErrors = [];
    var creditCardStatus;

    //var cardType = paymentInformation.cardType.value;
    //var paymentCard = PaymentMgr.getPaymentCard(cardType);
    //var paymentCard = PaymentMgr.getPaymentCard(cardType);

    /*
    if (!paymentInformation.creditCardToken) {
        if (paymentCard) {
            creditCardStatus = paymentCard.verify(
                expirationMonth,
                expirationYear,
                cardNumber,
                cardSecurityCode
            );
        } else {
            cardErrors[paymentInformation.cardNumber.htmlName] =
                Resource.msg('error.invalid.card.number', 'creditCard', null);

            return { fieldErrors: [cardErrors], serverErrors: serverErrors, error: true };
        }

        if (creditCardStatus.error) {
            collections.forEach(creditCardStatus.items, function (item) {
                switch (item.code) {
                    case PaymentStatusCodes.CREDITCARD_INVALID_CARD_NUMBER:
                        cardErrors[paymentInformation.cardNumber.htmlName] =
                            Resource.msg('error.invalid.card.number', 'creditCard', null);
                        break;

                    case PaymentStatusCodes.CREDITCARD_INVALID_EXPIRATION_DATE:
                        cardErrors[paymentInformation.expirationMonth.htmlName] =
                            Resource.msg('error.expired.credit.card', 'creditCard', null);
                        cardErrors[paymentInformation.expirationYear.htmlName] =
                            Resource.msg('error.expired.credit.card', 'creditCard', null);
                        break;

                    case PaymentStatusCodes.CREDITCARD_INVALID_SECURITY_CODE:
                        cardErrors[paymentInformation.securityCode.htmlName] =
                            Resource.msg('error.invalid.security.code', 'creditCard', null);
                        break;
                    default:
                        serverErrors.push(
                            Resource.msg('error.card.information.error', 'creditCard', null)
                        );
                }
            });

            return { fieldErrors: [cardErrors], serverErrors: serverErrors, error: true };
        }
    }
    */


    Transaction.wrap(function () {
        //var paymentInstruments = currentBasket.getPaymentInstruments(
        //    PaymentInstrument.METHOD_GIFT_CERTIFICATE
        //);

        // Get all payment instruments, instead of only METHOD_CREDIT_CARD
        var paymentInstruments = currentBasket.getGiftCertificatePaymentInstruments();
        logger.debug("DDDDDE 222::::"+paymentInformation);
        

        collections.forEach(paymentInstruments, function (item) {
            //currentBasket.removePaymentInstrument(item);
            logger.debug("Inside the collection...");
            logger.debug("Inside the payInsturments::"+item.getGiftCertificateCode());
        });

        var basketTotalGrossPrice = currentBasket.totalGrossPrice.value;
        //require('dw/system/Logger').debug('basketTotalGrossPrice: ' + basketTotalGrossPrice + ' Type: ' + typeof(basketTotalGrossPrice));
//        var giftCertBalance = GiftCertMgr.getGiftCertificateByCode(paymentInformation.giftCertCode.value).getBalance().getValue();
        var giftCertBalance = "50000.00";
        //var giftCertBalance = giftCert.getBalance().getValue();
        //require('dw/system/Logger').debug('giftCertBalance: ' + giftCertBalance + ' Type: ' + typeof(giftCertBalance));

        if (giftCertBalance >= basketTotalGrossPrice) {
            var paymentInstrument = currentBasket.createPaymentInstrument(
                PaymentInstrument.METHOD_GIFT_CERTIFICATE, currentBasket.totalGrossPrice
            );
        } else {
            cardErrors[paymentInformation.giftCertCode.value] = 'Gift Cert has lower balance ('+giftCertBalance+') than the basket totalGrossPrice ('+basketTotalGrossPrice+').';
            return { fieldErrors: [cardErrors], serverErrors: serverErrors, error: true };
        }

        paymentInstrument.setGiftCertificateCode(paymentInformation.giftCertCode.value);
        /*
        paymentInstrument.setCreditCardHolder(currentBasket.billingAddress.fullName);
        paymentInstrument.setCreditCardNumber(cardNumber);
        paymentInstrument.setCreditCardType(cardType);
        paymentInstrument.setCreditCardExpirationMonth(expirationMonth);
        paymentInstrument.setCreditCardExpirationYear(expirationYear);
        paymentInstrument.setCreditCardToken(
            paymentInformation.creditCardToken
                ? paymentInformation.creditCardToken
                : createToken()
        );
        */
    });

    return { fieldErrors: cardErrors, serverErrors: serverErrors, error: false };
}

/**
 * Authorizes a payment using a gift certificate.
 * @param {number} orderNumber - The current order's number
 * @param {dw.order.PaymentInstrument} paymentInstrument -  The payment instrument to authorize
 * @param {dw.order.PaymentProcessor} paymentProcessor -  The payment processor of the current
 *      payment method
 * @return {Object} returns an error object
 */
function Authorize(orderNumber, paymentInstrument, paymentProcessor, currentBasket) {
    var serverErrors = [];
    var fieldErrors = {};
    var error = false;
   
    /**
     * Logic to write here
     *  - Get the GC Number from the payment Instrument
     *  - UnAuthorize the GIFT Card if that is already authoroized by checking the status of paymentTransaction.custom.gcAuthorized
     *  - Authorize the GIFT Card again
     *  - Update the transaction ID into the payInstrument.paymentTransaction.transactionID
     *  - Update the paymentTransaction.custom.gcAuthorized as true to mark this GC is authorized
     */
    try {
        Transaction.wrap(function () {

            //Now Go ahead and authorize the GC 
            var gcAuthResponse = HookMgr.callHook(
                'app.payment.giftcard.authroize',
                'Authorize',
                // 'app.payment.giftcard.retrieve_balance',
                // 'Balance',                
                paymentInstrument.giftCertificateCode,
                paymentInstrument.paymentTransaction.amount
            );

            if(gcAuthResponse.success) {
                paymentInstrument.paymentTransaction.setTransactionID(gcAuthResponse.giftCard.id);
                paymentInstrument.paymentTransaction.setAmount(paymentInstrument.paymentTransaction.amount);
                paymentInstrument.paymentTransaction.custom.gcAuthorized = true;
                paymentInstrument.paymentTransaction.setPaymentProcessor(paymentProcessor);


                const Cipher = require('dw/crypto/Cipher');
                const certRef = new dw.crypto.CertificateRef("s2k-server");
                const keyRef = new dw.crypto.KeyRef("s2k-private");
                var cipher = new Cipher();
                const gcString = paymentInstrument.giftCertificateCode;
                var encCrypedGC = cipher.encrypt(gcString,certRef,"RSA",null,0);

                    // var decryptedGC = cipher.decrypt(encCrypedGC,keyRef,"RSA",null,0);

                paymentInstrument.paymentTransaction.custom.encryptedPaymentNumber = encCrypedGC;
  
            } else {
                return { fieldErrors: fieldErrors, serverErrors: "Cannot Authorize the GC Now", error: true };
            }

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
exports.createToken = createToken;
