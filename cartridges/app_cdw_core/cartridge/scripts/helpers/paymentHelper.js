importPackage( dw.svc );

/* API Includes */
var Transaction = require('dw/system/Transaction');
var OrderMgr = require('dw/order/OrderMgr');
const ServiceCredential = require('dw/svc/ServiceCredential');
var Logger1 = require('dw/system/Logger');
var Logger = Logger1.getLogger("Payment","payware");
const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var PaymentConstants = require('*/cartridge/scripts/utils/cdwConstants').getConstants();
var BasketMgr = require('dw/order/BasketMgr');
const Encoding = require('dw/crypto/Encoding');
const Bytes = require('dw/util/Bytes');
var Site = require('dw/system/Site');

var IntegrationConstants = require('*/cartridge/scripts/utils/cdwConstants').getConstants();
var errorLogger = require('dw/system/Logger').getLogger(IntegrationConstants.INTEGRATION_ERROR_FILE,"payware");

const {
    validateExpiredTransaction,
    validateEmail,
    validatePaymentMethod,
    validateGiftCertificateAmount
} = require('*/cartridge/scripts/paypal/middleware');

const {
    getPurchaseUnit,
    isPurchaseUnitChanged,
    basketModelHack,
    updateCustomerEmail,
    updateCustomerPhone,
    updatePayPalEmail
} = require('*/cartridge/scripts/paypal/helpers/paypalHelper');

const {
    getPaypalPaymentInstrument,
    getPaymentInstrumentAction
} = require('*/cartridge/scripts/paypal/helpers/paymentInstrumentHelper');

const {
    updateOrderDetails,
    getOrderDetails,
    getBADetails
} = require('*/cartridge/scripts/paypal/paypalApi');

const {
    encodeString,
    errorHandle
} = require('*/cartridge/scripts/paypal/paypalUtils');

const {
    isSameBillingAgreement,
    createBaFromForm
} = require('*/cartridge/scripts/paypal/helpers/billingAgreementHelper');

const {
    updateOrderBillingAddress,
    updateBABillingAddress
} = require('*/cartridge/scripts/paypal/helpers/addressHelper');

/**
 * Encodes the specified string value into encoded string.
 *
 * @param {String} value the value to be encoded
 * @returns {string} result - the encoded string
 */
 function encodeOrderString(value) {
    var bytes = new Bytes(value);
    return Encoding.toBase64(bytes);
}
/*
var PaywareService = LocalServiceRegistry.createService('int.payware.http', {
    createRequest: function (svc, callMethod, paymentInstrument, orderNumber, data) {
        var credential = svc.configuration.credential;
        if (!(credential instanceof ServiceCredential)) {
            var {
                msgf
            } = Resource; 
            throw new Error(msgf('service.nocredentials', 'paywareerrors', null, serviceName));
        }
        svc.setRequestMethod(callMethod);
        svc.addHeader('Content-Type', 'text/xml');
        
        data = populateRequestData(credential, data, paymentInstrument, orderNumber);
        Logger.info("data sendHttpPaywarePayXml URI :"+data.toString());
        return data;
    },
    parseResponse: function (svc, httpClient) {
        Logger.info('getRequestData::'+svc.requestData);


        if (httpClient.statusCode == 200 || httpClient.statusCode == 201) {
	    	var XmlResponse = new XML(httpClient.text);
            Logger.info('Response @@@@ fff::'+ XmlResponse);
            return XmlResponse;
		}
		else{
			Logger.error("Error on http request: "+ httpClient.getErrorText());
            errorLogger.fatal(IntegrationConstants.PAYWARE_ERROR+ "Not able to get proper response from Payware. Details:"+httpClient.getErrorText());
			var resp = null;
			return resp;
		}
    }
});
*/

