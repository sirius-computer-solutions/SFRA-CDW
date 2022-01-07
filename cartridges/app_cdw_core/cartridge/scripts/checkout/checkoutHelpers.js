'use strict';

var server = require('server');

var collections = require('*/cartridge/scripts/util/collections');

var BasketMgr = require('dw/order/BasketMgr');
var HookMgr = require('dw/system/HookMgr');
var OrderMgr = require('dw/order/OrderMgr');
var PaymentInstrument = require('dw/order/PaymentInstrument');
var PaymentMgr = require('dw/order/PaymentMgr');
var Order = require('dw/order/Order');
var Status = require('dw/system/Status');
var Resource = require('dw/web/Resource');
var Site = require('dw/system/Site');
var Transaction = require('dw/system/Transaction');
var GiftCertificateMgr = require('dw/order/GiftCertificateMgr');
var GiftCertificate = require('dw/order/GiftCertificate');



var AddressModel = require('*/cartridge/models/address');
var formErrors = require('*/cartridge/scripts/formErrors');

var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');
var ShippingHelper = require('*/cartridge/scripts/checkout/shippingHelpers');

var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');

// static functions needed for Checkout Controller logic

/**
 * Prepares the Shipping form
 * @returns {Object} processed Shipping form object
 */
function prepareShippingForm() {
    var shippingForm = server.forms.getForm('shipping');

    shippingForm.clear();

    return shippingForm;
}

/**
 * Prepares the Billing form
 * @returns {Object} processed Billing form object
 */
function prepareBillingForm() {
    var billingForm = server.forms.getForm('billing');
    billingForm.clear();

    return billingForm;
}

/**
 * Validate billing form
 * @param {Object} form - the form object with pre-validated form fields
 * @returns {Object} the names of the invalid form fields
 */
function validateFields(form) {
    return formErrors.getFormErrors(form);
}

/**
 * Validate shipping form fields
 * @param {Object} form - the form object with pre-validated form fields
 * @param {Array} fields - the fields to validate
 * @returns {Object} the names of the invalid form fields
 */
function validateShippingForm(form) {
    return validateFields(form);
}

/**
 * Checks to see if the shipping address is initialized
 * @param {dw.order.Shipment} [shipment] - Script API Shipment object
 * @returns {boolean} returns true if defaulShipment.shippingAddress is not null
 */
function isShippingAddressInitialized(shipment) {
    var currentBasket = BasketMgr.getCurrentBasket();
    var initialized = false;

    if (currentBasket) {
        if (shipment) {
            initialized = !!shipment.shippingAddress;
        } else {
            initialized = !!currentBasket.defaultShipment.shippingAddress;
        }
    }

    return initialized;
}

/**
 * Copies a CustomerAddress to a Shipment as its Shipping Address
 * @param {dw.customer.CustomerAddress} address - The customer address
 * @param {dw.order.Shipment} [shipmentOrNull] - The target shipment
 */
function copyCustomerAddressToShipment(address, shipmentOrNull) {
    var currentBasket = BasketMgr.getCurrentBasket();
    var shipment = shipmentOrNull || currentBasket.defaultShipment;
    var shippingAddress = shipment.shippingAddress;

    Transaction.wrap(function () {
        if (shippingAddress === null) {
            shippingAddress = shipment.createShippingAddress();
        }

        shippingAddress.setFirstName(address.firstName);
        shippingAddress.setLastName(address.lastName);
        shippingAddress.setAddress1(address.address1);
        shippingAddress.setAddress2(address.address2);
        if(!empty(address.companyName)) {
            shippingAddress.setCompanyName(address.companyName);
        }else {
            shippingAddress.setCompanyName("");
        }
        
        shippingAddress.setCity(address.city);
        shippingAddress.setPostalCode(address.postalCode);
        shippingAddress.setStateCode(address.stateCode);
        var countryCode = address.countryCode;
        shippingAddress.setCountryCode(countryCode.value);
        shippingAddress.setPhone(address.phone);
    });
}

/**
 * Copies a CustomerAddress to a Basket as its Billing Address
 * @param {dw.customer.CustomerAddress} address - The customer address
 */
function copyCustomerAddressToBilling(address) {
    var currentBasket = BasketMgr.getCurrentBasket();
    var billingAddress = currentBasket.billingAddress;

    Transaction.wrap(function () {
        if (!billingAddress) {
            billingAddress = currentBasket.createBillingAddress();
        }

        billingAddress.setFirstName(address.firstName);
        billingAddress.setLastName(address.lastName);
        billingAddress.setAddress1(address.address1);
        billingAddress.setAddress2(address.address2);
        if(!empty(address.companyName)) {
            billingAddress.setCompanyName(address.companyName);
        }else {
            billingAddress.setCompanyName("");
        }
        billingAddress.setCity(address.city);
        billingAddress.setPostalCode(address.postalCode);
        billingAddress.setStateCode(address.stateCode);
        var countryCode = address.countryCode;
        billingAddress.setCountryCode(countryCode.value);
        if (!billingAddress.phone) {
            billingAddress.setPhone(address.phone);
        }
    });
}

