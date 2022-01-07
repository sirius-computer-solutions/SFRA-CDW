'use strict';

var page = module.superModule;

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
const Transaction = require('dw/system/Transaction');
var PaymentInstrument = require('dw/order/PaymentInstrument');
var collections = require('*/cartridge/scripts/util/collections');
var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
var validationHelper = require('*/cartridge/scripts/helpers/validationHelper');
var Resource = require('dw/web/Resource');
var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
var MessageConstants = require('*/cartridge/scripts/utils/cdwConstants').getConstants();
var messageHelper = require('~/cartridge/scripts/helpers/messageHelper');

server.extend(page);

/**
 * Handle shipping restrictions
 */
server.prepend('SubmitShipping', function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var ShippingHelper = require('*/cartridge/scripts/checkout/shippingHelpers');

    var currentBasket = BasketMgr.getCurrentBasket();    
    var form = server.forms.getForm('shipping');

    var isBopis = currentBasket.defaultShipment.shippingMethod.custom.storePickupEnabled;
    // only need to perform restriction and form error chesk if not bopis
    if (!isBopis) {
        // verify shipping form data and stop the entire flow if the form is not complete
        var shippingFormErrors = COHelpers.validateShippingForm(form.shippingAddress.addressFields);
        if (Object.keys(shippingFormErrors).length > 0) {
            req.session.privacyCache.set(currentBasket.defaultShipment.UUID, 'invalid');
            res.json({
                form: form,
                fieldErrors: [shippingFormErrors],
                serverErrors: [],
                error: true
            });
            this.emit('route:Complete', req, res);
            return;
        } 

        if (form && form.shippingAddress && form.shippingAddress.addressFields 
            && form.shippingAddress.addressFields.states && form.shippingAddress.addressFields.states.stateCode){
            var stateCode = form.shippingAddress.addressFields.states.stateCode.value;
            if(("AK" === stateCode || "HI" === stateCode ) 
            && (ShippingHelper.isCartContainingAirRestricted(currentBasket) 
                || ShippingHelper.isCartContainingDropShip(currentBasket) 
                || ShippingHelper.isCartContainingFreight(currentBasket))){
                res.json({
                    fieldErrors: [],
                    serverErrors: [Resource.msg('checkout.shipping.restricteditems.error', 'checkout', null)],
                    error: true
                });
            }
            if("CA" === stateCode && ShippingHelper.isCartContainingNonCarbCompliant(currentBasket)){
                res.json({
                    fieldErrors: [],
                    serverErrors: [Resource.msg('checkout.shipping.carbcompliantitems.error', 'checkout', null)],
                    error: true
                });
            }
            if(ShippingHelper.isAddressPOBOx(form.shippingAddress.addressFields.address1.value)){
                res.json({
                    fieldErrors: [],
                    serverErrors: [Resource.msg('checkout.shipping.poboxnotpermitted.error', 'checkout', null)],
                    error: true
                });
            }
            if(!ShippingHelper.isAddressStateAllowed(form.shippingAddress.addressFields.states.stateCode.value)){
                res.json({
                    fieldErrors: [],
                    serverErrors: [Resource.msg('checkout.shipping.statenotpermitted.error', 'checkout', null)],
                    error: true
                });
            }
        }
    }

    return next();
});

/**
 * Handle Ajax shipping form submit
 */
