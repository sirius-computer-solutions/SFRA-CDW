'use strict';

var ProductMgr = require('dw/catalog/ProductMgr');
var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
var quantity = require('*/cartridge/models/product/decorators/quantityValidation');
module.exports = {

    get: function (params) {
        var productId = params.pid;
        var selectedQty = params.quantity;
        var product = Object.create(null);
        var apiProduct = ProductMgr.getProduct(productId);
        if (apiProduct === null) {
            var ProductSearchModel = require('dw/catalog/ProductSearchModel');
            var searchModel = new ProductSearchModel();
            searchModel.setSearchPhrase(productId);
            searchModel.search();
            var tempHit = searchModel.getProductSearchHits().next();
            apiProduct = tempHit.product;
        }
        if (apiProduct === null) { return product;}


        quantity(product, selectedQty, apiProduct.minOrderQuantity.value, apiProduct.availabilityModel);
        return product;
    }};