/**
 * Copies information from the shipping form to the associated shipping address
 * @param {Object} shippingData - the shipping data
 * @param {dw.order.Shipment} [shipmentOrNull] - the target Shipment
 */
function copyShippingAddressToShipment(shippingData, shipmentOrNull) {
    var currentBasket = BasketMgr.getCurrentBasket();
    var shipment = shipmentOrNull || currentBasket.defaultShipment;

    var shippingAddress = shipment.shippingAddress;

    Transaction.wrap(function () {
        if (shippingAddress === null) {
            shippingAddress = shipment.createShippingAddress();
        }

        shippingAddress.setFirstName(shippingData.address.firstName);
        shippingAddress.setLastName(shippingData.address.lastName);
        shippingAddress.setAddress1(shippingData.address.address1);
        shippingAddress.setAddress2(shippingData.address.address2);
        if(!empty(shippingData.address.companyName)) {
            shippingAddress.setCompanyName(shippingData.address.companyName);
        }else {
            shippingAddress.setCompanyName("");
        }
        shippingAddress.setCity(shippingData.address.city);
        shippingAddress.setPostalCode(shippingData.address.postalCode);
        shippingAddress.setStateCode(shippingData.address.stateCode);
        var countryCode = shippingData.address.countryCode && shippingData.address.countryCode.value ? shippingData.address.countryCode.value : shippingData.address.countryCode;
        if(countryCode === null){
            countryCode = "US";
        }
        shippingAddress.setCountryCode(countryCode);
        shippingAddress.setPhone(shippingData.address.phone);

        ShippingHelper.selectShippingMethod(shipment, shippingData.shippingMethod);
    });
}

/**
 * Copies a raw address object to the baasket billing address
 * @param {Object} address - an address-similar Object (firstName, ...)
 * @param {Object} currentBasket - the current shopping basket
 */
function copyBillingAddressToBasket(address, currentBasket) {
    var billingAddress = currentBasket.billingAddress;
    if(address && !currentBasket.defaultShipment.shippingMethod.custom.storePickupEnabled){
        Transaction.wrap(function () {
            if (!billingAddress) {
                billingAddress = currentBasket.createBillingAddress();
            }

            billingAddress.setFirstName(address.firstName);
            billingAddress.setLastName(address.lastName);
            billingAddress.setAddress1(address.address1);
            billingAddress.setAddress2(address.address2);
            if(!empty(address.companyName)) {
                billingAddress.setCompanyName(address.companyName);
            }else {
                billingAddress.setCompanyName("");
            }
            
            billingAddress.setCity(address.city);
            billingAddress.setPostalCode(address.postalCode);
            billingAddress.setStateCode(address.stateCode);
            if(address.countryCode) {
                billingAddress.setCountryCode(address.countryCode);
            } else {
                billingAddress.setCountryCode("US");
            }
            
            billingAddress.setPhone(address.phone);
        });

    }
}

/**
 * Returns the first non-default shipment with more than one product line item
 * @param {dw.order.Basket} currentBasket - The current Basket
 * @returns {dw.order.Shipment} - the shipment
 */
function getFirstNonDefaultShipmentWithProductLineItems(currentBasket) {
    var shipment;
    var match;

    for (var i = 0, ii = currentBasket.shipments.length; i < ii; i++) {
        shipment = currentBasket.shipments[i];
        if (!shipment.default && shipment.productLineItems.length > 0) {
            match = shipment;
            break;
        }
    }

    return match;
}

/**
 * Loop through all shipments and make sure all not null
 * @param {dw.order.LineItemCtnr} lineItemContainer - Current users's basket
 * @returns {boolean} - allValid
 */
function ensureValidShipments(lineItemContainer) {
    var shipments = lineItemContainer.shipments;
    var allValid = collections.every(shipments, function (shipment) {
        if (shipment) {
            var address = shipment.shippingAddress;
            return address && address.address1;
        }
        return false;
    });
    return allValid;
}


/**
 * Ensures that no shipment exists with 0 product line items
 * @param {Object} req - the request object needed to access session.privacyCache
 */
