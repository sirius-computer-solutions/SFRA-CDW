'use strict';

var server = require('server');
server.extend(module.superModule);
var collections = require('*/cartridge/scripts/util/collections');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
const Transaction = require('dw/system/Transaction');
var PaymentInstrument = require('dw/order/PaymentInstrument');
var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
var Resource = require('dw/web/Resource');

// Main entry point for Checkout
/**
 * Checkout-Begin : The Checkout-Begin endpoint will render the checkout shipping page for both guest shopper and returning shopper
 * @name app_cdw_core/Checkout-Begin
 * @function
 * @memberof Checkout
 * @param {middleware} - server.middleware.https
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - csrfProtection.generateToken
 * @param {querystringparameter} - stage - a flag indicates the checkout stage
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */

server.append(
    'Begin',
    server.middleware.https,
    consentTracking.consent,
    csrfProtection.generateToken,
    function (req, res, next) {
        var URLUtils = require('dw/web/URLUtils');
        var BasketMgr = require('dw/order/BasketMgr');
        var currentBasket = BasketMgr.getCurrentBasket();
        var viewData = res.getViewData();
        var customer = req.currentCustomer.raw;

        var paymentInstruments = currentBasket.getPaymentInstruments();

        // Now remove all the existing PaymentInstruments
        Transaction.wrap(function () {
            collections.forEach(paymentInstruments, function (item) {
                if (item.paymentMethod === PaymentInstrument.METHOD_GIFT_CERTIFICATE ||
                    item.paymentMethod === PaymentInstrument.METHOD_CREDIT_CARD) {
                    currentBasket.removePaymentInstrument(item);
                }

            });

            //Check if the order is B2B Order and B2B AccountNumber Present, add it to the basket
            if (customer.registered && customer.profile && customer.profile.custom && customer.profile.custom.b2bUser && customer.profile.custom.b2bAccountNumber) {
                currentBasket.custom.b2bAccountNumber = customer.profile.custom.b2bAccountNumber;
            }
            if (viewData.order) {
                var orderBilling = viewData.order.billing;
                if (!empty(orderBilling) && orderBilling.payment.selectedPaymentInstruments
                    && orderBilling.payment.selectedPaymentInstruments.length > 0) {
                    delete orderBilling.payment.selectedPaymentInstruments;
                }
            }
        });


        if (currentBasket.paymentInstrument && currentBasket.paymentInstrument.paymentMethod === 'PayPal') { //If payment PayPal selected from cart or minicart

            if (viewData.error) {
                viewData.currentStage = "shipping";
            } else {
                COHelpers.updateShippingAddressFromShipment(currentBasket);
                viewData.currentStage = "payment";
                viewData.actionUrl = URLUtils.url('Account-Login', 'rurl', 2);
            }
        } else if (!customer.registered) { // If NO PayPal selected and guest
            viewData.currentStage = "signin";
            viewData.actionUrl = URLUtils.url('Account-Login', 'rurl', 2);
        }

        /**
         * Meta data changes for checkout page - Start
         */
        var computedMetaData = {
            title: Resource.msg('checkout.page.title', 'checkout', null),
            description: Resource.msg('checkout.page.description', 'checkout', null),
            keywords: Resource.msg('checkout.page.keywords', 'checkout', null),
            pageMetaTags: []
        };
    
        var pageGroup = {name: Resource.msg('checkout.page.pageGroup.name', 'checkout', null),
                        ID: Resource.msg('checkout.page.pageGroup.name', 'checkout', null),
                        content: Resource.msg('checkout.page.pageGroup.value', 'checkout', null)};
        var robots = {name: Resource.msg('checkout.page.robots.name', 'checkout', null),
                        ID: Resource.msg('checkout.page.robots.name', 'checkout', null),
                        content: Resource.msg('checkout.page.robots.value', 'checkout', null)};                    
        computedMetaData.pageMetaTags.push(pageGroup);
        computedMetaData.pageMetaTags.push(robots);

        res.setViewData({
            CurrentPageMetaData: computedMetaData
        });

        next();
    });

module.exports = server.exports();
