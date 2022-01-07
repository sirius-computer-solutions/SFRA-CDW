'use strict';

/**
 * @namespace CheckoutServices
 */

var server = require('server');
server.extend(module.superModule);
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var PaymentInstrument = require('dw/order/PaymentInstrument');
var collections = require('*/cartridge/scripts/util/collections');
var PayPalPaymentHelper = require('*/cartridge/scripts/helpers/paymentHelper');
var BasketMgr = require('dw/order/BasketMgr');
var MessageConstants = require('*/cartridge/scripts/utils/acmeConstants').getConstants();
var validationHelper = require('*/cartridge/scripts/helpers/validationHelper');
var Logger = require('dw/system/Logger');
var logger = Logger.getLogger("Checkout","checkout");
/**
 *  Handle Ajax payment (and billing) form submit
 */
/**
 * CheckoutServices-SubmitPayment : The CheckoutServices-SubmitPayment endpoint will submit the payment information and render the checkout place order page allowing the shopper to confirm and place the order
 * @name Base/CheckoutServices-SubmitPayment
 * @function
 * @memberof CheckoutServices
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {httpparameter} - addressSelector - For Guest shopper: A shipment UUID that contains address that matches the selected address. For returning shopper: ab_<address-name-from-address-book>" of the selected address. For both type of shoppers:  "new" if a brand new address is entered
 * @param {httpparameter} - dwfrm_billing_addressFields_firstName - Input field for the shoppers's first name
 * @param {httpparameter} - dwfrm_billing_addressFields_lastName - Input field for the shoppers's last name
 * @param {httpparameter} - dwfrm_billing_addressFields_address1 - Input field for the shoppers's address 1 - street
 * @param {httpparameter} - dwfrm_billing_addressFields_address2 - Input field for the shoppers's address 2 - street
 * @param {httpparameter} - dwfrm_billing_addressFields_country - Input field for the shoppers's address - country
 * @param {httpparameter} - dwfrm_billing_addressFields_states_stateCode - Input field for the shoppers's address - state code
 * @param {httpparameter} - dwfrm_billing_addressFields_city - Input field for the shoppers's address - city
 * @param {httpparameter} - dwfrm_billing_addressFields_postalCode - Input field for the shoppers's address - postal code
 * @param {httpparameter} - csrf_token - hidden input field CSRF token
 * @param {httpparameter} - localizedNewAddressTitle - label for new address
 * @param {httpparameter} - dwfrm_billing_contactInfoFields_email - Input field for the shopper's email address
 * @param {httpparameter} - dwfrm_billing_contactInfoFields_phone - Input field for the shopper's phone number
 * @param {httpparameter} - dwfrm_billing_paymentMethod - Input field for the shopper's payment method
 * @param {httpparameter} - dwfrm_billing_creditCardFields_cardType - Input field for the shopper's credit card type
 * @param {httpparameter} - dwfrm_billing_creditCardFields_cardNumber - Input field for the shopper's credit card number
 * @param {httpparameter} - dwfrm_billing_creditCardFields_expirationMonth - Input field for the shopper's credit card expiration month
 * @param {httpparameter} - dwfrm_billing_creditCardFields_expirationYear - Input field for the shopper's credit card expiration year
 * @param {httpparameter} - dwfrm_billing_creditCardFields_securityCode - Input field for the shopper's credit card security code
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.replace(
    'SubmitPayment',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var PaymentManager = require('dw/order/PaymentMgr');
        var HookManager = require('dw/system/HookMgr');
        var Resource = require('dw/web/Resource');
        var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

        var viewData = {};
        var paymentForm = server.forms.getForm('billing');
        

        // verify billing form data
        var billingFormErrors = COHelpers.validateBillingForm(paymentForm.addressFields);
        var contactInfoFormErrors = COHelpers.validateFields(paymentForm.contactInfoFields);

        // form validation
        if (!empty(paymentForm.contactInfoFields.email.htmlValue) && !validationHelper.valdateEmailId(paymentForm.contactInfoFields.email.htmlValue.toLowerCase())) {
            contactInfoFormErrors[paymentForm.contactInfoFields.email.htmlName] =  Resource.msg('error.message.invalid.email', 'forms', null);
        }

        //Check if its a B2B User and PO Required then throw the error if webrefernce number is empty
        if(customer.registered && customer.profile && customer.profile.custom && customer.profile.custom.b2bUser && customer.profile.custom.b2bAccountNumber 
            && customer.profile.custom.b2bWebEnabled && customer.profile.custom.b2bPORequired && empty(req.form.webReferenceNumber)) {
                contactInfoFormErrors["webReferenceNumber"] = Resource.msg('error.missing.po.number', 'storeCredit', null);
        }    
        // Check if there is webreference number present and its valid
        if (!empty(req.form.webReferenceNumber) && !validationHelper.validWebReferenceNumber(req.form.webReferenceNumber)) {
            contactInfoFormErrors["webReferenceNumber"] =  Resource.msg('error.invalid.po.number', 'storeCredit', null);
        }



        var formFieldErrors = [];
        if (Object.keys(billingFormErrors).length) {
            formFieldErrors.push(billingFormErrors);
        } else {
            viewData.address = {
                firstName: { value: paymentForm.addressFields.firstName.value },
                lastName: { value: paymentForm.addressFields.lastName.value },
                address1: { value: paymentForm.addressFields.address1.value },
                address2: { value: paymentForm.addressFields.address2.value },
                companyName: { value: paymentForm.addressFields.companyName.value },
                city: { value: paymentForm.addressFields.city.value },
                postalCode: { value: paymentForm.addressFields.postalCode.value },
                countryCode: { value: paymentForm.addressFields.country.value },
                phone: { value: paymentForm.addressFields.phone.value }
                
            };

            if (Object.prototype.hasOwnProperty.call(paymentForm.addressFields, 'states')) {
                viewData.address.stateCode = { value: paymentForm.addressFields.states.stateCode.value };
            }
        }

        if (Object.keys(contactInfoFormErrors).length) {
            formFieldErrors.push(contactInfoFormErrors);
        } else {
            viewData.email = {
                value: paymentForm.contactInfoFields.email.value
            };

            // if(req.form.subscribe){
            //     viewData.subscribe = {
            //         value: req.form.subscribe
            //     };
            // }
            viewData.phone = { value: paymentForm.contactInfoFields.phone.value };
        }

        var paymentMethodIdValue = paymentForm.paymentMethod.value;
        if (!PaymentManager.getPaymentMethod(paymentMethodIdValue).paymentProcessor) {
            throw new Error(Resource.msg(
                'error.payment.processor.missing',
                'checkout',
                null
            ));
        }

        var paymentProcessor = PaymentManager.getPaymentMethod(paymentMethodIdValue).getPaymentProcessor();

        logger.info("paymentProcessor::::"+paymentProcessor.ID);
        logger.debug("debug::paymentProcessor::::"+paymentProcessor.ID);

        var paymentFormResult;
        if (HookManager.hasHook('app.payment.form.processor.' + paymentProcessor.ID.toLowerCase())) {
            paymentFormResult = HookManager.callHook('app.payment.form.processor.' + paymentProcessor.ID.toLowerCase(),
                'processForm',
                req,
                paymentForm,
                viewData
            );
        } else {
            paymentFormResult = HookManager.callHook('app.payment.form.processor.default_form_processor', 'processForm');
        }

        if (paymentFormResult.error && paymentFormResult.fieldErrors) {
            formFieldErrors.push(paymentFormResult.fieldErrors);
        }

        if (formFieldErrors.length || paymentFormResult.serverErrors) {
            // respond with form data and errors
            res.json({
                form: paymentForm,
                fieldErrors: formFieldErrors,
                serverErrors: paymentFormResult.serverErrors ? paymentFormResult.serverErrors : [],
                error: true
            });
            return next();
        }

        res.setViewData(paymentFormResult.viewData);

        this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow

            var HookMgr = require('dw/system/HookMgr');
            var PaymentMgr = require('dw/order/PaymentMgr');
            var Transaction = require('dw/system/Transaction');
            var AccountModel = require('*/cartridge/models/account');
            var OrderModel = require('*/cartridge/models/order');
            var URLUtils = require('dw/web/URLUtils');
            var Locale = require('dw/util/Locale');
            var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
            var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
            var validationHelpers = require('*/cartridge/scripts/helpers/basketValidationHelpers');

            var currentBasket = BasketMgr.getCurrentBasket();

            var billingData = res.getViewData();

            if (!currentBasket) {
                delete billingData.paymentInformation;

                res.json({
                    error: true,
                    cartError: true,
                    fieldErrors: [],
                    serverErrors: [],
                    redirectUrl: URLUtils.url('Cart-Show').toString()
                });
                return;
            }

            var validatedProducts = validationHelpers.validateProducts(currentBasket);
            if (validatedProducts.error) {
                delete billingData.paymentInformation;

                res.json({
                    error: true,
                    cartError: true,
                    fieldErrors: [],
                    serverErrors: [],
                    redirectUrl: URLUtils.url('Cart-Show').toString()
                });
                return;
            }
            
            //do shipping restrictions check and update response accordingly
            var ShippingHelper = require('*/cartridge/scripts/checkout/shippingHelpers');
            var restrictions = ShippingHelper.validateShippingRestrictions(currentBasket);
            if(restrictions && restrictions.length > 0){
                res.json({
                    fieldErrors: [],
                    serverErrors: restrictions,
                    error: true
                });
                return;
            }


            var billingAddress = currentBasket.billingAddress;
            var billingForm = server.forms.getForm('billing');
            var paymentMethodID = billingData.paymentMethod.value;
            var result;

            var shipping = currentBasket.getDefaultShipment().getShippingAddress();

            billingForm.creditCardFields.cardNumber.htmlValue = '';
            billingForm.creditCardFields.securityCode.htmlValue = '';

            Transaction.wrap(function () {

                //ACME-1334
                if(empty(shipping.phone)){ 
                    shipping.setPhone(billingData.phone.value);  
                }

                if (!billingAddress) {
                    billingAddress = currentBasket.createBillingAddress();
                }

                billingAddress.setFirstName(billingData.address.firstName.value);
                billingAddress.setLastName(billingData.address.lastName.value);
                billingAddress.setAddress1(billingData.address.address1.value);
                billingAddress.setAddress2(billingData.address.address2.value);
                billingAddress.setCompanyName(billingData.address.companyName.value);
                billingAddress.setCity(billingData.address.city.value);
                billingAddress.setPostalCode(billingData.address.postalCode.value);
                if (Object.prototype.hasOwnProperty.call(billingData.address, 'stateCode')) {
                    billingAddress.setStateCode(billingData.address.stateCode.value);
                }
                billingAddress.setCountryCode(billingData.address.countryCode.value);
                billingAddress.setPhone(billingData.phone.value);
                currentBasket.setCustomerEmail(billingData.email.value);


                // //Subscribe to newsletter if its there
                // if(billingData.subscribe) {
                //     var nlDetails = {
                //         "messageType": MessageConstants.NewsletterMessageType,
                //         "email": billingData.email.value, 
                //         "zipCode": billingData.address.postalCode.value
                //     };
            
                //     //Sending the message for Newsletter
                //     hooksHelper('app.newsletter.subscribe', 'signup', nlDetails, function () {});    
                // }
            });

            // if there is no selected payment option and balance is greater than zero
            if (!paymentMethodID && currentBasket.totalGrossPrice.value > 0) {
                var noPaymentMethod = {};

                noPaymentMethod[billingData.paymentMethod.htmlName] =
                    Resource.msg('error.no.selected.payment.method', 'payment', null);

                delete billingData.paymentInformation;

                res.json({
                    form: billingForm,
                    fieldErrors: [noPaymentMethod],
                    serverErrors: [],
                    error: true
                });
                return;
            }

            var processor = PaymentMgr.getPaymentMethod(paymentMethodID).getPaymentProcessor();

            // check to make sure there is a payment processor
            if (!processor) {
                throw new Error(Resource.msg(
                    'error.payment.processor.missing',
                    'checkout',
                    null
                ));
            }

            /** Condition to handle the PayPal payment coming from the cart BEGINS */
            var ignoreHandlePayment = false;
            if(paymentMethodID == 'PayPal') {
                var paymentInstruments = currentBasket.paymentInstruments;
                collections.forEach(paymentInstruments, function (item) {
                    if ("PayPal".equals(item.paymentMethod)) {
                        ignoreHandlePayment = true;
                    }
                });
            }
            /** Condition to handle the PayPal payment coming from the cart ENDS */
            //Since we already calculated and updated for GC only orders through GiftCertificte-Add we dont need to do this again here.
            if(paymentMethodID != PaymentInstrument.METHOD_GIFT_CERTIFICATE && !ignoreHandlePayment) {
                if (HookMgr.hasHook('app.payment.processor.' + processor.ID.toLowerCase())) {
                    result = HookMgr.callHook('app.payment.processor.' + processor.ID.toLowerCase(),
                        'Handle',
                        currentBasket,
                        billingData.paymentInformation,
                        paymentMethodID,
                        req
                    );
                } else {
                    result = HookMgr.callHook('app.payment.processor.default', 'Handle');
                }
    
                // need to invalidate credit card fields
                if (result.error) {
                    delete billingData.paymentInformation;
    
                    res.json({
                        form: billingForm,
                        fieldErrors: result.fieldErrors,
                        serverErrors: result.serverErrors,
                        error: true
                    });
                    return;
                }

                if (HookMgr.hasHook('app.payment.form.processor.' + processor.ID.toLowerCase())) {
                    HookMgr.callHook('app.payment.form.processor.' + processor.ID.toLowerCase(),
                        'savePaymentInformation',
                        req,
                        currentBasket,
                        billingData
                    );
                } else {
                    HookMgr.callHook('app.payment.form.processor.default', 'savePaymentInformation');
                }                
            } else { // Since this is Gift Card only order, we have to check if the total gift card covers the order

            }




            // Calculate the basket
            Transaction.wrap(function () {
                basketCalculationHelpers.calculateTotals(currentBasket);

                //Persist the WebReference Number if that is present
                var webReferenceNumber;
                if(billingData.paymentInformation.webReferenceNumber || req.form.webReferenceNumber) {
                    if(empty(webReferenceNumber) && !empty(req.form.webReferenceNumber)){
                        webReferenceNumber = req.form.webReferenceNumber;
                    } else if (!empty(billingData.paymentInformation) && billingData.paymentInformation.webReferenceNumber) {
                        webReferenceNumber = billingData.paymentInformation.webReferenceNumber.value;
                    }
                    

                    collections.forEach(currentBasket.paymentInstruments, function (item) {
                        item.custom.webReferenceNumber =webReferenceNumber;
                    });                    
                    
                }

            });

            // Re-calculate the payments.
            var calculatedPaymentTransaction = COHelpers.calculatePaymentTransaction(
                currentBasket
            );

            if (calculatedPaymentTransaction.error) {
                res.json({
                    form: paymentForm,
                    fieldErrors: [],
                    serverErrors: [calculatedPaymentTransaction.serverError],
                    error: true
                });
                return;
            }

            var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
            if (usingMultiShipping === true && currentBasket.shipments.length < 2) {
                req.session.privacyCache.set('usingMultiShipping', false);
                usingMultiShipping = false;
            }

            hooksHelper('app.customer.subscription', 'subscribeTo', [paymentForm.subscribe.checked, paymentForm.contactInfoFields.email.htmlValue], function () {});

            var currentLocale = Locale.getLocale(req.locale.id);

            var basketModel = new OrderModel(
                currentBasket,
                { usingMultiShipping: usingMultiShipping, countryCode: currentLocale.country, containerView: 'basket' }
            );

            var accountModel = new AccountModel(req.currentCustomer);
            var renderedStoredPaymentInstrument = COHelpers.getRenderedPaymentInstruments(
                req,
                accountModel
            );

            delete billingData.paymentInformation;

            res.json({
                renderedPaymentInstruments: renderedStoredPaymentInstrument,
                customer: accountModel,
                order: basketModel,
                form: billingForm,
                error: false
            });

            //Since we replaced this method PayPal logic needs to be handled here
            if(paymentMethodID == 'PayPal') {
                PayPalPaymentHelper.payPalSubmitPayment(res, server, this, req);
            }
        });

        return next();
    }
);