function ensureNoEmptyShipments(req) {
    Transaction.wrap(function () {
        var currentBasket = BasketMgr.getCurrentBasket();

        var iter = currentBasket.shipments.iterator();
        var shipment;
        var shipmentsToDelete = [];

        while (iter.hasNext()) {
            shipment = iter.next();
            if (shipment.productLineItems.length < 1 && shipmentsToDelete.indexOf(shipment) < 0) {
                if (shipment.default) {
                    // Cant delete the defaultShipment
                    // Copy all line items from 2nd to first
                    var altShipment = getFirstNonDefaultShipmentWithProductLineItems(currentBasket);
                    if (!altShipment) return;

                    // Move the valid marker with the shipment
                    var altValid = req.session.privacyCache.get(altShipment.UUID);
                    req.session.privacyCache.set(currentBasket.defaultShipment.UUID, altValid);

                    collections.forEach(altShipment.productLineItems,
                        function (lineItem) {
                            lineItem.setShipment(currentBasket.defaultShipment);
                        });

                    if (altShipment.shippingAddress) {
                        // Copy from other address
                        var addressModel = new AddressModel(altShipment.shippingAddress);
                        copyShippingAddressToShipment(addressModel, currentBasket.defaultShipment);
                    } else {
                        // Or clear it out
                        currentBasket.defaultShipment.createShippingAddress();
                    }

                    if (altShipment.custom && altShipment.custom.fromStoreId && altShipment.custom.shipmentType) {
                        currentBasket.defaultShipment.custom.fromStoreId = altShipment.custom.fromStoreId;
                        currentBasket.defaultShipment.custom.shipmentType = altShipment.custom.shipmentType;
                    }

                    currentBasket.defaultShipment.setShippingMethod(altShipment.shippingMethod);
                    // then delete 2nd one
                    shipmentsToDelete.push(altShipment);
                } else {
                    shipmentsToDelete.push(shipment);
                }
            }
        }

        for (var j = 0, jj = shipmentsToDelete.length; j < jj; j++) {
            currentBasket.removeShipment(shipmentsToDelete[j]);
        }
    });
}

/**
 * Recalculates the currentBasket
 * @param {dw.order.Basket} currentBasket - the target Basket
 */
function recalculateBasket(currentBasket) {
    // Calculate the basket
    Transaction.wrap(function () {
        basketCalculationHelpers.calculateTotals(currentBasket);
    });
}


/**
 * Finds and returns a ProductLineItem by UUID
 * @param {dw.order.Basket} currentBasket - the basket to search
 * @param {string} pliUUID - the target UUID
 * @returns {dw.order.ProductLineItem} the associated ProductLineItem
 */
function getProductLineItem(currentBasket, pliUUID) {
    var productLineItem;
    var pli;
    for (var i = 0, ii = currentBasket.productLineItems.length; i < ii; i++) {
        pli = currentBasket.productLineItems[i];
        if (pli.UUID === pliUUID) {
            productLineItem = pli;
            break;
        }
    }
    return productLineItem;
}

/**
 * Validate billing form fields
 * @param {Object} form - the form object with pre-validated form fields
 * @param {Array} fields - the fields to validate
 * @returns {Object} the names of the invalid form fields
 */
function validateBillingForm(form) {
    return validateFields(form);
}

/**
 * Validate credit card form fields
 * @param {Object} form - the form object with pre-validated form fields
 * @returns {Object} the names of the invalid form fields
 */
function validateCreditCard(form) {
    var result = {};
    var currentBasket = BasketMgr.getCurrentBasket();

    if (!form.paymentMethod.value) {
        if (currentBasket.totalGrossPrice.value > 0) {
            result[form.paymentMethod.htmlName] =
                Resource.msg('error.no.selected.payment.method', 'creditCard', null);
        }

        return result;
    }

    return validateFields(form);
}

/**
 * Check the order and the gift certificate payment method have the same currency
 * @param {dw.order.Basket} currentBasket - The current basket
 * @returns {Object} an error object
 */
function checkCurrencyOrderGiftCert(currentBasket, giftCertCodeValue) {
    var giftCert = GiftCertificateMgr.getGiftCertificateByCode(giftCertCodeValue);
    var giftCertBalance = giftCert.getBalance();
    var orderTotal = currentBasket.totalGrossPrice;
    var currencyMismatch = !giftCertBalance.isOfSameCurrency(orderTotal);

    var result = { error: currencyMismatch };

    return result;
}

/**
 * Check that gift certificate balance is greater than order amount
 * @param {dw.order.Basket} currentBasket - The current basket
 * @returns {Object} an error object
 */
function checkSufficientGiftCertBalance(currentBasket, giftCertCodeValue) {
    var result = { error: false };

    var giftCert = GiftCertificateMgr.getGiftCertificateByCode(giftCertCodeValue);
    var giftCertBal = giftCert.getBalance().getValue();
    var orderTotal = currentBasket.totalGrossPrice.getValue();

    if (orderTotal > giftCertBal) {
        result.error = true;
    }

    return result;
}

/**
 * Sets the payment transaction amount
 * @param {dw.order.Basket} currentBasket - The current basket
 * @returns {Object} an error object
 */
