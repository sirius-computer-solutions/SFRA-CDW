'use strict';

var Site = require('dw/system/Site');

var base = module.superModule;
let customAttrAcmeToolsSalesTaxCode = 'w1taxcd';

/**
 * Helper for Vertex service
 */
function Helper() {}

Helper.prototype = { 
      
    /**
     * @description get category name
     * @param {dw.order.LineItem} productWrap  ProductLineItem
     * @param {number} categoryDepth Integer 0: root, 1: product category
     * @example 'fruits-bananas-yellow_bananas'
     * @returns {string} category Id
     */
     getProductClass: function(productWrap) {
        var product;
        var productClass="";

        if (!empty(productWrap) && productWrap.product) {
            if (productWrap.product.variant) {
                product = productWrap.product;
            } else {
                product = productWrap.product;
            }
            if(product.custom && "w1taxcd" in product.custom){
                productClass = product.custom[customAttrAcmeToolsSalesTaxCode];
            } else {
                productClass = Site.current.getCustomPreferenceValue('acmeToolsDefaultSalesTaxCode') || "";
            } 
        }

        return productClass;
    }
};

for(var prop in base){
    if(!Helper.prototype.hasOwnProperty(prop)){
        Helper.prototype[prop] = base[prop];
    }
};

module.exports = new Helper();