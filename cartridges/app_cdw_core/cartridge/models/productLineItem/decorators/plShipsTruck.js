'use strict';

var collections = require('*/cartridge/scripts/util/collections');


/**
 * Creates an object of the visible attributes for a product
 * @param {dw.catalog.ProductAttributeModel} attributeModel - attributeModel for a given product.
 * @return {Object|null} an object containing the visible attributes for a product.
 */
 function shipsTruck(attributeModel) {
    var shipsTruck = false;
    var visibleAttributeGroups = attributeModel.visibleAttributeGroups;

    if (visibleAttributeGroups.getLength() > 0) {
        collections.map(attributeModel.visibleAttributeGroups, function (group) {
            if(group.ID === 'Shipping') {
                var visibleAttributeDef = attributeModel.getVisibleAttributeDefinitions(group);
                collections.map(
                    visibleAttributeDef,
                    function (definition) {
                        if(definition.ID === 'w1frt') {
                                var value = attributeModel.getDisplayValue(definition);
                                if(!empty(value) && (value[0] === "F" || value === "F")) {
                                    shipsTruck = true;
                                }
                        }
                    });

                return shipsTruck;
            }
        });
    } else {
        shipsTruck = false;
    }
    return shipsTruck;
}

module.exports = function (object, lineItems) {
    var anyLineItemShipsTruck = false;
    if(!empty(lineItems)) {
        collections.forEach(lineItems, function (lineItem) {
            if(shipsTruck(lineItem.product.attributeModel)){
                anyLineItemShipsTruck = true;
            }
        });
    }
    Object.defineProperty(object, 'shipsTruck', {
        enumerable: true,
        value: anyLineItemShipsTruck
    });
};