function calculatePaymentTransaction(currentBasket) {
    var result = { error: false };
    const Money = require('dw/value/Money');
    var currency = currentBasket.currencyCode;
    var gcAmount = new Money(0,currency);
    var otherThanGCPresent = false;

    try {
        Transaction.wrap(function () {
            // TODO: This function will need to account for gift certificates at a later date
            var paymentInstruments = currentBasket.paymentInstruments;
            collections.forEach(paymentInstruments, function (item) {
                if (PaymentInstrument.METHOD_GIFT_CERTIFICATE.equals(item.paymentMethod)) {
                    gcAmount = gcAmount + item.paymentTransaction.amount;
                }
            });

            collections.forEach(paymentInstruments, function (item) {
                if (!PaymentInstrument.METHOD_GIFT_CERTIFICATE.equals(item.paymentMethod)) {
                    otherThanGCPresent = true;
                    var ccAmount = currentBasket.totalGrossPrice - gcAmount;
                    item.paymentTransaction.setAmount(new Money(ccAmount,currency));
                }
            });            

            if(gcAmount > 0 && !otherThanGCPresent && gcAmount < currentBasket.totalGrossPrice) {//This is because, GC only order not covering the whole order, throw error
                result.error = true;
                result.serverError = Resource.msg('error.gc.not.covering.order', 'giftCertificate', null);
            }

        });
    } catch (e) {
        var a = e;
        result.error = true;
        result.serverError = Resource.msg('error.technical', 'checkout', null)+e;
    }
    
    return result;
}


/**
 * Validates payment
 * @param {Object} req - The local instance of the request object
 * @param {dw.order.Basket} currentBasket - The current basket
 * @returns {Object} an object that has error information
 */
function validatePayment(req, currentBasket) {
    var applicablePaymentCards;
    var applicablePaymentMethods;
    var creditCardPaymentMethod = PaymentMgr.getPaymentMethod(PaymentInstrument.METHOD_CREDIT_CARD);
    var paymentAmount = currentBasket.totalGrossPrice.value;
    var countryCode = req.geolocation.countryCode;
    var currentCustomer = req.currentCustomer.raw;
    var paymentInstruments = currentBasket.paymentInstruments;
    var result = {};

    applicablePaymentMethods = PaymentMgr.getApplicablePaymentMethods(
        currentCustomer,
        countryCode,
        paymentAmount
    );
    applicablePaymentCards = creditCardPaymentMethod.getApplicablePaymentCards(
        currentCustomer,
        countryCode,
        paymentAmount
    );

    var invalid = true;

    for (var i = 0; i < paymentInstruments.length; i++) {
        var paymentInstrument = paymentInstruments[i];

        if (PaymentInstrument.METHOD_GIFT_CERTIFICATE.equals(paymentInstrument.paymentMethod)) {
            invalid = false;
        }

        var paymentMethod = PaymentMgr.getPaymentMethod(paymentInstrument.getPaymentMethod());

        if (paymentMethod && applicablePaymentMethods.contains(paymentMethod)) {
            if (PaymentInstrument.METHOD_CREDIT_CARD.equals(paymentInstrument.paymentMethod)) {
                var card = PaymentMgr.getPaymentCard(paymentInstrument.creditCardType);

                // Checks whether payment card is still applicable.
                if (card && applicablePaymentCards.contains(card)) {
                    invalid = false;
                }
            } else {
                invalid = false;
            }
        }

        if (invalid) {
            break; // there is an invalid payment instrument
        }
    }

    result.error = invalid;
    return result;
}

/**
 * Attempts to create an order from the current basket
 * @param {dw.order.Basket} currentBasket - The current basket
 * @returns {dw.order.Order} The order object created from the current basket
 */
function createOrder(currentBasket) {
    var order;

    try {
        order = Transaction.wrap(function () {
            return OrderMgr.createOrder(currentBasket);
        });
    } catch (error) {
        var a =error;
        var IntegrationConstants = require('*/cartridge/scripts/utils/cdwConstants').getConstants();
        var errorLogger = require('dw/system/Logger').getLogger(IntegrationConstants.INTEGRATION_ERROR_FILE,"order");
        errorLogger.error("Order Create Errors::"+a);
        return null;
    }
    return order;
}

/**
 * handles the payment authorization for each payment instrument
 * @param {dw.order.Order} order - the order object
 * @param {string} orderNumber - The order number for the order
 * @returns {Object} an error object
 */