/**
 * CheckoutServices-PlaceOrder : The CheckoutServices-PlaceOrder endpoint places the order
 * @name Base/CheckoutServices-PlaceOrder
 * @function
 * @memberof CheckoutServices
 * @param {middleware} - server.middleware.https
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
 server.replace('PlaceOrder', server.middleware.https, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var OrderMgr = require('dw/order/OrderMgr');
    var Resource = require('dw/web/Resource');
    var Transaction = require('dw/system/Transaction');
    var URLUtils = require('dw/web/URLUtils');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var validationHelpers = require('*/cartridge/scripts/helpers/basketValidationHelpers');
    var addressHelpers = require('*/cartridge/scripts/helpers/addressHelpers');

    var currentBasket = BasketMgr.getCurrentBasket();

    if (!currentBasket) {
        res.json({
            error: true,
            cartError: true,
            fieldErrors: [],
            serverErrors: [],
            redirectUrl: URLUtils.url('Cart-Show').toString()
        });
        return next();
    }

    var validatedProducts = validationHelpers.validateProducts(currentBasket);
    if (validatedProducts.error) {
        res.json({
            error: true,
            cartError: true,
            fieldErrors: [],
            serverErrors: [],
            redirectUrl: URLUtils.url('Cart-Show').toString()
        });
        return next();
    }

    if (req.session.privacyCache.get('fraudDetectionStatus')) {
        res.json({
            error: true,
            cartError: true,
            redirectUrl: URLUtils.url('Error-ErrorCode', 'err', '01').toString(),
            errorMessage: Resource.msg('error.technical', 'checkout', null)
        });

        return next();
    }

    var validationOrderStatus = hooksHelper('app.validate.order', 'validateOrder', currentBasket, require('*/cartridge/scripts/hooks/validateOrder').validateOrder);
    if (validationOrderStatus.error) {
        res.json({
            error: true,
            errorMessage: validationOrderStatus.message
        });
        return next();
    }

    // Check to make sure there is a shipping address
    if (currentBasket.defaultShipment.shippingAddress === null) {
        res.json({
            error: true,
            errorStage: {
                stage: 'shipping',
                step: 'address'
            },
            errorMessage: Resource.msg('error.no.shipping.address', 'checkout', null)
        });
        return next();
    }

    // Check to make sure billing address exists
    if (!currentBasket.billingAddress) {
        res.json({
            error: true,
            errorStage: {
                stage: 'payment',
                step: 'billingAddress'
            },
            errorMessage: Resource.msg('error.no.billing.address', 'checkout', null)
        });
        return next();
    }

    // Calculate the basket
    Transaction.wrap(function () {
        basketCalculationHelpers.calculateTotals(currentBasket);
    });

    // Re-validates existing payment instruments
    var validPayment = COHelpers.validatePayment(req, currentBasket);
    if (validPayment.error) {
        res.json({
            error: true,
            errorStage: {
                stage: 'payment',
                step: 'paymentInstrument'
            },
            errorMessage: Resource.msg('error.payment.not.valid', 'checkout', null)
        });
        return next();
    }

    // Re-calculate the payments.
    var calculatedPaymentTransactionTotal = COHelpers.calculatePaymentTransaction(currentBasket);
    if (calculatedPaymentTransactionTotal.error) {
        res.json({
            error: true,
            errorMessage: Resource.msg('error.technical', 'checkout', null)
        });
        return next();
    }

    // fetch the availabilty of each lineItem in the basket before the order is created
    var lineItemsAvailabilityMap = COHelpers.getOrderItemsAvailability(currentBasket,req.locale.id);

    // Creates a new order.
    var order = COHelpers.createOrder(currentBasket);
    if (!order) {
        res.json({
            error: true,
            errorMessage: Resource.msg('error.technical', 'checkout', null)
        });
        return next();
    }

    // Handles payment authorization
    var handlePaymentResult = COHelpers.handlePayments(order, order.orderNo);

    // Handle custom processing post authorization
    var options = {
        req: req,
        res: res
    };
    var postAuthCustomizations = hooksHelper('app.post.auth', 'postAuthorization', handlePaymentResult, order, options, require('*/cartridge/scripts/hooks/postAuthorizationHandling').postAuthorization);
    if (postAuthCustomizations && Object.prototype.hasOwnProperty.call(postAuthCustomizations, 'error')) {
        res.json(postAuthCustomizations);
        return next();
    }

    if (handlePaymentResult.error) {
        res.json({
            error: true,
            errorMessage: Resource.msg('error.technical', 'checkout', null)
        });
        return next();
    }

    var fraudDetectionStatus = hooksHelper('app.fraud.detection', 'fraudDetection', currentBasket, require('*/cartridge/scripts/hooks/fraudDetection').fraudDetection);
    if (fraudDetectionStatus.status === 'fail') {
        Transaction.wrap(function () { OrderMgr.failOrder(order, true); });

        // fraud detection failed
        req.session.privacyCache.set('fraudDetectionStatus', true);

        res.json({
            error: true,
            cartError: true,
            redirectUrl: URLUtils.url('Error-ErrorCode', 'err', fraudDetectionStatus.errorCode).toString(),
            errorMessage: Resource.msg('error.technical', 'checkout', null)
        });

        return next();
    }

    // Places the order
    var placeOrderResult = COHelpers.placeOrder(order, fraudDetectionStatus);
    if (placeOrderResult.error) {
        res.json({
            error: true,
            errorMessage: Resource.msg('error.technical', 'checkout', null)
        });
        return next();
    }

    if (req.currentCustomer.addressBook) {
        // save all used shipping addresses to address book of the logged in customer
        var allAddresses = addressHelpers.gatherShippingAddresses(order);
        allAddresses.forEach(function (address) {
            if (!addressHelpers.checkIfAddressStored(address, req.currentCustomer.addressBook.addresses)) {
                addressHelpers.saveAddress(address, req.currentCustomer, addressHelpers.generateAddressName(address));
            }
        });
    }

    if (order.getCustomerEmail()) {
        COHelpers.sendConfirmationEmail(order,lineItemsAvailabilityMap,req.locale.id);
    }

    
    // Reset usingMultiShip after successful Order placement
    req.session.privacyCache.set('usingMultiShipping', false);

    // TODO: Exposing a direct route to an Order, without at least encoding the orderID
    //  is a serious PII violation.  It enables looking up every customers orders, one at a
    //  time.
    res.json({
        error: false,
        orderID: order.orderNo,
        orderToken: order.orderToken,
        continueUrl: URLUtils.url('Order-Confirm').toString()
    });

    return next();
});

