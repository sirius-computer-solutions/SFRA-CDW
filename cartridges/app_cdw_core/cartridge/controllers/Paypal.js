'use strict';

var server = require('server');

var page = module.superModule;
server.extend(page);

const HookMgr = require('dw/system/HookMgr'); 
const PaymentMgr = require('dw/order/PaymentMgr'); 
const BasketMgr = require('dw/order/BasketMgr'); 
const Transaction = require('dw/system/Transaction');
var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

const {
    paypalPaymentMethodId
} = require('*/cartridge/config/paypalPreferences');

const {
    encodeString,
    createErrorMsg,
    createErrorLog
} = require('*/cartridge/scripts/paypal/paypalUtils');

const {
    validateProcessor,
    removeNonPaypalPayment,
    validateHandleHook,
    validateGiftCertificateAmount
} = require('*/cartridge/scripts/paypal/middleware');

const {
    updateOrderBillingAddress,
    updateOrderShippingAddress,
    updateBAShippingAddress
} = require('*/cartridge/scripts/paypal/helpers/addressHelper');

const {
    isPurchaseUnitChanged,
    getPurchaseUnit,
    getBARestData,
    hasOnlyGiftCertificates
} = require('*/cartridge/scripts/paypal/helpers/paypalHelper');


server.replace('ReturnFromCart',
    server.middleware.https,
    removeNonPaypalPayment,
    validateProcessor,
    validateHandleHook,
    function (req, res, next) {
        var {
            currentBasket
        } = BasketMgr;
        var paymentFormResult;
        var paymentForm = server.forms.getForm('billing');
        var processorId = PaymentMgr.getPaymentMethod(paypalPaymentMethodId).getPaymentProcessor().ID.toLowerCase();

        if (HookMgr.hasHook('app.payment.form.processor.' + processorId)) {
            paymentFormResult = HookMgr.callHook('app.payment.form.processor.' + processorId,
                'processForm',
                req,
                paymentForm, {}
            );
        } else {
            paymentFormResult = HookMgr.callHook('app.payment.form.processor.default_form_processor', 'processForm');
        }

        if (!paymentFormResult || paymentFormResult.error) {
            res.setStatusCode(500);
            res.print(createErrorMsg());
            return next();
        }

        var processorHandle = HookMgr.callHook('app.payment.processor.' + processorId,
            'Handle',
            currentBasket,
            paymentFormResult.viewData.paymentInformation
        );

        if (!processorHandle || !processorHandle.success) {
            res.setStatusCode(500);
            res.print(createErrorMsg());
            return next();
        }

        var {
            shippingAddress
        } = processorHandle;
        if(!currentBasket.defaultShipment.shippingMethod.custom.storePickupEnabled) {
            if (processorHandle.paymentInstrument.custom.paypalOrderID) {
                if (!hasOnlyGiftCertificates(currentBasket)) {
                    updateOrderShippingAddress(currentBasket, shippingAddress);
                }
            } else {
                updateBAShippingAddress(currentBasket, shippingAddress);
            }
        }


        COHelpers.updateShippingAddressFromShipment(currentBasket);

        res.json();

        return next();
    });


server.replace('GetPurchaseUnit', server.middleware.https, function (req, res, next) {
    var {
        currentBasket
    } = BasketMgr; 
    var cartFlow = req.querystring.isCartFlow === 'true';   
    var purchase_units = [getPurchaseUnit(currentBasket, cartFlow)];

    var basket = BasketMgr.getCurrentBasket();
    var isBopis = basket.defaultShipment.shippingMethod.custom.storePickupEnabled;

    if(cartFlow || isBopis){
        if(basket.getTotalGrossPrice().value==0 && purchase_units[0].amount.value==0){
            var totalAmount = basket.getAdjustedMerchandizeTotalNetPrice().value + basket.getAdjustedShippingTotalNetPrice().value;
            purchase_units[0].amount.value = totalAmount.toFixed(2);
        }
    }

    session.privacy.orderDataHash = encodeString(purchase_units[0]);
    res.json({
        purchase_units: purchase_units
    });
    next();
}); 


server.post('UpdateMobileNumber', function(req,res,next){
    var reqBody = req.body;
    var phoneNumber = reqBody;

    var AccountModel = require('*/cartridge/models/account');
    var OrderModel = require('*/cartridge/models/order');
    var Locale = require('dw/util/Locale');

    var currentBasket = BasketMgr.getCurrentBasket();

    Transaction.wrap(function () {

        var shipping = currentBasket.getDefaultShipment().getShippingAddress();
        if(empty(shipping.phone)){ 
            shipping.setPhone(phoneNumber);  
        }

        // var billing = currentBasket.getBillingAddress();
        // if (empty(billing.phone)) {
        //     billing.setPhone(phoneNumber);
        // }
        COHelpers.copyBillingAddressToBasket(
            currentBasket.defaultShipment.shippingAddress, currentBasket);
        
        var billingAddress = currentBasket.billingAddress;
        if(!empty(phoneNumber) && !empty(billingAddress)){ 
            billingAddress.setPhone(phoneNumber);  
        }

        var currentLocale = Locale.getLocale(req.locale.id);
        var basketModel = new OrderModel(
            currentBasket,
            {
                usingMultiShipping: false,
                shippable: true,
                countryCode: currentLocale.country,
                containerView: 'basket'
            }
        );

        res.json({
            customer: new AccountModel(req.currentCustomer),
            order: basketModel,
            form: server.forms.getForm('shipping')
        });

    });

    // res.json();
    next();
});

server.get('CheckMobileNumber', function(req,res,next){
        
    var hasPhoneNumber = "true";

    var currentBasket = BasketMgr.getCurrentBasket();

    if(currentBasket.paymentInstrument && currentBasket.paymentInstrument.paymentMethod === 'PayPal'){
        var shipping = currentBasket.getDefaultShipment().getShippingAddress();
        var billing = currentBasket.getBillingAddress();

        if(empty(shipping.phone) || empty(billing.phone)){
            hasPhoneNumber = "false";
        }
    }

    res.json({hasPhoneNumber: hasPhoneNumber});
    next();
});

module.exports = server.exports();