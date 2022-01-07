'use strict';

var base = module.superModule;
var URLUtils = require('dw/web/URLUtils');
var preferences = require('*/cartridge/config/preferences');
var ACTION_ENDPOINT = preferences.suggestionsActionEnpoint ? preferences.suggestionsActionEnpoint : 'Product-Show';
var IMAGE_SIZE = preferences.imageSize ? preferences.imageSize : 'medium';


/**
 * Get Image URL
 *
 * @param {dw.catalog.Product} product - Suggested product
 * @return {string} - Image URL
 */
 function getImageUrl(product) {
    var imageProduct = product;
    if (product.master) {
        imageProduct = product.variationModel.defaultVariant;
    }
    var images = imageProduct.getImages(IMAGE_SIZE);
    var firstImage = images.pop();
    return firstImage.getAbsImageURL( { scaleWidth: 35 } ).toString();
}

/**
 * Compile a list of relevant suggested products
 *
 * @param {dw.util.Iterator.<dw.suggest.SuggestedProduct>} suggestedProducts - Iterator to retrieve
 *                                                                             SuggestedProducts
 *  @param {number} maxItems - Maximum number of products to retrieve
 * @return {Object[]} - Array of suggested products
 */ 
 function getProducts(suggestedProducts, maxItems) {
    var product = null;
    var products = [];

    for (var i = 0; i < maxItems; i++) {
        if (suggestedProducts.hasNext()) {
            product = suggestedProducts.next().productSearchHit.product;
            var productBrandName = '';
            var manufacturerSKU = '';
            if("custom" in product && product.custom && "cdw-tools-brand-name" in product.custom) {
                productBrandName = product.custom['cdw-tools-brand-name'];
            }

            if(!empty(product.manufacturerSKU)) {
                manufacturerSKU = product.manufacturerSKU;
            }else {
                manufacturerSKU = product.ID;
            }
            products.push({
                name: product.name,
                shortDescription: product.shortDescription,
                imageUrl: getImageUrl(product),
                url: URLUtils.url(ACTION_ENDPOINT, 'pid', product.ID),
                brandName :productBrandName,
                id:product.ID,
                manufacturerSKU: manufacturerSKU
            });
        }
    }

    return products;
}


/**
 * @constructor
 * @classdesc ProductSuggestions class
 *
 * @param {dw.suggest.SuggestModel} suggestions - Suggest Model
 * @param {number} maxItems - Maximum number of items to retrieve
 */
 function ProductSuggestions(suggestions, maxItems) {
    base.call(this, suggestions, maxItems);

    var productSuggestions = suggestions.productSuggestions;
    this.products = getProducts(productSuggestions.suggestedProducts, maxItems);

}


module.exports = ProductSuggestions;
