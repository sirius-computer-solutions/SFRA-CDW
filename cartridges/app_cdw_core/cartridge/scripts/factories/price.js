'use strict';

var money = require('dw/value/Money');
var priceHelper = require('*/cartridge/scripts/helpers/pricing');
var DefaultPrice = require('*/cartridge/models/price/default');
var RangePrice = require('*/cartridge/models/price/range');
var TieredPrice = require('*/cartridge/models/price/tiered');
var Site = require('dw/system/Site');
var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
var Resource = require('dw/web/Resource');

var wasPriceBookName = Site.current.getCustomPreferenceValue('wasPriceBookName') || 'acme-usd-m-sale-was-prices';
/**
 * Get list price for a product
 *
 * @param {dw.catalog.ProductPriceModel} priceModel - Product price model
 * @return {dw.value.Money} - List price
 */
function getListPrice(priceModel) {
    var price = money.NOT_AVAILABLE;
    var priceBook;
    var priceBookPrice;

    if (priceModel.price.valueOrNull === null && priceModel.minPrice) {
        return priceModel.minPrice;
    }

    priceBook = priceHelper.getRootPriceBook(priceModel.priceInfo.priceBook);
    priceBookPrice = priceModel.getPriceBookPrice(priceBook.ID);

    if (priceBookPrice.available) {
        return priceBookPrice;
    }

    price = priceModel.price.available ? priceModel.price : priceModel.minPrice;

    return price;
}

/**
 * Get was price for a given product
 * @param {dw.catalog.ProductPriceModel} priceModel - Product price model
 * @return {dw.value.Money} - Was price
 *
 * @returns {Object} - price for a product
 */
 function getWasPrice(priceModel) {
    if(priceModel!==null)
    {
        try {
            var wasPriceBook = priceModel.getPriceBookPrice(wasPriceBookName);
            if (wasPriceBook) {
                if (wasPriceBook.available) {
                    return wasPriceBook;
                }
            }
            
        } catch (e) {
            return {};
        }   
        
    }
    return {};
}

/**
 * Retrieves Price instance
 *
 * @param {dw.catalog.Product|dw.catalog.productSearchHit} inputProduct - API object for a product
 * @param {string} currency - Current session currencyCode
 * @param {boolean} useSimplePrice - Flag as to whether a simple price should be used, used for
 *     product tiles and cart line items.
 * @param {dw.util.Collection<dw.campaign.Promotion>} promotions - Promotions that apply to this
 *                                                                 product
 * @param {dw.catalog.ProductOptionModel} currentOptionModel - The product's option model
 * @return {TieredPrice|RangePrice|DefaultPrice} - The product's price
 */
function getPrice(inputProduct, currency, useSimplePrice, promotions, currentOptionModel) {
    var rangePrice;
    var salesPrice;
    var listPrice;
    var product = inputProduct;
    var promotionPrice = money.NOT_AVAILABLE;
    var priceModel = currentOptionModel
        ? product.getPriceModel(currentOptionModel)
        : product.getPriceModel();
    var priceTable = priceModel.getPriceTable();

    // TIERED
    if (priceTable.quantities.length > 1) {
        return new TieredPrice(priceTable, useSimplePrice);
    }

    // RANGE
    if ((product.master || product.variationGroup) && priceModel.priceRange) {
        rangePrice = new RangePrice(priceModel.minPrice, priceModel.maxPrice);

        if (rangePrice && rangePrice.min.sales.value !== rangePrice.max.sales.value) {
            return rangePrice;
        }
    }

    // DEFAULT
    if ((product.master || product.variationGroup) && product.variationModel.variants.length > 0) {
        product = product.variationModel.variants[0];
        priceModel = product.priceModel;
    }

    //promotionPrice = priceHelper.getPromotionPrice(product, promotions, currentOptionModel);
    listPrice = getListPrice(priceModel);
    var wasPrice = getWasPrice(priceModel);
    salesPrice = priceModel.price;

    if (promotionPrice && promotionPrice.available && salesPrice.compareTo(promotionPrice)) {
        salesPrice = promotionPrice;
    }
    if(listPrice.available ===false)
    {
        salesPrice = {};
        wasPrice = {};
    }

    if (salesPrice && listPrice && salesPrice.value === listPrice.value) {
        listPrice = null;
    }

    if (salesPrice.valueOrNull === null && (listPrice && listPrice.valueOrNull !== null)) {
        salesPrice = listPrice;
        listPrice = {};
    }
    
    var showB2BPrice  = request.httpQueryString!=null && request.httpQueryString.indexOf('showB2BPrice')!=-1;
    if(showB2BPrice && customer.registered && 'profile' in customer && 'custom' in customer.profile && 'b2bAccountNumber' in customer.profile.custom)
    {
        var b2bAccountNumber = customer.profile.custom.b2bAccountNumber;
        if (b2bAccountNumber!=null && b2bAccountNumber!='')
        {
            var b2bPriceObj =   {
                                    customerId: b2bAccountNumber,
                                    currencyCode: salesPrice.currencyCode,
                                    partNumber: product.ID,
                                    quantity:'1'
                                };
            var b2bPrice = hooksHelper('app.s2k.b2b.price', 'GetB2BPrice', b2bPriceObj, function () {});
            if (b2bPrice && b2bPrice.available && salesPrice.compareTo(b2bPrice)) {
                salesPrice = b2bPrice;
            }
        }
    }
    var seePriceInCart = false;
    var isCallForPriceProduct = false;
    if(product.custom)
    {
        if('w1click' in product.custom && (product.custom['w1click']  ==='Y'||product.custom['w1click'] ===true) )
        {
            seePriceInCart = true;
        }
        if('w1call' in product.custom && (product.custom['w1call'] ==='Y' ||product.custom['w1call'] ===true) )
        {
            isCallForPriceProduct = true;
        }
    }  

    return new DefaultPrice(salesPrice, listPrice,wasPrice,seePriceInCart,isCallForPriceProduct);
}

module.exports = {
    getPrice: getPrice
};
