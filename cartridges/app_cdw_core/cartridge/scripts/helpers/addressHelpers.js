var base = module.superModule;

/**
 * Gather all addresses from shipments and return as an array
 * @param {dw.order.Basket} order - current order
 * @returns {Array} - Array of shipping addresses
 */
 function gatherShippingAddresses(order) {
    var collections = require('*/cartridge/scripts/util/collections');
    var allAddresses = [];

    if (order.shipments) {
        collections.forEach(order.shipments, function (shipment) {
            //don't include shipping addresses for BOPIS shipments - we don't want these saved to address books
            if (!shipment.shippingMethod.custom.storePickupEnabled && shipment.shippingAddress) {
                allAddresses.push(base.copyShippingAddress(shipment.shippingAddress));
            }
        });
    } else {
        allAddresses.push(order.defaultShipment.shippingAddress);
    }
    return allAddresses;
}

module.exports = {
    gatherShippingAddresses: gatherShippingAddresses
};
Object.keys(base).forEach(function (prop) {
    // eslint-disable-next-line no-prototype-builtins
    if (!module.exports.hasOwnProperty(prop)) {
        module.exports[prop] = base[prop];
    }
});
