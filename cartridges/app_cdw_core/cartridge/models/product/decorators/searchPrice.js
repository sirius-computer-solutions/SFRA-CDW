'use strict';

var PromotionMgr = require('dw/campaign/PromotionMgr');
var ArrayList = require('dw/util/ArrayList');
var pricingHelper = require('*/cartridge/scripts/helpers/pricing');
var PriceBookMgr = require('dw/catalog/PriceBookMgr');
var DefaultPrice = require('*/cartridge/models/price/default');
var RangePrice = require('*/cartridge/models/price/range');
var Site = require('dw/system/Site');

var wasPriceBookName = Site.current.getCustomPreferenceValue('wasPriceBookName') || 'cdw-usd-m-sale-was-prices';

/**
 * Retrieve promotions that apply to current product
 * @param {dw.catalog.ProductSearchHit} searchHit - current product returned by Search API.
 * @param {Array<string>} activePromotions - array of ids of currently active promotions
 * @return {Array<Promotion>} - Array of promotions for current product
 */
function getPromotions(searchHit, activePromotions) {
    var productPromotionIds = searchHit.discountedPromotionIDs;

    var promotions = new ArrayList();
    activePromotions.forEach(function (promoId) {
        var index = productPromotionIds.indexOf(promoId);
        if (index > -1) {
            promotions.add(PromotionMgr.getPromotion(productPromotionIds[index]));
        }
    });

    return promotions;
}

/**
 * Get was price for a given product
 * @param {dw.catalog.ProductSearchHit} hit - current product returned by Search API.
 * @param {function} getSearchHit - function to find a product using Search API.
 *
 * @returns {Object} - price for a product
 */
function getWasPrices(hit, getSearchHit) {
    var priceModel = hit.firstRepresentedProduct.getPriceModel();
    if(priceModel!==null)
    {
        try {
            var wasPriceAmount = priceModel.getPriceBookPrice(wasPriceBookName);
            if (wasPriceAmount) {
                if (wasPriceAmount.available) {
                    return {
                        minPrice: wasPriceAmount,
                        maxPrice: wasPriceAmount
                    };
                }
            }
            
        } catch (e) {
            searchHit = hit;
        } finally {
           PriceBookMgr.setApplicablePriceBooks()
        }
    
        
    }
    return {};
}

/**
 * Get list price for a given product
 * @param {dw.catalog.ProductSearchHit} hit - current product returned by Search API.
 * @param {function} getSearchHit - function to find a product using Search API.
 *
 * @returns {Object} - price for a product
 */
 function getListPrices(hit, getSearchHit) {
    var priceModel = hit.firstRepresentedProduct.getPriceModel();
    if (!priceModel.priceInfo) {
        return {};
    }
    var rootPriceBook = pricingHelper.getRootPriceBook(priceModel.priceInfo.priceBook);
    if (rootPriceBook.ID === priceModel.priceInfo.priceBook.ID) {
        return { minPrice: hit.minPrice, maxPrice: hit.maxPrice };
    }
    var searchHit;
    var currentApplicablePriceBooks = PriceBookMgr.getApplicablePriceBooks();
    try {
        PriceBookMgr.setApplicablePriceBooks(rootPriceBook);
        searchHit = getSearchHit(hit.product);
    } catch (e) {
        searchHit = hit;
    } finally {
        // Clears price book ID's stored to the session.
        // When switching locales, there is nothing that clears the price book ids stored in the
        // session, so subsequent searches will continue to use the ids from the originally set
        // price books which have the wrong currency.
        if (currentApplicablePriceBooks && currentApplicablePriceBooks.length) {
            PriceBookMgr.setApplicablePriceBooks(currentApplicablePriceBooks.toArray());
        } else {
            PriceBookMgr.setApplicablePriceBooks();
        }
    }

    if (searchHit) {
        if (searchHit.minPrice.available && searchHit.maxPrice.available) {
            return {
                minPrice: searchHit.minPrice,
                maxPrice: searchHit.maxPrice
            };
        }

        return {
            minPrice: hit.minPrice,
            maxPrice: hit.maxPrice
        };
    }

    return {};
}

module.exports = function (object, searchHit, activePromotions, getSearchHit) {
    Object.defineProperty(object, 'price', {
        enumerable: true,
        value: (function () {
            var salePrice = { minPrice: searchHit.minPrice, maxPrice: searchHit.maxPrice };
            var promotions = getPromotions(searchHit, activePromotions);
            if (promotions.getLength() > 0) {
                var promotionalPrice = pricingHelper.getPromotionPrice(searchHit.firstRepresentedProduct, promotions);
                if (promotionalPrice && promotionalPrice.available) {
                    salePrice = { minPrice: promotionalPrice, maxPrice: promotionalPrice };
                }
            }
            var listPrice = getListPrices(searchHit, getSearchHit);

            var wasPrice = getWasPrices(searchHit, getSearchHit);
            
            var seePriceInCart = false;
            var isCallForPriceProduct = false;
            if('product' in searchHit)
            {
                var product = searchHit.product;
                if(product.custom)
                {
                    if('w1click' in product.custom && (product.custom['w1click']  ==='Y'||product.custom['w1click'] ===true) )
                    {
                        seePriceInCart = true;
                    }
                    if('w1call' in product.custom && (product.custom['w1call'] ==='Y'||product.custom['w1call'] ===true) )
                    {
                        isCallForPriceProduct = true;
                    }
                }     
            }
            if (salePrice.minPrice.value !== salePrice.maxPrice.value) {
                // range price
                return new RangePrice(salePrice.minPrice, salePrice.maxPrice);
            }

            if (listPrice.minPrice && listPrice.minPrice.valueOrNull !== null) {
                if (listPrice.minPrice.value !== salePrice.minPrice.value) {
                    return new DefaultPrice(salePrice.minPrice, listPrice.minPrice, wasPrice.minPrice,seePriceInCart,isCallForPriceProduct);
                }
            }
            return new DefaultPrice(salePrice.minPrice);
        }())
    });


};
