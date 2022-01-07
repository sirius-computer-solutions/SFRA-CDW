'use strict';

var server = require('server');
var GiftCertMgr = require('dw/order/GiftCertificateMgr');
var GiftCert = require('dw/order/GiftCertificate');
var Resource = require('dw/web/Resource');
var HookMgr = require('dw/system/HookMgr');
var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
var GiftCertificateModel = require('*/cartridge/models/giftcertificate');
var BasketMgr = require('dw/order/BasketMgr');
var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
const Money = require('dw/value/Money');
var Transaction = require('dw/system/Transaction');
const StringUtils = require('dw/util/StringUtils');
var PaymentInstrument = require('dw/order/PaymentInstrument');


server.get('Landing', server.middleware.https, function (req, res, next) {
    res.render('/giftCertificate/giftCertificateLanding');

    next();
});

server.post('Get', server.middleware.https, function (req, res, next) {
    var giftCert;

    if (req.form.giftCertCode) {
        //Logger.debug('Found req.form.giftCertCode with value: ' + req.form.giftCertCode);
        giftCert = GiftCertMgr.getGiftCertificateByCode(req.form.giftCertCode);

        if (giftCert) {

            var giftCertificateModel = new GiftCertificateModel(giftCert);

            res.render('/giftCertificate/giftCertificate', { giftcertificate: giftCertificateModel, status: 'found' });
        } else {
            res.render('/giftCertificate/giftCertificate', { giftcertificate: giftCertificateModel, status: 'not found' });
        }
    }


    next();
});

/**
 * Route to remove the GC from the order
 *  - Checks the balance and if that is more than $0, then it applied
 */
 server.get('Remove', server.middleware.https, function(req, res, next) {
    var collections = require('*/cartridge/scripts/util/collections');
    var payInsId;
    var removeAll = false;
    payInsId = req.querystring.payInsId;
    removeAll = req.querystring.removeAll;

    var currentBasket = BasketMgr.getCurrentBasket();
    var currency = currentBasket.getCurrencyCode();
    var removeGCDiv = false; 
    var totalGCRemaining = new Money(0.00, currency);
    var totalBalancePaymentRequired = new Money(0.00, currency);

    if(removeAll && removeAll == 'true') {
        //Do logic remove all the GC from the basket
        Transaction.wrap(function () {
            var gcPaymentInstruments = currentBasket.getGiftCertificatePaymentInstruments();
            collections.forEach(gcPaymentInstruments, function (item) {
                    currentBasket.removePaymentInstrument(item)
            });
        }); 
        removeGCDiv = true;
    } else {
        payInsId = req.querystring.payInsId;

        
        //Do logic remove the GC from the basket
        Transaction.wrap(function () {
            var gcPaymentInstruments = currentBasket.getGiftCertificatePaymentInstruments();
            collections.forEach(gcPaymentInstruments, function (item) {
                totalGCRemaining = totalGCRemaining+item.paymentTransaction.amount;
                if(item.UUID == payInsId ) {
                    totalGCRemaining = totalGCRemaining - item.paymentTransaction.amount;
                    currentBasket.removePaymentInstrument(item);
                }
            });
        });   
        
        if(totalGCRemaining == 0) {
            removeGCDiv = true;
        } else {
            totalBalancePaymentRequired = currentBasket.totalGrossPrice.value - totalGCRemaining;
            totalBalancePaymentRequired = StringUtils.formatMoney(new Money(totalBalancePaymentRequired, currency));
            totalGCRemaining = StringUtils.formatMoney(new Money(totalGCRemaining, currency));
        }
    }

    res.json({
        successfulyRemoved: true,
        payInsId: payInsId,
        removeGCDiv: removeGCDiv,
        totalBalancePaymentRequired: totalBalancePaymentRequired,
        totalGCRemaining: totalGCRemaining,
        noMorePaymentReq: false
    });
    next();
});
/**
 * Route to add the GC into the order
 *  - Checks the balance and if that is more than $0, then it applied
 */