server.append(
    'SubmitShipping',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var BasketMgr = require('dw/order/BasketMgr');
        var viewData = res.getViewData();

        if (viewData.error) {
            res.json(viewData);
            return next();
        }

        var currentBasket = BasketMgr.getCurrentBasket();
        res.viewData.enableB2BCreditPayment = false;

        /** Validate the OrderEmail and if not present send the error back -- BEGIN */
        var form = server.forms.getForm('shipping');
        var formFieldErrors = [];
        var contactInfoFormErrors = COHelpers.validateFields(form.contactInfoFields);
        if(contactInfoFormErrors.dwfrm_shipping_contactInfoFields_email && currentBasket.defaultShipment.shippingMethod.custom.storePickupEnabled) {
            //Removing as BOPIS will NOT have the email
            delete contactInfoFormErrors.dwfrm_shipping_contactInfoFields_email;
        }
        if (Object.keys(contactInfoFormErrors).length) {
            formFieldErrors.push(contactInfoFormErrors);
            res.json({
                form: form,
                fieldErrors: formFieldErrors,
                serverErrors: [],
                error: true
            });

            return next();
            
        } else {
            // form validation
            if (!empty(form.contactInfoFields.email.htmlValue) && !validationHelper.valdateEmailId(form.contactInfoFields.email.htmlValue.toLowerCase())) {
                contactInfoFormErrors[form.contactInfoFields.email.htmlName] =  Resource.msg('error.message.invalid.email', 'forms', null);
                formFieldErrors.push(contactInfoFormErrors);
                res.json({
                    form: form,
                    fieldErrors: formFieldErrors,
                    serverErrors: [],
                    error: true
                });

                return next();
            }
            var email = form.contactInfoFields.email.value;
            Transaction.wrap(function () {
                if(!empty(email)){
                    currentBasket.setCustomerEmail(email);
                }
                
                //Send Newsletter Entry message now
                try{
                    messageHelper.handleNewsletterSignup(req.form.subscribe,
                    form.shippingAddress.addressFields.postalCode.value,form.contactInfoFields.email.value);
                }catch(e)
                { 
                      //Subscription already exist
                }
                /** Persist Company Name if that is provided in the form */
                if(form.shippingAddress.addressFields.companyName && form.shippingAddress.addressFields.companyName.htmlValue) {
                    viewData.address.companyName=form.shippingAddress.addressFields.companyName.htmlValue;
                }
                //Copy only if the ship method is NOT BOPIS
                // if(!currentBasket.defaultShipment.shippingMethod.custom.storePickupEnabled) {
                    COHelpers.copyBillingAddressToBasket(
                        viewData.address, currentBasket);
                // }
            });

        }        


        


        /** Validate the OrderEmail and if not present send the error back -- END */

        var paymentInstruments = currentBasket.getPaymentInstruments();
        // Now remove all the existing PaymentInstruments
        Transaction.wrap(function () {
            collections.forEach(paymentInstruments, function (item) {
                if(item.paymentMethod === PaymentInstrument.METHOD_GIFT_CERTIFICATE ||
                    item.paymentMethod === PaymentInstrument.METHOD_CREDIT_CARD  ) {
                        currentBasket.removePaymentInstrument(item);
                }
                
            });
        });

        //Condition to enable disable the B2B Store Credit payment option
        if(customer.registered && customer.profile && customer.profile.custom && customer.profile.custom.b2bUser && customer.profile.custom.b2bAccountNumber 
            && customer.profile.custom.b2bPayByTerms &&  customer.profile.custom.b2bCreditLimit && customer.profile.custom.b2bWebEnabled) {

                var balanceDue = 0;
                var creditLimit = 0;

                if(customer.profile.custom.b2bCreditLimit) {
                    creditLimit = customer.profile.custom.b2bCreditLimit;
                }
                
                if(customer.profile.custom.b2bBalanceDue) {
                    balanceDue = customer.profile.custom.b2bBalanceDue;
                }

                var balanceCreditLimit = creditLimit - Math.abs(balanceDue);

                if(balanceCreditLimit > currentBasket.totalGrossPrice) {
                    res.viewData.enableB2BCreditPayment = true;
                }
        }
        
        return next();
    }
);


/**
 * CheckoutShippingServices-UpdateShippingMethodsList : The CheckoutShippingServices-UpdateShippingMethodsList endpoint gets hit once a shopper has entered certain address infromation and gets the applicable shipping methods based on the shopper's supplied shipping address infromation
 * @name Base/CheckoutShippingServices-UpdateShippingMethodsList
 * @function
 * @memberof CheckoutShippingServices
 * @param {middleware} - server.middleware.https
 * @param {querystringparameter} - shipmentUUID - the universally unique identifier of the shipment
 * @param {httpparameter} - firstName - shipping address input field, shopper's shipping first name
 * @param {httpparameter} - lastName - shipping address input field, shopper's last name
 * @param {httpparameter} - address1 - shipping address input field, address line 1
 * @param {httpparameter} - address2 - shipping address nput field address line 2
 * @param {httpparameter} - city - shipping address input field, city
 * @param {httpparameter} - postalCode -  shipping address input field, postal code (or zipcode)
 * @param {httpparameter} - stateCode - shipping address input field, state code (Not all locales have state code)
 * @param {httpparameter} - countryCode -  shipping address input field, country
 * @param {httpparameter} - phone - shipping address input field, shopper's phone number
 * @param {httpparameter} - shipmentUUID - The universally unique identifier of the shipment
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
 server.append('UpdateShippingMethodsList', server.middleware.https, function (req, res, next) {

    var BasketMgr = require('dw/order/BasketMgr');
    var currentBasket = BasketMgr.getCurrentBasket();    

    var contactEmail = req.form.contactEmail;

    if(!empty(contactEmail)  && validationHelper.valdateEmailId(contactEmail)) {
        Transaction.wrap(function () {
            if(!empty(contactEmail)){
                currentBasket.setCustomerEmail(contactEmail);
            }
        });
    }

    next();
 });


module.exports = server.exports();
