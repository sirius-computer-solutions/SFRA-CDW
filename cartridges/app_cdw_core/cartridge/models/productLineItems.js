'use strict';

var plShipsTruck = require('*/cartridge/models/productLineItem/decorators/plShipsTruck');
var collections = require('*/cartridge/scripts/util/collections');
var base = module.superModule;



/**
 * Loops through all of the product line items and adds the quantities together.
 * @param {dw.util.Collection<dw.order.ProductLineItem>} items - All product
 * line items of the basket
 * @returns {number} a number representing all product line items in the lineItem container.
 */
 function getTotalQuantity(items) {
    // TODO add giftCertificateLineItems quantity
    var totalQuantity = 0;
    collections.forEach(items, function (lineItem) {
        totalQuantity += lineItem.quantity.value;
    });

    return totalQuantity;
}


/**
 * Decorate product with product line item information
 * @param {Object} product - Product Model to be decorated
 * @param {dw.catalog.Product} apiProduct - Product information returned by the script API
 * @param {Object} options - Options passed in from the factory
 * @returns {Object} - Decorated product model
 */
 function ProductLineItems(productLineItems, view) {
    base.call(this, productLineItems, view);

    /** Check if any of the item shipped by truck then mark the whole order shippedByTruck */
    plShipsTruck(this, productLineItems);

}

ProductLineItems.getTotalQuantity = getTotalQuantity;

module.exports = ProductLineItems;
