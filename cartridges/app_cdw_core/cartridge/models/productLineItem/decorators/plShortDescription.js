'use strict';

module.exports = function (object, lineItem) {
    Object.defineProperty(object, 'shortDescription', {
        enumerable: true,
        value: lineItem.product.shortDescription
    });

    Object.defineProperty(object, 'isB2BPrice', {
        enumerable: true,
        value: 'custom' in lineItem && 'b2bPriceQuantity' in lineItem.custom && lineItem.custom.b2bPriceQuantity > 0
    });
};