/**
 * populateRequestData for payware call
 * @param  {dw.svc.ServiceCredential} credential current service credential
 * @param  {string} requestData
 * @returns {string} paymentProcessor
 */
 function populateRequestData(credential, data, paymentInstrument, orderNumber) {
    
    //Populdate Client Data
    data.CLIENT_ID = credential.custom.clientId;
    data.MERCHANTKEY = credential.custom.merchantKey;
    data.USER_ID = credential.user;
    data.USER_PW = credential.password;
    data.CLIENT_ID = credential.custom.clientId;

    //Get the static data
    data.FUNCTION_TYPE = PaymentConstants.PaywareFunctionType;
    data.COMMAND = PaymentConstants.PaywareCommand;
    data.PAYMENT_TYPE = PaymentConstants.PaywarePaymentType;
    data.PRESENT_FLAG = PaymentConstants.PaywarePresentFlag;
    data.TRANS_AMOUNT = PaymentConstants.PaywareTransAcount;
    data.TAX_AMOUNT = PaymentConstants.PaywareTaxAmount;

    //Populate Dynamic Data now
    data.PURCHASE_ID = orderNumber;
    data.INVOICE = orderNumber;

    Logger.info('orderNumber::'+orderNumber);
    var order = OrderMgr.getOrder(orderNumber);

    /*
    Logger.info('order.billingAddress.firstName::'+order.billingAddress.firstName);
    Logger.info('order.billingAddress.firstName::'+order.billingAddress.lastName);
    Logger.info('order.billingAddress.firstName::'+order.billingAddress.address1);

    Logger.info('order.billingAddress.postalCode::'+order.billingAddress.postalCode);
    Logger.info('order.billingAddress.expirationMonth::'+paymentInstrument.permanentlyMasked);
    Logger.info('order.billingAddress.expirationYear::'+paymentInstrument.creditCardNumber);
    Logger.info('order.billingAddress.creditCardNumber::'+order.paymentInstruments[0].creditCardNumber);
    Logger.info('order.billingAddress.customerId::'+order.customer.ID);
   
    */
    

    // //Set User ID
     data.CUSTOMER_CODE = orderNumber;

    // //Populate Card Information
     data.ACCT_NUM = paymentInstrument.creditCardNumber;
     data.CVV2 = session.forms.billing.creditCardFields.securityCode.value;
     data.EXP_MONTH = paymentInstrument.creditCardExpirationMonth;
     data.EXP_YEAR = paymentInstrument.creditCardExpirationYear;
     data.CARDHOLDER = paymentInstrument.creditCardHolder;
     let customerStreedAddress = order.billingAddress.address1;
     data.CUSTOMER_STREET = customerStreedAddress!=null && customerStreedAddress.length>20?customerStreedAddress.substring(0,20):customerStreedAddress;
     let zipcode = order.billingAddress.postalCode; 
     data.CUSTOMER_ZIP = zipcode!=null && zipcode.length > 5? zipcode.substring(0,5): zipcode;
     return data;
}


/**
 * populateExtraCCAttributes for payware call
 * @param  {string} orderId
 * @param  {serviceResponse} serviceResponse
 * @returns {string} extraCCAttributes
 */
 function populateExtraCCAttributes(orderId, serviceResponse, ccBinNUmber) {
    var extraCCAttributes;
    /**
     * Set the extra attributes for backend to do the fraud check
     * Value Format: SESSIONID|RESPONSE_TEXT|RESULT|CVV2_CODE|RESULT_CODE 
     */ 
        var extraCCAttributes;

        var SESSIONID = encodeOrderString(orderId);
        
        if(!empty(SESSIONID)) {
            extraCCAttributes = SESSIONID + "|";
        } else {
            extraCCAttributes = "N/A|";
        }
        if(!empty(serviceResponse.RESPONSE_TEXT)) {
            extraCCAttributes = extraCCAttributes + serviceResponse.RESPONSE_TEXT + "|";
        } else {
            extraCCAttributes = "N/A|";
        }
                
        if(!empty(serviceResponse.RESULT)) {
            extraCCAttributes = extraCCAttributes + serviceResponse.RESULT + "|";
        } else {
            extraCCAttributes = "N/A|";
        }

        if(!empty(serviceResponse.CVV2_CODE)) {
            extraCCAttributes = extraCCAttributes + serviceResponse.CVV2_CODE + "|";
        } else {
            extraCCAttributes = "N/A|";
        }

        if(!empty(serviceResponse.RESULT_CODE)) {
            extraCCAttributes = extraCCAttributes + serviceResponse.RESULT_CODE + "|";
        } else {
            extraCCAttributes = "N/A|";
        }
        if(!empty(ccBinNUmber)) {
            extraCCAttributes = extraCCAttributes + ccBinNUmber + "|";
        } else {
            extraCCAttributes = "N/A|";
        }        

        
    return extraCCAttributes;
}

