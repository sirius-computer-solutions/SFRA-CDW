'use strict';

var base = require('base/checkout/summary');

/**
 * updates the totals summary
 * @param {Array} totals - the totals data
 */
base.updateTotals = function (totals) {
    $('.shipping-total-cost').text(totals.shippingTotalLessSurcharge);
    $('.shipping-surcharge-cost').text(totals.shippingSurcharge);
    $('.tax-total').text(totals.totalTax);
    $('.sub-total').text(totals.subTotal);
    $('.grand-total-sum').text(totals.grandTotal);

    if (totals.orderLevelDiscountTotal.value > 0) {
        $('.order-discount').removeClass('hide-order-discount');
        $('.order-discount-total').text('- ' + totals.orderLevelDiscountTotal.formatted);
    } else {
        $('.order-discount').addClass('hide-order-discount');
    }
}

module.exports = base;