function handlePayments(order, orderNumber) {
    var result = {};

    if (order.totalNetPrice !== 0.00) {
        var paymentInstruments = order.paymentInstruments;

        if (paymentInstruments.length === 0) {
            Transaction.wrap(function () { OrderMgr.failOrder(order); });
            result.error = true;
        }

        if (!result.error) {
            for (var i = 0; i < paymentInstruments.length; i++) {
                var paymentInstrument = paymentInstruments[i];
                var paymentProcessor = PaymentMgr
                    .getPaymentMethod(paymentInstrument.paymentMethod)
                    .paymentProcessor;
                var authorizationResult;
                if (paymentProcessor === null) {
                    Transaction.begin();
                    paymentInstrument.paymentTransaction.setTransactionID(orderNumber);
                    Transaction.commit();
                } else {
                    if (HookMgr.hasHook('app.payment.processor.' +
                            paymentProcessor.ID.toLowerCase())) {
                        authorizationResult = HookMgr.callHook(
                            'app.payment.processor.' + paymentProcessor.ID.toLowerCase(),
                            'Authorize',
                            orderNumber,
                            paymentInstrument,
                            paymentProcessor
                        );
                    } else {
                        authorizationResult = HookMgr.callHook(
                            'app.payment.processor.default',
                            'Authorize'
                        );
                    }

                    if (authorizationResult.error) {
                        Transaction.wrap(function () { OrderMgr.failOrder(order); });
                        result.error = true;
                        break;
                    }
                }
            }
        }
    }

    return result;
}

/**
 * Sends a confirmation to the current user
 * @param {dw.order.Order} order - The current user's order
 * @param {string} locale - the current request's locale id
 * @returns {void}
 */
function sendConfirmationEmail(order, lineItemsAvailabilityMap, locale) {
    var OrderModel = require('*/cartridge/models/order');
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
    var Locale = require('dw/util/Locale');
    var IntegrationConstants = require('*/cartridge/scripts/utils/cdwConstants').getConstants();
    var errorLogger = require('dw/system/Logger').getLogger(IntegrationConstants.INTEGRATION_ERROR_FILE,"order");
    const Money = require('dw/value/Money');
    const StringUtils = require('dw/util/StringUtils');
    var URLUtils = require('dw/web/URLUtils');
    const {
        getPaypalPaymentInstrument
    } = require('*/cartridge/scripts/paypal/helpers/paymentInstrumentHelper');
    var currentLocale = Locale.getLocale(locale);

    var orderModel = new OrderModel(order, { countryCode: currentLocale.country, containerView: 'basket' });

    /** Adding PayPal details to the order conffrimation STARTS */
    var formatMoney = StringUtils.formatMoney;
    var paypal= {};
    var paypalPaymentInstrument = getPaypalPaymentInstrument(order);
    if(!empty(paypalPaymentInstrument) && !empty(paypalPaymentInstrument.paymentTransaction)) {
        var currency = order.getCurrencyCode();
        var amount = paypalPaymentInstrument.paymentTransaction.amount.value;
        var paypalEmail = paypalPaymentInstrument.custom.currentPaypalEmail;
        var paymentAmount = formatMoney(new Money(amount, currency));
        paypal= {
                paypalEmail: paypalEmail,
                paymentAmount: paymentAmount
            };
    }

    var homeURL = URLUtils.home().toString();
    var loginURL = URLUtils.https('Login-Show').toString();
    var orderObject = { order: orderModel,
                        paypal: paypal,
                        url: homeURL,
                        lurl: loginURL,
                        lineItemsAvailabilityMap: lineItemsAvailabilityMap };
    /** Adding PayPal details to the order conffrimation ENDS */


    var emailObj = {
        to: order.customerEmail,
        bcc: Site.current.getCustomPreferenceValue('customerServiceOrderConfBCCEmail') || 'no-reply@salesforce.com',
        subject: Resource.msg('subject.order.confirmation.email', 'order', null),
        from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@salesforce.com',
        type: emailHelpers.emailTypes.orderConfirmation
    };

    emailHelpers.sendEmail(emailObj, 'checkout/confirmation/confirmationEmail', orderObject);

    /** Handle Condition for sending the same order confirmation email to SalesManager if the Shippping method is sales manager -- START */

    if(order.getDefaultShipment().getShippingMethodID() == 'SALES_MANAGER_DELIVERY') {
        //Get the Sales Manager email from the profile
        if(customer.registered && customer.profile && 
            customer.profile.custom && customer.profile.custom.b2bUser && 
            customer.profile.custom.b2bAccountNumber && "b2bSalesPersonInfo" in customer.profile.custom && customer.profile.custom.b2bSalesPersonInfo){

                var salesPersonJSON = JSON.parse(customer.profile.custom.b2bSalesPersonInfo);
                var salesPersonEmailId = salesPersonJSON.emailAddress;
                if(salesPersonEmailId) {
                    var emailObj = {
                        to: salesPersonEmailId,
                        subject: Resource.msg('subject.order.confirmation.sales.manager.email', 'order', null),
                        from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@salesforce.com',
                        type: emailHelpers.emailTypes.orderConfirmation
                    };
                
                    emailHelpers.sendEmail(emailObj, 'checkout/confirmation/confirmationEmail', orderObject);
                                    
                } else {
                    //Send the error log
                    errorLogger.error(IntegrationConstants.ORDER_ERROR+"Not able to send the order confirmation email for SalesManager because of missing email ID.")
                }

                /** Logic to identify the near by store based on Billing address - START  **/
                var selectedStoreId = Site.current.getCustomPreferenceValue('storeIdDefaultForSalesManagerDelivery');
                if(orderObject.order && 'billing' in orderObject.order && 'billingAddress' in orderObject.order.billing 
                    && 'postalCode' in orderObject.order.billing.billingAddress.address) {

                        var billingZipCode = orderObject.order.billing.billingAddress.address.postalCode;
                        billingZipCode = billingZipCode.toString();
                        //String the extra zipCode with dash
                        if(!empty(billingZipCode) && billingZipCode.indexOf('-') > -1) {
                            billingZipCode = billingZipCode.substring(0,billingZipCode.indexOf('-'));
                        }
                        var storeHelpers = require('*/cartridge/scripts/helpers/storeHelpers');
                        var defaultRadius = Site.current.getCustomPreferenceValue('storeLocatorDefaultRadius');
                        var URLUtils = require('dw/web/URLUtils');
                        var url = URLUtils.url('Stores-FindStores', 'showMap', false);
                        var storesModel = storeHelpers.getStores(defaultRadius, billingZipCode, null, null, request.geolocation, false, url);
                    
                        if(!empty(storesModel) && !empty(storesModel.stores)) {
                            selectedStoreId = storesModel.stores[0].ID;
                        }       
                    }

                    try {
                        Transaction.wrap(function () {
                            if(!empty(selectedStoreId)) {
                                order.custom.b2bStoreManagerStoreId = selectedStoreId;
                            }
                            
                         });
    
                    }catch (e) {
                        var a = e;
                        errorLogger.error(IntegrationConstants.ORDER_ERROR+" Not able to send the order confirmation email for SalesManager because of missing Sales Manager Info.")
                    }

                /** Logic to identify the near by store based on Billing address - END  **/

        } {
            errorLogger.error(IntegrationConstants.ORDER_ERROR+" Not able to send the order confirmation email for SalesManager because of missing Sales Manager Info.")
        }

    }
    /** Handle Condition for sending the same order confirmation email to SalesManager if the Shippping method is sales manager -- END */
}

