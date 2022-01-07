'use strict';
/* global empty dw request session customer */

const OrderMgr = require('dw/order/OrderMgr');
const {
    createErrorLog
} = require('./bmPaypalUtils');

var paypalHelper = {};

paypalHelper.createCustomTransactionInvNum = function () {
    var invNum = OrderMgr.createOrderSequenceNo();

    try {
        if (!empty(OrderMgr.getOrder(invNum))) {
            invNum = OrderMgr.createOrderSequenceNo();
        }
    } catch (error) {
        createErrorLog(error);
    }

    return 'pp_' + invNum;
};

module.exports = paypalHelper;
