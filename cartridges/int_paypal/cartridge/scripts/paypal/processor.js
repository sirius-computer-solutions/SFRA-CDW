'use strict';

const Transaction = require('dw/system/Transaction');
const Order = require('dw/order/Order');

const {
    createPaymentInstrument
} = require('./helpers/paymentInstrumentHelper');

const {
    createBaFromForm
} = require('./helpers/billingAgreementHelper');

const {
    getPurchaseUnit,
    isPurchaseUnitChanged
} = require('./helpers/paypalHelper');

const {
    createErrorLog,
    encodeString
} = require('../paypal/paypalUtils');

const {
    updateOrderBillingAddress,
    updateBABillingAddress
} = require('../../scripts/paypal/helpers/addressHelper');

const {
    getOrderDetails,
    getBADetails,
    updateOrderDetails,
    createTransaction,
    createOrder
} = require('./paypalApi');

/**
 * Processor Handle
 *
 * @param {dw.order.LineItemCtnr} basket - Current basket
 * @param {Object} paymentInformation - paymentForm from hook
 * @returns {Object} Processor handling result
 */
function handle(basket, paymentInformation) {
    var {
        billingForm
    } = paymentInformation;
    var paymentInstrument = createPaymentInstrument(basket, billingForm.paymentMethod.value);
    var isBillingAgreementID = billingForm.paypal.billingAgreementID && !empty(billingForm.paypal.billingAgreementID.htmlValue);
    var shippingAddress;

    if (isBillingAgreementID) {
        var activeBillingAgreement = createBaFromForm(billingForm);

        Transaction.wrap(function () {
            paymentInstrument.custom.currentPaypalEmail = activeBillingAgreement.email;
            paymentInstrument.custom.PP_API_ActiveBillingAgreement = JSON.stringify(activeBillingAgreement);
            session.privacy.paypalPayerEmail = activeBillingAgreement.email;
        });

        var {
            shipping_address,
            billing_info,
            err: BADetailsError
        } = getBADetails(paymentInstrument);
        if (BADetailsError) {
            createErrorLog(BADetailsError);
            return {
                error: true
            };
        }
        
        updateBABillingAddress(basket, billing_info);

        // Empty shipping_address in case when only gift certificate in the basket
        if (!shipping_address) {
            shipping_address = billing_info.billing_address;
            shipping_address.recipient_name = billing_info.first_name + ' ' + billing_info.last_name;
        }
        if('country_code'in billing_info && billing_info.country_code != 'US')
        {
            billing_info = shipping_address;
        }
        
        shipping_address.phone = billing_info.phone;
        shippingAddress = shipping_address;
    } else {
        Transaction.wrap(function () {
            paymentInstrument.custom.paypalOrderID = billingForm.paypal.paypalOrderID.value;
        });

        var {
            payer,
            purchase_units,
            err: OrderDetailsError
        } = getOrderDetails(paymentInstrument);
        if (OrderDetailsError) {
            return {
                error: true
            };
        }
        //TODO
        shippingAddress = purchase_units[0];
        if('address' in payer && 'country_code' in payer.address && payer.address.country_code !='US')
        {
            if('shipping' in shippingAddress && 'address' in shippingAddress.shipping)
            {
                payer.address = shippingAddress.shipping.address;
                if(payer.address.address_line_1 === payer.address.address_line_2)
                {
                    payer.address.address_line_2 = '';
                }
            }
                
        }

        updateOrderBillingAddress(basket, payer);

        session.privacy.paypalPayerEmail = payer.email_address;
        paymentInstrument.custom.currentPaypalEmail = payer.email_address;
        shippingAddress.phone = payer.phone;
    }

    return {
        success: true,
        paymentInstrument: paymentInstrument,
        shippingAddress: shippingAddress
    };
}

/**
 * Get transaction id from transaction response
 * @param  {Object} transactionResponse Response from call
 * @returns {string} Transaction id from response
 */
function getTransactionId(transactionResponse) {
    var payments = transactionResponse.purchase_units[0].payments;
    return payments.captures ?
        payments.captures[0].id :
        payments.authorizations[0].id;
}

/**
 * Get transaction status from transaction response
 * @param  {Object} transactionResponse Response from call
 * @returns {string} Transaction status from response
 */
function getTransactionStatus(transactionResponse) {
    var payments = transactionResponse.purchase_units[0].payments;
    var transactionStatus = payments.captures ? payments.captures[0].status : payments.authorizations[0].status;
    if (payments.authorizations && payments.authorizations[0].status === 'CAPTURED' && !payments.refunds) {
        transactionStatus = payments.authorizations[0].status;
    }

    return transactionStatus;
}

/**
 * Create a request body object for createOrder call with BA
 * @param  {dw.order.OrderPaymentInstrument} paymentInstrument current active paypal payment instrument
 * @returns {Object} body for request
 */
function createBAReqBody(paymentInstrument) {
    var activeBillingAgreement = JSON.parse(paymentInstrument.custom.PP_API_ActiveBillingAgreement);
    var billingAgreementId = activeBillingAgreement.baID;
    return {
        payment_source: {
            token: {
                id: billingAgreementId,
                type: 'BILLING_AGREEMENT'
            }
        }
    };
}

/**
 * Save result of rest call and update order data
 *
 * @param {dw.order.LineItemCtnr} order - Order object
 * @param {dw.order.OrderPaymentInstrument} paymentInstrument - current payment instrument
 * @returns {Object} Processor authorizing result
 */
function authorize(order, paymentInstrument) {
    var purchaseUnit = getPurchaseUnit(order);
    var isUpdateRequired = isPurchaseUnitChanged(purchaseUnit);
    delete session.privacy.paypalUsedOrderNo;
    var bodyObj;

    if (empty(paymentInstrument) || empty(order) || order.status === Order.ORDER_STATUS_FAILED) {
        return {
            error: true
        };
    }

    if (paymentInstrument.paymentTransaction.amount.value === 0) {
        return {
            error: true
        };
    }

    if (paymentInstrument.custom.paypalOrderID && isUpdateRequired) {
        var {
            err: updateOrderDetailsError
        } = updateOrderDetails(paymentInstrument, purchaseUnit);
        if (updateOrderDetailsError) {
            return {
                authorized: false,
                error: true,
                message: updateOrderDetailsError
            };
        }
        session.privacy.orderDataHash = encodeString(purchaseUnit);
    }

    if (paymentInstrument.custom.PP_API_ActiveBillingAgreement) {
        var {
            resp,
            err: createOrderError
        } = createOrder(purchaseUnit);
        if (createOrderError) {
            return {
                authorized: false,
                error: true,
                message: createOrderError
            };
        }

        Transaction.wrap(function () {
            paymentInstrument.custom.paypalOrderID = resp.id;
        });

        try {
            bodyObj = createBAReqBody(paymentInstrument);
        } catch (err) {
            createErrorLog(err);
            return {
                error: true,
                authorized: false
            };
        }
    }

    var {
        response,
        err: createTransactionError
    } = createTransaction(paymentInstrument, bodyObj);
    if (createTransactionError) {
        return {
            error: true
        };
    }

    Transaction.wrap(function () {
        var transactionId = getTransactionId(response);
        paymentInstrument.getPaymentTransaction().setTransactionID(transactionId);
        paymentInstrument.custom.paypalPaymentStatus = getTransactionStatus(response);
        order.custom.paypalPaymentMethod = 'express';
        order.custom.PP_API_TransactionID = transactionId;
    });

    session.privacy.orderDataHash = null;

    return {
        authorized: true
    };
}

exports.handle = handle;
exports.authorize = authorize;
