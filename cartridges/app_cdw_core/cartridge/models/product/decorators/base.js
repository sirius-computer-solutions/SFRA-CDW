'use strict';

module.exports = function (object, apiProduct, type) {

    var productName = apiProduct.name;
    if('custom' in apiProduct && 'cdw-tools-override-product-name' in apiProduct.custom && apiProduct.custom['cdw-tools-override-product-name']!=null)
    {
        var overrideProductName = apiProduct.custom['cdw-tools-override-product-name'];
        if(overrideProductName.toString().trim()!='') productName = overrideProductName;
    }
        
    Object.defineProperty(object, 'uuid', {
        enumerable: true,
        value: apiProduct.UUID
    });

    Object.defineProperty(object, 'id', {
        enumerable: true,
        value: apiProduct.ID
    });

    Object.defineProperty(object, 'productName', {
        enumerable: true,
        value: productName
    });

    Object.defineProperty(object, 'productType', {
        enumerable: true,
        value: type
    });

    Object.defineProperty(object, 'brand', {
        enumerable: true,
        value: apiProduct.brand
    });
};