server.get('Add', server.middleware.https, function(req, res, next) {
    var result ={};
    var giftCertStatus = 4;
    var statusCodes = {
        0: 'STATUS_PENDING',
        1: 'STATUS_ISSUED',
        2: 'STATUS_PARTIALLY_REDEEMED',
        3: 'STATUS_REDEEMED',
        4: 'APPLIED'
    };

    var PaymentInstrument = require('dw/order/PaymentInstrument');
    var collections = require('*/cartridge/scripts/util/collections');


    var currentBasket = BasketMgr.getCurrentBasket();
    var currency = currentBasket.getCurrencyCode();
    var basketTotalGrossPrice = currentBasket.totalGrossPrice.value;
    

    var giftCertCode = req.querystring.giftCertCode;
    giftCertCode = COHelpers.validateGCNumber(giftCertCode);
    //Validate GC Code
    if(giftCertCode.error) {

        res.json({
            error: true,
            status: statusCodes[1],
            balanceValue: 0,
            balanceCurrency: "NA",
            message: giftCertCode.errorMessage
        });

        return next();
    
    }

    var giftCertVal = new Money(10, currency);

    //Call the GiftCert Balance Hook and get the balance value
    var gcBalanceResponse = HookMgr.callHook(
        'app.payment.giftcard.retrieve_balance',
        'Balance',
        giftCertCode
    );

    /** UNCOMMENT BELOW CODE TO UNAUTH TO REUSE THE CARD --- BEGIN*/
    // var gcUnAuthResponse = HookMgr.callHook(
    //     'app.payment.giftcard.unAuthroize',
    //     'UnAuthorize',
    //     giftCertCode,
    //     new Money(25, currency)
    // );
    /** UNCOMMENT BELOW CODE TO UNAUTH TO REUSE THE CARD --- END*/


    if(gcBalanceResponse.success) {

        if(gcBalanceResponse.giftCard.balanceDue == 0) {
            res.json({
                error: true,
                status: statusCodes[1],
                balanceValue: 0,
                balanceCurrency: "NA",
                message: Resource.msg('msg.error.zero.giftcard', 'giftCertificate', null) 
            });
    
            return next();
        }

        var giftCertBalanceAndCurrency = '';
        var giftCertBalanceValue;
        var giftCertCurrency = '';
        var giftCertMessage = '';
        giftCertVal = new Money(gcBalanceResponse.giftCard.balanceDue, currency);
        giftCertBalanceAndCurrency = "$"+gcBalanceResponse.giftCard.balanceDue;
        giftCertCurrency = currency;
        giftCertBalanceValue = gcBalanceResponse.giftCard.balanceDue;
        giftCertMessage = giftCertCode + " ("+giftCertBalanceAndCurrency+")";
        var paymentInstrument;
        var noMorePaymentReq = false;
        var payInsUUId = "";
        try {
            Transaction.wrap(function () {

                //Recalculate the totals
                basketCalculationHelpers.calculateTotals(currentBasket);
                
                var totalGiftCardAmountAdded = new Money(0.00, currency);
                var totalMorePaymetRequired = new Money(0.00, currency);
                var totalGCsAdded = new Money(0, currency);
                
                //Check if we need to take the whole balance or just partial of the balance for this order
                var gcPaymentInstruments = currentBasket.getGiftCertificatePaymentInstruments();
                collections.forEach(gcPaymentInstruments, function (item) {
                    totalGiftCardAmountAdded = totalGiftCardAmountAdded+item.paymentTransaction.amount;
                });

                //Check if the total order value is greater than the already added GCs
                if(currentBasket.totalGrossPrice.value > totalGiftCardAmountAdded) {
                    //Identify how much more payment is required after subtracting the existing GC payment amounts
                    var balancePaymentRequired = currentBasket.totalGrossPrice.value - totalGiftCardAmountAdded;

                    //Check if the balance covers the remaining payment required, if it does, then update the payment only wiht the remaining needed amount
                    if(giftCertBalanceValue > balancePaymentRequired || giftCertBalanceValue == balancePaymentRequired) {
                        giftCertVal = new Money(balancePaymentRequired, currency);
                        noMorePaymentReq = true;
                        //Remove any payinstruments other than GC is present
                        var allPaymentInstruments = currentBasket.getPaymentInstruments();
                        collections.forEach(allPaymentInstruments, function (item) {
                            if(item.paymentMethod === 'PayPal' ||
                                item.paymentMethod === PaymentInstrument.METHOD_CREDIT_CARD  ) {
                                    currentBasket.removePaymentInstrument(item);
                            }
                            
                        });

                    }else {
                        totalMorePaymetRequired = balancePaymentRequired-giftCertVal;
                        totalMorePaymetRequired = new Money(totalMorePaymetRequired, currency);
                    }
                    totalGCsAdded = totalGiftCardAmountAdded+giftCertVal;
                    totalGCsAdded = new Money(totalGCsAdded, currency);

                } else {// Existing GiftCards already covered the order, so throw the error response
                    res.json({
                        error: true,
                        status: statusCodes[1],
                        balanceValue: 0,
                        balanceCurrency: "NA",
                        message: Resource.msg('msg.error.nomore.payment.required', 'giftCertificate', null) 
                    });

                    return next();
                }
                giftCertMessage = giftCertCode + " ($"+giftCertVal+")";

                /**Create PaymentInstrument */
                 paymentInstrument = currentBasket.createPaymentInstrument(
                    PaymentInstrument.METHOD_GIFT_CERTIFICATE, giftCertVal
                );

                //Update the GC Number to the instrument
                paymentInstrument.setGiftCertificateCode(giftCertCode);

                //Set Payment Transaction
                paymentInstrument.paymentTransaction.setAmount(giftCertVal);
                paymentInstrument.paymentTransaction.setTransactionID(gcBalanceResponse.giftCard.id);
                payInsUUId = paymentInstrument.UUID;
                

                res.json({
                    error: false,
                    status: statusCodes[giftCertStatus],
                    balanceValue: giftCertBalanceValue,
                    balanceCurrency: giftCertCurrency,
                    message: giftCertMessage,
                    gcNumber: giftCertCode,
                    payInstrumentId: payInsUUId,
                    totalGCsAdded: StringUtils.formatMoney(totalGCsAdded),
                    totalMorePaymetRequired: StringUtils.formatMoney(totalMorePaymetRequired),
                    noMorePaymentReq: noMorePaymentReq
                });
                next();

            });
        } catch (e) {
            var na= e;
            var nb=e;
            result.error = true;
        }



        
    }else {
        if(gcBalanceResponse.error) {
            //Error Response from GC Service so throwing the error
            res.json({
                error: true,
                errorMessage: gcBalanceResponse.serverErrors[0]
            });
            return next();

        } else {
            res.json({
                error: true,
                errorMessage: Resource.msg('issue.with.gc.service', 'giftCertificate', null)
            });
            return next();
        }
    }



});


module.exports = server.exports();