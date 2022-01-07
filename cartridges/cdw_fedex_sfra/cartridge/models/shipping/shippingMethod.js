'use strict';

var base = module.superModule;

var fedexRatesHelper = require('*/cartridge/scripts/helpers/fedexRatesHelper');

/**
 * Plain JS object that represents a DW Script API dw.order.ShippingMethod object
 * @param {dw.order.ShippingMethod} shippingMethod - the default shipment of the current basket
 * @param {dw.order.Shipment} [shipment] - a Shipment
 */
function ShippingMethodModel(shippingMethod, shipment) {
    // Initialize the base model prior
    base.call(this, shippingMethod, shipment);

    this.fedexRates = shippingMethod && shippingMethod.custom
        ? shippingMethod.custom.fedexRates : false;

    // Mix in dynamically transformed properties
    if (shipment) {
        // Applies shipping rate data to the shipping method model
        // Overrides the shippingCost value when Fedex method
        fedexRatesHelper.applyShippingRateData(this, shippingMethod, shipment);
    }
}

module.exports = ShippingMethodModel;