/**
 * Sends the gift certificate to the recipient
 * @param {Object} giftCert - The current user's gift certificate
 * @param {string} locale - the current request's locale id
 * @returns {void}
 */
function sendGiftCertificateEmail(giftCert, giftCertCode, locale) {
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
    var Locale = require('dw/util/Locale');

    var currentLocale = Locale.getLocale(locale);

    //var orderModel = new OrderModel(order, { countryCode: currentLocale.country, containerView: 'order' });

    var giftCertObject = {
        giftCertCode: giftCertCode,
        giftCert: giftCert
     };

    var emailObj = {
        to: giftCert.recipientEmail,
        subject: Resource.msg('subject.giftcertificate.email', 'giftCertificate', null),
        from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@salesforce.com',
        type: emailHelpers.emailTypes.giftCertificate
    };

    emailHelpers.sendEmail(emailObj, 'marketing/giftCertificateEmail', giftCertObject);
}

/**
 * Attempts to place the order
 * @param {dw.order.Order} order - The order object to be placed
 * @param {Object} fraudDetectionStatus - an Object returned by the fraud detection hook
 * @returns {Object} an error object
 */
function placeOrder(order, fraudDetectionStatus) {
    var result = { error: false };

    try {
        Transaction.begin();
        var placeOrderStatus = OrderMgr.placeOrder(order);
        if (placeOrderStatus === Status.ERROR) {
            throw new Error();
        }

        if (fraudDetectionStatus.status === 'flag') {
            order.setConfirmationStatus(Order.CONFIRMATION_STATUS_NOTCONFIRMED);
        } else {
            order.setConfirmationStatus(Order.CONFIRMATION_STATUS_CONFIRMED);
        }

        // Checks and creates the Gift Certificate
        if (order.giftCertificateLineItems.getLength() > 0) {
            var giftCert = order.giftCertificateLineItems[0];
            var giftCertAmount = new Number(giftCert.priceValue);
            var createdGiftCertificate = GiftCertificateMgr.createGiftCertificate(giftCertAmount);

            //createdGiftCertificate.setOrderNo(order.OrderNo);
            createdGiftCertificate.setRecipientEmail(giftCert.recipientEmail);
            createdGiftCertificate.setRecipientName(giftCert.recipientName);
            createdGiftCertificate.setSenderName(order.customerName);
            createdGiftCertificate.setMessage(giftCert.message);

            // Pass the gift cert code to result object
            result.giftCertCode = createdGiftCertificate.giftCertificateCode;
        }


        order.setExportStatus(Order.EXPORT_STATUS_READY);
        Transaction.commit();
    } catch (e) {
        Transaction.wrap(function () { OrderMgr.failOrder(order); });
        result.error = true;
    }

    return result;
}