/**
 * CheckoutServices-UpdateBillingAsShipping : 
 * @name Base/CheckoutServices-UpdateBillingAsShipping
 * @memberof CheckoutServices
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
 server.post('UpdateBillingAsShipping', server.middleware.https,   
        function (req, res, next) {
        logger.debug("UpdateBillingAsShipping is called");
        var BasketMgr = require('dw/order/BasketMgr');
        var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
        var AccountModel = require('*/cartridge/models/account');
        var OrderModel = require('*/cartridge/models/order');
        var URLUtils = require('dw/web/URLUtils');
        var Transaction = require('dw/system/Transaction');
        var Locale = require('dw/util/Locale');
    
        logger.debug("UpdateBillingAsShipping is called:::After Locale");
        var currentBasket = BasketMgr.getCurrentBasket();

        logger.debug("UpdateBillingAsShipping is called:::After CurrentBasket");
        if (!currentBasket) {
            res.json({
                error: true,
                cartError: true,
                fieldErrors: [],
                serverErrors: [],
                redirectUrl: URLUtils.url('Cart-Show').toString()
            });
            return next();
        }  

        Transaction.wrap(function () {       
            logger.debug("UpdateBillingAsShipping is called:::Before Copy Address");     
            COHelpers.copyBillingAddressToBasket(
                currentBasket.defaultShipment.shippingAddress, currentBasket);
                logger.debug("UpdateBillingAsShipping is called:::After Copy Address::"+JSON.stringify(currentBasket.defaultShipment.shippingAddress));                     
        });

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
        logger.debug("UpdateBillingAsShipping is called:::Before Return");    
        res.json({
            customer: new AccountModel(req.currentCustomer),
            order: basketModel,
            form: server.forms.getForm('shipping')
        });        
        logger.debug("UpdateBillingAsShipping is called:::Before Next");    
        next();
 
});


