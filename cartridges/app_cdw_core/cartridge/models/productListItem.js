'use strict';

var collections = require('*/cartridge/scripts/util/collections');
var base = module.superModule;



/**
 * Loops through all of the product line items and adds the quantities together.
 * @param {dw.util.Collection<dw.order.ProductLineItem>} items - All product
 * line items of the basket
 * @returns {number} a number representing all product line items in the lineItem container.
 */
 function getMaxOrderQuantity(productListItemObject) {
    var MAX_ORDER_QUANTITY;
    if(productListItemObject.product.custom  && 
        'maxOrderQuantity' in productListItemObject.product.custom && 
        productListItemObject.product.custom.maxOrderQuantity!=null)
    {
        MAX_ORDER_QUANTITY = productListItemObject.product.custom.maxOrderQuantity;
    }

    return MAX_ORDER_QUANTITY;
}


/**
 * Address class that represents an productListItem
 * @param {dw.customer.ProductListItem} productListItemObject - Item in a product list
 * @constructor
 */
 function productListItem(productListItemObject) {
    base.call(this, productListItemObject);
    var maxOrderQty = getMaxOrderQuantity(productListItemObject);
    this.productListItem.name = productListItemObject.product.shortDescription;
    this.productListItem.productName = productListItemObject.product.name;
    if(!empty(maxOrderQty)) {
        this.productListItem.maxOrderQuantity = maxOrderQty;
    }

    if(productListItemObject.product && 'custom' in productListItemObject.product && 'cdw-tools-brand-name' in productListItemObject.product.custom)
    {
        this.productListItem.productBrandName = productListItemObject.product.custom['cdw-tools-brand-name'];
    }

    if(!empty(productListItemObject.product.manufacturerSKU)) {
        this.productListItem.manufacturerSKU = productListItemObject.product.manufacturerSKU;
    } else {
        this.productListItem.manufacturerSKU = productListItemObject.product.ID;
    }

    var PromotionMgr = require('dw/campaign/PromotionMgr');
    var promotions = PromotionMgr.activeCustomerPromotions.getProductPromotions(productListItemObject.product);
    var appliedPromotions =  promotions.length === 0 ? null : collections.map(promotions, function (promotion) {
                                    var displayInPLPAsSeparate = false;
                                    var shortPromoMessage = "";
                                    if(!empty(promotion.custom) && "displayInPLPAsSeparate" in promotion.custom && promotion.custom.displayInPLPAsSeparate) {
                                        displayInPLPAsSeparate = true;
                                    }

                                    if(!empty(promotion.custom) && "shortPromoMessage" in promotion.custom && promotion.custom.shortPromoMessage) {
                                        shortPromoMessage = promotion.custom.shortPromoMessage;
                                    }                                    
                                    return {
                                        calloutMsg: promotion.calloutMsg ? promotion.calloutMsg.markup : '',
                                        details: promotion.details ? promotion.details.markup : '',
                                        enabled: promotion.enabled,
                                        id: promotion.ID,
                                        name: promotion.name,
                                        promotionClass: promotion.promotionClass,
                                        shortPromoMessage: shortPromoMessage,
                                        displayInPLPAsSeparate: displayInPLPAsSeparate,
                                        rank: promotion.rank
                                    };
                                });
    this.productListItem.appliedPromotions =  appliedPromotions;
    
}

productListItem.getMaxOrderQuantity = getMaxOrderQuantity;

module.exports = productListItem;
