'use strict';

var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger');
var logger = Logger.getLogger("Payment","payware");

var collections = require('*/cartridge/scripts/util/collections');
var PaywareHelper = require('*/cartridge/scripts/helpers/paymentHelper');

var PaymentInstrument = require('dw/order/PaymentInstrument');
var PaymentMgr = require('dw/order/PaymentMgr');
var PaymentStatusCodes = require('dw/order/PaymentStatusCodes');


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
 * @param {string} paymentMethodID - paymentmethodID
 * @param {Object} req the request object
 * @return {Object} returns an error object
 */
function Handle(basket, paymentInformation, paymentMethodID, req) {
    var currentBasket = basket;
    var cardErrors = {};
    var cardNumber = paymentInformation.cardNumber.value;
    var cardSecurityCode = paymentInformation.securityCode.value;
    var expirationMonth = paymentInformation.expirationMonth.value;
    var expirationYear = paymentInformation.expirationYear.value;
    var serverErrors = [];
    var creditCardStatus;


    var cardType = paymentInformation.cardType.value;
    var paymentCard = PaymentMgr.getPaymentCard(cardType);


    // Validate payment instrument
    if (paymentMethodID === PaymentInstrument.METHOD_CREDIT_CARD) {
        var creditCardPaymentMethod = PaymentMgr.getPaymentMethod(PaymentInstrument.METHOD_CREDIT_CARD);
        var paymentCardValue = PaymentMgr.getPaymentCard(paymentInformation.cardType.value);

        var applicablePaymentCards = creditCardPaymentMethod.getApplicablePaymentCards(
            req.currentCustomer.raw,
            req.geolocation.countryCode,
            null
        );

        if (!applicablePaymentCards.contains(paymentCardValue)) {
            // Invalid Payment Instrument
            var invalidPaymentMethod = Resource.msg('error.payment.not.valid', 'checkout', null);
            return { fieldErrors: [], serverErrors: [invalidPaymentMethod], error: true };
        }
    }

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

    Transaction.wrap(function () {

        var paymentInstruments = currentBasket.paymentInstruments;
        collections.forEach(paymentInstruments, function (item) {
            if (!PaymentInstrument.METHOD_GIFT_CERTIFICATE.equals(item.paymentMethod)) {
                currentBasket.removePaymentInstrument(item);
            }
        });


        var gcPaymentInstruments = currentBasket.getPaymentInstruments(
            PaymentInstrument.METHOD_GIFT_CERTIFICATE
        );

        const Money = require('dw/value/Money');

        var gcAmount = new Money(0,currentBasket.currencyCode);

        collections.forEach(gcPaymentInstruments, function (item) {
             gcAmount = gcAmount+item.paymentTransaction.amount;
        });

        var ccAmount =  currentBasket.totalGrossPrice - gcAmount;

        var paymentInstrument = currentBasket.createPaymentInstrument(
            PaymentInstrument.METHOD_CREDIT_CARD, new Money(ccAmount, currentBasket.currencyCode)
        );

        paymentInstrument.setCreditCardHolder(currentBasket.billingAddress.fullName);
        
        paymentInstrument.setCreditCardNumber(cardNumber);
        paymentInstrument.setCreditCardType(cardType);
        paymentInstrument.setCreditCardExpirationMonth(expirationMonth);
        paymentInstrument.setCreditCardExpirationYear(expirationYear);

       var webReferenceNumber;
       if(paymentInformation.webReferenceNumber) {
           webReferenceNumber = paymentInformation.webReferenceNumber.value;
           paymentInstrument.custom.webReferenceNumber = paymentInformation.webReferenceNumber.value;
       }

        // paymentInstrument.setCreditCardToken(
        //     paymentInformation.creditCardToken
        //         ? paymentInformation.creditCardToken
        //         : createToken()
        // );
    });
    return { fieldErrors: cardErrors, serverErrors: serverErrors, error: false };
}

