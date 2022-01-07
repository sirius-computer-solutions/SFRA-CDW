'use strict';

var decorators = require('*/cartridge/models/product/decorators/index');
var promotionCache = require('*/cartridge/scripts/util/promotionCache');
var ProductSearchModel = require('dw/catalog/ProductSearchModel');
var PromotionMgr = require('dw/campaign/PromotionMgr');
var productHelper = require('*/cartridge/scripts/helpers/productHelpers');

var callForPrice = require('*/cartridge/models/product/decorators/callForPriceAttribute');
var Site = require('dw/system/Site');

/**
 * Get product search hit for a given product
 * @param {dw.catalog.Product} apiProduct - Product instance returned from the API
 * @returns {dw.catalog.ProductSearchHit} - product search hit for a given product
 */
function getProductSearchHit(apiProduct) {
    var searchModel = new ProductSearchModel();
    var productId = apiProduct.ID;
    searchModel.setSearchPhrase(apiProduct.ID);
    searchModel.search();

    if (searchModel.count === 0) {
        var regex = new RegExp(Site.getCurrent().getCustomPreferenceValue('ProductIDRegex') || '[^a-zA-Z0-9- /]','g');
        if(productId.match(regex))
        {
            productId = productId.replace(regex, " "); 
        }

        searchModel.setSearchPhrase(productId);
        searchModel.search();
        
        if (searchModel.count === 0) {
            productId = productId.replace("/A", " A"); 
            searchModel.setSearchPhrase(productId);
            searchModel.search();
        }
    }

    var hit = searchModel.getProductSearchHit(apiProduct);
    if (!hit) {
        var tempHit = searchModel.getProductSearchHits().next();
        if (tempHit.firstRepresentedProductID === apiProduct.ID) {
            hit = tempHit;
        }
    }
    return hit;
}

/**
 * Decorate product with product tile information
 * @param {Object} product - Product Model to be decorated
 * @param {dw.catalog.Product} apiProduct - Product information returned by the script API
 * @param {string} productType - Product type information
 *
 * @returns {Object} - Decorated product model
 */
module.exports = function productTile(product, apiProduct, productType) {
    //var productSearchHit = getProductSearchHit(apiProduct);
    decorators.base(product, apiProduct, productType);
    var productParams = {};
    productParams['pid'] = apiProduct.ID;
    
    var options = productHelper.getConfig(apiProduct, productParams);
    decorators.price(product, apiProduct, options.promotions, false, options.optionModel);
    decorators.images(product, apiProduct, { types: ['medium'], quantity: 'single' });
    decorators.ratings(product);
    if (productType === 'set') {
        decorators.setProductsCollection(product, apiProduct);
    }

    //decorators.variationAttributes(product, options.variationModel, {attributes: '*',endPoint: 'Variation'});
    if(apiProduct.custom && "w1call" in apiProduct.custom && apiProduct.custom.w1call && (apiProduct.custom.w1call === "Y" || apiProduct.custom.w1call === true)) {
        callForPrice(product, apiProduct.custom.w1call);
    }
    
    var promotions;
    var options = null;
    options = {
        quantity: 1
    };
    
    promotions = PromotionMgr.activeCustomerPromotions.getProductPromotions(apiProduct);
    decorators.promotions(product, promotions);
    decorators.readyToOrder(product, "");
    decorators.availability(product, options.quantity, apiProduct.minOrderQuantity.value, apiProduct.availabilityModel);
    decorators.description(product, apiProduct);

    if("custom" in apiProduct && apiProduct.custom && "acme-tools-brand-name" in apiProduct.custom) {
        product.brandName = apiProduct.custom['acme-tools-brand-name'];
    }
    return product;
};