/**
 * saves payment instruemnt to customers wallet
 * @param {Object} billingData - billing information entered by the user
 * @param {dw.order.Basket} currentBasket - The current basket
 * @param {dw.customer.Customer} customer - The current customer
 * @returns {dw.customer.CustomerPaymentInstrument} newly stored payment Instrument
 */
function savePaymentInstrumentToWallet(billingData, currentBasket, customer) {
    var wallet = customer.getProfile().getWallet();

    return Transaction.wrap(function () {
        var storedPaymentInstrument = wallet.createPaymentInstrument(PaymentInstrument.METHOD_CREDIT_CARD);

        storedPaymentInstrument.setCreditCardHolder(
            currentBasket.billingAddress.fullName
        );
        storedPaymentInstrument.setCreditCardNumber(
            billingData.paymentInformation.cardNumber.value
        );
        storedPaymentInstrument.setCreditCardType(
            billingData.paymentInformation.cardType.value
        );
        storedPaymentInstrument.setCreditCardExpirationMonth(
            billingData.paymentInformation.expirationMonth.value
        );
        storedPaymentInstrument.setCreditCardExpirationYear(
            billingData.paymentInformation.expirationYear.value
        );

        var processor = PaymentMgr.getPaymentMethod(PaymentInstrument.METHOD_CREDIT_CARD).getPaymentProcessor();
        var token = HookMgr.callHook(
            'app.payment.processor.' + processor.ID.toLowerCase(),
            'createMockToken'
        );

        // storedPaymentInstrument.setCreditCardToken(token);

        return storedPaymentInstrument;
    });
}

/**
 * renders the user's stored payment Instruments
 * @param {Object} req - The request object
 * @param {Object} accountModel - The account model for the current customer
 * @returns {string|null} newly stored payment Instrument
 */
function getRenderedPaymentInstruments(req, accountModel) {
    var result;

    if (req.currentCustomer.raw.authenticated
        && req.currentCustomer.raw.registered
        && req.currentCustomer.raw.profile.wallet.paymentInstruments.getLength()
    ) {
        var context;
        var template = 'checkout/billing/storedPaymentInstruments';

        context = { customer: accountModel };
        result = renderTemplateHelper.getRenderedHtml(
            context,
            template
        );
    }

    return result || null;
}

/**
 * sets the gift message on a shipment
 * @param {dw.order.Shipment} shipment - Any shipment for the current basket
 * @param {boolean} isGift - is the shipment a gift
 * @param {string} giftMessage - The gift message the user wants to attach to the shipment
 * @returns {Object} object containing error information
 */
function setGift(shipment, isGift, giftMessage) {
    var result = { error: false, errorMessage: null };

    try {
        Transaction.wrap(function () {
            shipment.setGift(isGift);

            if (isGift && giftMessage) {
                shipment.setGiftMessage(giftMessage);
            } else {
                shipment.setGiftMessage(null);
            }
        });
    } catch (e) {
        result.error = true;
        result.errorMessage = Resource.msg('error.message.could.not.be.attached', 'checkout', null);
    }

    return result;
}

/**
 * validates and replaces the dashes with empty string
 * @param {string} gcNumber - Any shipment for the current basket
 * @returns {Object} object containing error information
 */
 function validateGCNumber(gcNumber) {
    var result = { error: false, errorMessage: null };
    var formattedGCNumber;
    if(gcNumber && gcNumber != '' && gcNumber != undefined) {
        formattedGCNumber = gcNumber.trim();
        formattedGCNumber = formattedGCNumber.replace(/-/g,"");

        var maxGCToOrder = Site.current.getCustomPreferenceValue('maxNumberOfGCPerOrder') || 4;
        var i = 1

        
        //Now check if the GC is already in the order
        var currentBasket = BasketMgr.getCurrentBasket();
        var gcPaymentInstruments = currentBasket.getGiftCertificatePaymentInstruments();
        collections.forEach(gcPaymentInstruments, function (item) {
            if (i == maxGCToOrder) {
                result = { error: true, errorMessage: Resource.msg('msg.error.max.gc.per.order', 'giftCertificate', null) };
            } else if (item.giftCertificateCode == formattedGCNumber ) {
                result = { error: true, errorMessage: Resource.msg('msg.error.already.added.giftcard', 'giftCertificate', null) };
            }
            i++;
        });
    
        if(result.error) {
            return result;
        }else {
            return formattedGCNumber;
        }
        
    } else{
        result = { error: true, errorMessage: Resource.msg('msg.error.invalid.giftcard', 'giftCertificate', null) };
        return result;
    }


    return result;
}


