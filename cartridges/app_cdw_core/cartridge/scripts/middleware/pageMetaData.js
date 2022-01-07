'use strict';

/**
 * Middleware to compute request pageMetaData object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function computedPageMetaData(req, res, next) {
    var computedMetaData = {
        title: req.pageMetaData.title,
        description: req.pageMetaData.description,
        keywords: req.pageMetaData.keywords,
        pageMetaTags: []
    };

    req.pageMetaData.pageMetaTags.forEach(function (item) {
        if (item.title) {
            computedMetaData.title = item.content;
        } else if (item.name && item.ID === 'description') {
            computedMetaData.description = item.content;
        } else if (item.name && item.ID === 'keywords') {
            computedMetaData.keywords = item.content;
        } else {
            computedMetaData.pageMetaTags.push(item);
        }
    });

    if(res.viewData && res.viewData.apiProductSearch && res.viewData.apiProductSearch.promotionID){
        var PromotionMgr = require('dw/campaign/PromotionMgr');
        var promoId = res.viewData.apiProductSearch.promotionID;
        if(promoId != '' && promoId != undefined) {
            var promotionObj = PromotionMgr.getPromotion(promoId);
            if(!empty(promotionObj.name)) {
                computedMetaData.title = promotionObj.name + " | "+dw.system.Site.current.name;
            }
            if(!empty(promotionObj.details)) {
                computedMetaData.description = promotionObj.details+ " | "+dw.system.Site.current.name;
            }
            
        }
        
    }    

    res.setViewData({
        CurrentPageMetaData: computedMetaData
    });
    next();
}

module.exports = {
    computedPageMetaData: computedPageMetaData
};
