'use strict';

var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
var Resource = require('dw/web/Resource');
var Logger = require('dw/system/Logger');
var logger = Logger.getLogger("Payment","StoreCredit");

/**
 * Verifies the required information for billing form is provided.
 * @param {Object} req - The request object
 * @param {Object} paymentForm - the payment form
 * @param {Object} viewFormData - object contains billing form data
 * @returns {Object} an object that has error information or payment information
 */
function processForm(req, paymentForm, viewFormData) {
    var array = require('*/cartridge/scripts/util/array');
    var formErrors = [];
    var viewData = viewFormData;

    viewData.paymentMethod = {
        value: paymentForm.paymentMethod.value,
        htmlName: paymentForm.paymentMethod.value
    };

    logger.debug("viewData::"+JSON.stringify(viewData));


    if(customer.registered && customer.profile && customer.profile.custom && customer.profile.custom.b2bUser && customer.profile.custom.b2bAccountNumber 
        && customer.profile.custom.b2bPayByTerms &&  customer.profile.custom.b2bCreditLimit && customer.profile.custom.b2bWebEnabled && customer.profile.custom.b2bPORequired) {
            var webReferenceNumber = req.form.webReferenceNumber;
            if(empty(webReferenceNumber)) {
                return {
                    fieldErrors: {webReferenceNumber: Resource.msg('error.missing.po.number', 'storeCredit', null)},
                    error: true,
                    viewData: viewData
                };
            } else {
                viewData.paymentInformation = {
                    storeCreditCode: {
                        value: req.form.storeCreditCode,
                        htmlName: ''
                    },
                    webReferenceNumber: {
                        value: req.form.webReferenceNumber,
                        htmlName: ''
                    }

                };
            }
        
        } else {
            var webReferenceNumber = req.form.webReferenceNumber;
            if(!empty(webReferenceNumber)) {
                viewData.paymentInformation = {
                    storeCreditCode: {
                        value: req.form.storeCreditCode,
                        htmlName: ''
                    },
                    webReferenceNumber: {
                        value: req.form.webReferenceNumber,
                        htmlName: ''
                    }

                };                
            } else {
                viewData.paymentInformation = {
                    storeCreditCode: {
                        value: req.form.storeCreditCode,
                        htmlName: ''
                    }
                };
            }

        }

   return {
        error: false,
        viewData: viewData
    };
}


exports.processForm = processForm;