/**
 * CheckoutServices-PlaceOrder : The CheckoutServices-PlaceOrder endpoint places the order
 * @name Base/CheckoutServices-PlaceOrder
 * @function
 * @memberof CheckoutServices
 * @param {middleware} - server.middleware.https
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
 server.append('PlaceOrder', server.middleware.https, function (req, res, next) {

    var viewData = res.viewData;

    if(viewData.error) {
        // Condition to handle the unAuthorize of Gift Cards
        var BasketMgr = require('dw/order/BasketMgr');
        var currentBasket = BasketMgr.getCurrentBasket();
        var paymentInstruments = currentBasket.getGiftCertificatePaymentInstruments();

        var HookMgr = require('dw/system/HookMgr');

        collections.forEach(paymentInstruments, function (item) {
            var gcUnAuthResponse = HookMgr.callHook(
                'app.payment.giftcard.unAuthroize',
                'UnAuthorize',
                // 'app.payment.giftcard.retrieve_balance',
                // 'Balance',                  
                item.giftCertificateCode,
                item.paymentTransaction.amount
            );

            if(gcUnAuthResponse.error) {
                //Just Log Error Here.
                logger.error("Error UnAuthorizing Gift Card::"+item.paymentTransaction.transactionID);
            }
        });
    }

    next();
    
 });

module.exports = server.exports();
