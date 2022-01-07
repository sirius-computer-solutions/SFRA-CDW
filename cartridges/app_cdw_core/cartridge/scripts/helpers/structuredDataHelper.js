'use strict';

var base = module.superModule;
var ProductMgr = require('dw/catalog/ProductMgr');


/**
 * Get product schema information
 * @param {Object} product - Product Object
 *
 * @returns {Object} - Product Schema object
 */
 function getProductSchema(product) {
     var currentSchema = base.getProductSchema(product);
     var apiProduct = ProductMgr.getProduct(product.id);

     if (currentSchema.brand) {
         currentSchema.brand['@type'] = 'Brand';         
     }

     if (apiProduct.custom.bvAverageRating) {
         currentSchema.aggregateRating = {
             '@type': 'AggregateRating',
             ratingValue: apiProduct.custom.bvAverageRating,
             bestRating: '5',
             worstRating: '1',
             reviewCount: apiProduct.custom.bvReviewCount
         }
     }

     if (apiProduct.custom['mfg-part-#-(oem)']) {
         currentSchema.mpn = apiProduct.custom['mfg-part-#-(oem)'];
     }

     if (apiProduct.custom['mfg-model-#-(series)']) {
         currentSchema.sku = apiProduct.custom['mfg-model-#-(series)'];
     }

     if (apiProduct.custom['globaltradeitemnumber-(gtin)']) {
         currentSchema.gtin14 = apiProduct.custom['globaltradeitemnumber-(gtin)'];
     }

     return currentSchema;
 }

 module.exports = {
    getProductSchema: getProductSchema
 }

 Object.keys(base).forEach(function (prop) {
    // eslint-disable-next-line no-prototype-builtins
    if (!module.exports.hasOwnProperty(prop)) {
        module.exports[prop] = base[prop];
    }
});