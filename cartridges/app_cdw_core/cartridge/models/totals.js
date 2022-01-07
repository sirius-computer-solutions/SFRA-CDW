var base = module.superModule;

var formatMoney = require('dw/util/StringUtils').formatMoney;

// getTotals() is not exported from base, so we can't access it and have to duplicate it here
/**
 * Accepts a total object and formats the value
 * @param {dw.value.Money} total - Total price of the cart
 * @returns {string} the formatted money value
 */
 function getTotals(total) {
    return !total.available ? '-' : formatMoney(total);
}

function getShippingSurcharge(lineItemContainer) {
    var shippingTotalLessSurcharge = getShippingTotalLessSurcharge(lineItemContainer);
    var adjustedShippingTotalPrice = lineItemContainer.adjustedShippingTotalPrice;
    return adjustedShippingTotalPrice.subtract(shippingTotalLessSurcharge);
}

function getShippingTotalLessSurcharge(lineItemContainer) {
    var adjustedNetPrice = lineItemContainer.defaultShipment.shippingLineItems[0].adjustedNetPrice;
    return adjustedNetPrice;
}

/**
 * @constructor
 * @classdesc totals class that represents the order totals of the current line item container
 *
 * @param {dw.order.lineItemContainer} lineItemContainer - The current user's line item container
 */
 function totals(lineItemContainer) {
    base.call(this, lineItemContainer);
    if (lineItemContainer) {
        this.adjustedShippingTotalPrice = getTotals(lineItemContainer.adjustedShippingTotalPrice);
        this.shippingTotalLessSurcharge = getTotals(getShippingTotalLessSurcharge(lineItemContainer));
        this.shippingSurcharge = getTotals(getShippingSurcharge(lineItemContainer));
        
        if (this.totalTax === '-' || this.totalTax === "$0.00") {
            this.grandTotal = getTotals(lineItemContainer.totalNetPrice);
        }else {
            this.grandTotal = getTotals(lineItemContainer.totalGrossPrice);
        }
    } else {

    }
}

module.exports = totals;
