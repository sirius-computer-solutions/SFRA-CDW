'use strict';
var collections = require('*/cartridge/scripts/util/collections');

module.exports = function (object, promotions) {
    Object.defineProperty(object, 'promotions', {
        enumerable: true,
        value: promotions.length === 0 ? null : collections.map(promotions, function (promotion) {
            var displayInPLPAsSeparate = false;
            if(!empty(promotion.custom) && "displayInPLPAsSeparate" in promotion.custom && promotion.custom.displayInPLPAsSeparate) {
                displayInPLPAsSeparate = true;
            }
            var shortPromoMessage = "";
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
        })
    });
};