/**
 * Authorizes a payment using a credit card. Customizations may use other processors and custom
 *      logic to authorize credit card payment.
 * @param {number} orderNumber - The current order's number
 * @param {dw.order.PaymentInstrument} paymentInstrument -  The payment instrument to authorize
 * @param {dw.order.PaymentProcessor} paymentProcessor -  The payment processor of the current
 *      payment method
 * @return {Object} returns an error object
 */
 function Authorize(orderNumber, paymentInstrument, paymentProcessor) {
    const Cipher = require('dw/crypto/Cipher');
    var serverErrors = [];
    var fieldErrors = {};
    var error = false;

    // const certRef = new dw.crypto.CertificateRef("s2k-server");
    // const keyRef = new dw.crypto.KeyRef("s2k-private");

    try {
        Transaction.wrap(function () {
            paymentInstrument.paymentTransaction.setTransactionID(orderNumber);
            paymentInstrument.paymentTransaction.setPaymentProcessor(paymentProcessor);
            
            /**Logic to encrypt the CC number for S2K Purpose */
            // var encryptedCC = paymentInstrument.getEncryptedCreditCardNumber(dw.order.PaymentInstrument.ENCRYPTION_ALGORITHM_RSA, certRef);
            // paymentInstrument.paymentTransaction.custom.encryptedCCNumber=encryptedCC;
            // var cipher = new Cipher();
            // var decryptedCC = cipher.decrypt(encryptedCC, keyRef, dw.order.PaymentInstrument.ENCRYPTION_ALGORITHM_RSA, null, 0);            
            

            var data : XML = 
                    <TRANSACTION>
                        <CLIENT_ID></CLIENT_ID>
                        <USER_ID></USER_ID>
                        <USER_PW></USER_PW>
                        <MERCHANTKEY></MERCHANTKEY>
                        <FUNCTION_TYPE></FUNCTION_TYPE>
                        <COMMAND></COMMAND>
                        <PAYMENT_TYPE></PAYMENT_TYPE>
                        <PRESENT_FLAG></PRESENT_FLAG>
                        <ACCT_NUM></ACCT_NUM>
                        <CVV2></CVV2>
                        <EXP_MONTH></EXP_MONTH>
                        <EXP_YEAR></EXP_YEAR>
                        <TRANS_AMOUNT></TRANS_AMOUNT>
                        <TAX_AMOUNT></TAX_AMOUNT>
                        <CUSTOMER_CODE></CUSTOMER_CODE>
                        <PURCHASE_ID></PURCHASE_ID>
                        <INVOICE></INVOICE>
                        <CARDHOLDER></CARDHOLDER>
                        <CUSTOMER_STREET></CUSTOMER_STREET>
                        <CUSTOMER_ZIP></CUSTOMER_ZIP>
                    </TRANSACTION>; 	

            var generalRequest = data ? data.copy() : null;

           // var logRequest = generalRequest ? PaywareHelper.FilterRequestForLog(generalRequest) : null;
            logger.info("Payware Request Request sdsd : " + generalRequest);
            
            var service = PaywareHelper.PaywareService;
            var ccBinNUmber = paymentInstrument.creditCardNumber.substring(0,6);
            var XmlResponse = service.call("POST", paymentInstrument,orderNumber, data);
            logger.info("paywareResponse XmlResponse : " + XmlResponse);
            if(XmlResponse == null ){
                logger.info("Error occured while redirecting to Payment page :"+XmlResponse);
                return {error:true};
            }

            if (XmlResponse.isOk()) {
                logger.info("Payware restService.response:::"+service.response.RESULT);
                if (service.response.RESULT != 'APPROVED'
                        || !PaywareHelper.isValidAVSCode(service.response)
                        || !PaywareHelper.isValidCVVCode(service.response)) {
                    error = true;
                }else {
                    //Update the transaction number here
                    paymentInstrument.paymentTransaction.setTransactionID(service.response.TROUTD);
                    //Populate Extra Attributes for Order XML for Fraud purpose
                    var extraCCAttributes = PaywareHelper.populateExtraCCAttributes(orderNumber, service.response, ccBinNUmber);
                    if(!empty(extraCCAttributes)) {
                        paymentInstrument.paymentTransaction.custom.extraCCAttributes = extraCCAttributes;
                    }
                    logger.info("Payware APPROVED Status:::"+service.response.RESULT);
                }
            } else {
                logger.info("Payware Error occured while redirecting to Payment page :"+XmlResponse);
                return {error:true};
            }



             

        });
    } catch (e) {
        var a =e;
        logger.info("ERROROR OCCUREEE::"+e);
        error = true;
        serverErrors.push(
            Resource.msg('error.technical', 'checkout', null)
        );
    }

    return { fieldErrors: fieldErrors, serverErrors: serverErrors, error: error };
}

exports.Authorize = Authorize;
exports.Handle = Handle;