/**
 * validates and updates the session shipping form object for Vertex tax calculation
 * @param {shippingFomr} shippingForm - Shipping form from Session
 * @returns {shipments} shipments from CurrentBasket
 */
 function updateShippingAddressFromShipment(currentBasket) {
    var result = { error: false, errorMessage: null };
    
    //check if the session has the shipping address form set if not, set it here so that vertex can calculate the tax
    var shippingForm;
    var forms = session.forms;
    if (!empty(forms)) {
        if (forms.singleshipping) {
            // Check if singleshipping step passed then we have shipping data
            if (forms.singleshipping && forms.singleshipping.fulfilled.value) {
                shippingForm = forms.singleshipping.shippingAddress.addressFields;
            }
        } else if (forms.shippingAddress) {
            shippingForm = forms.shippingAddress.addressFields;
        } else if (forms.shipping) {
            shippingForm = forms.shipping.shippingAddress.addressFields;
        }
    }

    // cdw-1668: check if shipping address in Shipping Form matches 
    // shipping address in Current basket
    var validShippingFormAddress = isShippingFormAddressValid(shippingForm,currentBasket);

    if((shippingForm.address1.value == null || !validShippingFormAddress) && currentBasket.shipments) { //This means there are no address present
        collections.forEach(currentBasket.shipments, function (shipment) {
            if (shipment.shippingAddress) {
                shippingForm.address1.value = shipment.shippingAddress.address1;
                shippingForm.address2.value = shipment.shippingAddress.address2;
                shippingForm.companyName.value = shipment.shippingAddress.companyName;
                shippingForm.city.value = shipment.shippingAddress.city;
                //shippingForm.country = "US";
                shippingForm.states.stateCode.htmlValue = shipment.shippingAddress.stateCode;
                shippingForm.postalCode.htmlValue = shipment.shippingAddress.postalCode;
    
            }
        });
    }


    return result;
}

/**
 * This method checks if shipping address in Shipping Form matches
 * shipping address in Current basket
 * @param shippingForm 
 * @param currentBasket 
 * @returns 
 */
function isShippingFormAddressValid(shippingForm,currentBasket) {
    
    var isShippingFormAddressValid = true;

    if(currentBasket.shipments && shippingForm.address1.value != null){
        collections.forEach(currentBasket.shipments, function (shipment) {
            if (shipment.shippingAddress && (shippingForm.address1.value != shipment.shippingAddress.address1)) {
                isShippingFormAddressValid = false;
            }
        });
    }

    return isShippingFormAddressValid;
}

/**
 * This method returns availability of lineItems in the given basket
 * @param currentBasket 
 * @param locale 
 * @returns 
 */
function getOrderItemsAvailability(currentBasket, locale){
    
    var HashMap = require('dw/util/HashMap');

    var lineItemsAvailabilityMap = new HashMap();

    var OrderModel = require('*/cartridge/models/order');
    var Locale = require('dw/util/Locale');
    var currentLocale = Locale.getLocale(locale);

    var orderModel = new OrderModel(currentBasket, { usingMultiShipping: false,
        shippable: true, countryCode: currentLocale.country, containerView: 'basket'});

    if(orderModel && orderModel.items && orderModel.items.items){
        var lineItems = orderModel.items.items;
        lineItems.forEach(function(lineItem){
            lineItemsAvailabilityMap.put(lineItem.id,lineItem.availability);
        });
    }

    return lineItemsAvailabilityMap;
}

module.exports = {
    getFirstNonDefaultShipmentWithProductLineItems: getFirstNonDefaultShipmentWithProductLineItems,
    ensureNoEmptyShipments: ensureNoEmptyShipments,
    getProductLineItem: getProductLineItem,
    isShippingAddressInitialized: isShippingAddressInitialized,
    prepareShippingForm: prepareShippingForm,
    prepareBillingForm: prepareBillingForm,
    copyCustomerAddressToShipment: copyCustomerAddressToShipment,
    copyCustomerAddressToBilling: copyCustomerAddressToBilling,
    copyShippingAddressToShipment: copyShippingAddressToShipment,
    copyBillingAddressToBasket: copyBillingAddressToBasket,
    validateFields: validateFields,
    validateShippingForm: validateShippingForm,
    validateBillingForm: validateBillingForm,
    validatePayment: validatePayment,
    validateCreditCard: validateCreditCard,
    checkCurrencyOrderGiftCert: checkCurrencyOrderGiftCert,
    checkSufficientGiftCertBalance: checkSufficientGiftCertBalance,
    calculatePaymentTransaction: calculatePaymentTransaction,
    recalculateBasket: recalculateBasket,
    handlePayments: handlePayments,
    createOrder: createOrder,
    placeOrder: placeOrder,
    savePaymentInstrumentToWallet: savePaymentInstrumentToWallet,
    getRenderedPaymentInstruments: getRenderedPaymentInstruments,
    sendConfirmationEmail: sendConfirmationEmail,
    ensureValidShipments: ensureValidShipments,
    setGift: setGift,
    sendGiftCertificateEmail: sendGiftCertificateEmail,
    validateGCNumber: validateGCNumber,
    updateShippingAddressFromShipment: updateShippingAddressFromShipment,
    getOrderItemsAvailability: getOrderItemsAvailability
};