/**
 * process PayPal logic 
 * @param  {res} res current service credential
 * @param  {server} server
* @param  {thisObj} thisObj 
 * @returns {string} paymentProcessor
 */
 function payPalSubmitPayment(res, server, thisObj, req) {
    var HookMgr = require('dw/system/HookMgr');
    var Locale = require('dw/util/Locale');
    var AccountModel = require('*/cartridge/models/account');
    var OrderModel = require('*/cartridge/models/order');

    var basket = BasketMgr.getCurrentBasket();
    var currencyCode = basket.getCurrencyCode();
    var paypalPaymentInstrument = getPaypalPaymentInstrument(basket);
    var billingData = res.getViewData();
    var billingForm = server.forms.getForm('billing');

    if (!paypalPaymentInstrument) {
        thisObj.on('route:BeforeComplete', function (_, res) {
            var paypalPaymentInstrument = getPaypalPaymentInstrument(basket);
            if (!paypalPaymentInstrument) return;
            var currentBasket = BasketMgr.getCurrentBasket();
            var viewData = res.getViewData();

            updatePayPalEmail({
                basketModel: viewData.order,
                paypalPI: getPaypalPaymentInstrument(currentBasket)
            });
            basketModelHack(viewData.order, currencyCode);

            res.json(viewData);
        });
        return next();
    }
    var {
        noOrderIdChange,
        isOrderIdChanged,
        checkBillingAgreement
    } = getPaymentInstrumentAction(paypalPaymentInstrument, billingForm.paypal);

    updateCustomerEmail(basket, billingData);
    updateCustomerPhone(basket, billingData);

    if (checkBillingAgreement) {
        var activeBA = createBaFromForm(billingForm);
        var baFromPaymentInstrument;

        try {
            baFromPaymentInstrument = JSON.parse(paypalPaymentInstrument.custom.PP_API_ActiveBillingAgreement);
        } catch (err) {
            return errorHandle.call(thisObj, req, res, err);
        }

        if (!isSameBillingAgreement(baFromPaymentInstrument, activeBA)) {
            Transaction.wrap(function () {
                paypalPaymentInstrument.custom.PP_API_ActiveBillingAgreement = JSON.stringify(activeBA);
            });
            // if account is changed to different one we update billing address and email
            if (baFromPaymentInstrument.email !== activeBA.email) {
                var { billing_info, err: BADetailsError } = getBADetails(paypalPaymentInstrument);
                if (BADetailsError) {
                    return errorHandle.call(thisObj, req, res, BADetailsError);
                }
                updateBABillingAddress(basket, billing_info);
                session.privacy.paypalPayerEmail = billing_info.email;
            } else {
                session.privacy.paypalPayerEmail = paypalPaymentInstrument.custom.currentPaypalEmail;
            }
        }
    }

    // if user goes through checkout with the same session account we update order details if needed
    if (noOrderIdChange) {
        var purchase_unit = getPurchaseUnit(basket);
        if (purchase_unit.amount.value === '0') {
            return errorHandle.call(thisObj, req, res, null, 'zeroamount');
        }
        var isUpdateRequired = isPurchaseUnitChanged(purchase_unit);
        if (isUpdateRequired) {
            var { err: updateOrderDetailsError } = updateOrderDetails(paypalPaymentInstrument, purchase_unit);
            if (updateOrderDetailsError) {
                return errorHandle.call(thisObj, req, res, updateOrderDetailsError);
            }
            session.privacy.orderDataHash = encodeString(purchase_unit);
        }
    }

    // if user changes one session account to another we update billing address and email
    if (isOrderIdChanged) {
        Transaction.wrap(function () {
            paypalPaymentInstrument.custom.paypalOrderID = billingForm.paypal.paypalOrderID.htmlValue;
        });
        var { payer, err: OrderDetailsError } = getOrderDetails(paypalPaymentInstrument);
        if (OrderDetailsError) {
            return errorHandle.call(thisObj, req, res, OrderDetailsError);
        }
        updateOrderBillingAddress(basket, payer);
        session.privacy.paypalPayerEmail = payer.email_address;
    }

    Transaction.wrap(function () {
        HookMgr.callHook('dw.order.calculate', 'calculate', basket);
    });

    var usingMultiShipping = false; // Current integration support only single shpping
    req.session.privacyCache.set('usingMultiShipping', usingMultiShipping);
    var currentLocale = Locale.getLocale(req.locale.id);

    var basketModel = new OrderModel(basket, { usingMultiShipping: usingMultiShipping, countryCode: currentLocale.country, containerView: 'basket' });

    updatePayPalEmail({
        basketModel: basketModel,
        paypalPI: paypalPaymentInstrument
    });
    basketModelHack(basketModel, currencyCode);

    res.json({
        customer: new AccountModel(req.currentCustomer),
        order: basketModel,
        form: billingForm,
        fieldErrors: [],
        error: false
    });

 }



