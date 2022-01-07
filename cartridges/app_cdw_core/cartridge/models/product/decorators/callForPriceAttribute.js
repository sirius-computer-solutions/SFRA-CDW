'use strict';

var collections = require('*/cartridge/scripts/util/collections');

/**
 * Creates an object of the visible attributes for a product
 * @param {dw.catalog.ProductAttributeModel} attributeModel - attributeModel for a given product.
 * @return {Object|null} an object containing the visible attributes for a product.
 */
function getCallForPriceAttribute(attributeModel) {
    var callForPricePresent = false;
    collections.find(attributeModel.attributeGroups, function (attributeGroup) {
        if(attributeGroup.ID == 'storefrontAttributes') {
            collections.find(attributeGroup.attributeDefinitions, function (attributeDefinition) {
                if(attributeDefinition.ID === 'w1call') {
                    callForPricePresent = true;
                }
            });
        }
    });
    return callForPricePresent;
}

module.exports = function (object, callForPrice) {
    Object.defineProperty(object, 'callForPrice', {
        enumerable: true,
        value: callForPrice
    });
};
