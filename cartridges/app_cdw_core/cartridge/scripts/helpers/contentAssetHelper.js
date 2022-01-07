'use strict';


/**
 * Gets the content asset body for given asset ID
 * @param {string} messageType
 * @param {string} messageObj
 * 
 * @returns {CustomObject}ObjectMgr} The order object created from the current basket
 */
 function getContentAssetBody(contentAssetId) {
    
    var content = dw.content.ContentMgr.getContent(contentAssetId);

    if(content == null) {
        return '';
    }
    var contentBody = content.custom.body;
    var HashMap = require('dw/util/HashMap');
    var context = new HashMap();
    context.contentBody = contentBody;
   // var content = template.render(context).text; 

    return contentBody;
}


module.exports = {
    getContentAssetBody: getContentAssetBody
};