/**
 * isValidResultCode for payware call
 * @param  {string} resultCode
 * @returns {boolean} validResultCode
 */
 function isValidResultCode(resultCode) {
    var validResultCode = true;
    var resultCodValidationEnabled = Site.current.getCustomPreferenceValue('enablePaymentResultValidation') || false;

    if(resultCodValidationEnabled && !empty(resultCode)) {
        var invalidResultCodes = Site.current.getCustomPreferenceValue('paymentResultInvalidCodes');
        if(!empty(invalidResultCodes)){
            for(var i=0;i<invalidResultCodes.length;i++) {
                if(invalidResultCodes[i] === resultCode) {
                    validResultCode = false; 
                }
            }
        }
    }

    return validResultCode;
}

/**
 * isValidAVSCode for payware call
 * @param  {string} resultCode
 * @returns {boolean} validAVSCode
 */
 function isValidAVSCode(avsCode) {
    var validAVSCode = true;
    
    var avsValidationEnabled = Site.current.getCustomPreferenceValue('enablePaymentAVSValidation') || false;

    if(avsValidationEnabled && !empty(avsCode.AVS_CODE)) {
        var invalidAVSCodes = Site.current.getCustomPreferenceValue('paymentAVSInvalidCodes');
        if(!empty(invalidAVSCodes)){
            for(var i=0;i<invalidAVSCodes.length;i++) {
                if(invalidAVSCodes[i] == avsCode.AVS_CODE) {
                    validAVSCode = false; 
                }
            }
        }
    }

    return validAVSCode;
}


/**
 * isValidCVVCode for payware call
 * @param  {string} cvvCode
 * @returns {boolean} validCVVCode
 */
 function isValidCVVCode(cvvCode) {
    var validCVVCode = true;
    var cvvValidationEnabled = Site.current.getCustomPreferenceValue('enablePaymentCVVValidation') || false;

    if(cvvValidationEnabled && !empty(cvvCode.CVV2_CODE)) {
        var invalidCVVCodes = Site.current.getCustomPreferenceValue('paymentCVVInvalidCodes');
        if(!empty(invalidCVVCodes)){
            for(var i=0;i<invalidCVVCodes.length;i++) {
                if(invalidCVVCodes[i] == cvvCode.CVV2_CODE) {
                    validCVVCode = false; 
                }
            }
        }
    }
    return validCVVCode;
}
module.exports = {        
/*    PaywareService: PaywareService,*/
    payPalSubmitPayment: payPalSubmitPayment,
    populateExtraCCAttributes: populateExtraCCAttributes,
    isValidResultCode: isValidResultCode,
    isValidAVSCode: isValidAVSCode,
    isValidCVVCode: isValidCVVCode
};