'use strict';

var preferences = require('*/cartridge/config/preferences');
var MAX_ORDER_QUANTITY = preferences.maxOrderQty || 1000;
var hasSurcharge = false;

module.exports = function (object, product, quantity) {
    Object.defineProperty(object, 'selectedQuantity', {
        enumerable: true,
        value: parseInt(quantity, 10) || (product && product.minOrderQuantity ? product.minOrderQuantity.value : 1)
    });
    Object.defineProperty(object, 'minOrderQuantity', {
        enumerable: true,
        value: product && product.minOrderQuantity ? product.minOrderQuantity.value : 1
    });
    
    if(product.custom && 'maxOrderQuantity' in product.custom && product.custom.maxOrderQuantity!=null)
    {
        MAX_ORDER_QUANTITY = product.custom.maxOrderQuantity;
    }

    var ShippingMgr = require('dw/order/ShippingMgr');
    var shippingMethod = ShippingMgr.getDefaultShippingMethod();
    var hasSurcharge = false;
    var surchargeValue = 0.00;
    var psc = ShippingMgr.getProductShippingModel(product).getShippingCost(shippingMethod);
    
    if (psc && psc.getAmount() && psc.isSurcharge()) {
        hasSurcharge=true;
        surchargeValue =psc.getAmount().toFormattedString();
    }
    
    Object.defineProperty(object, 'maxOrderQuantity', {
        enumerable: true,
        value: MAX_ORDER_QUANTITY
    });

    Object.defineProperty(object, 'hasSurcharge', {
        enumerable: true,
        value: hasSurcharge
    });

    Object.defineProperty(object, 'surchargeValue', {
        enumerable: true,
        value: surchargeValue
    });
    
};
