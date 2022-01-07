'use strict';

var PageMgr = require('dw/experience/PageMgr');
var URLUtils = require('dw/web/URLUtils');

exports.Show = function () 
{
    var page = PageMgr.getPage(request.httpParameterMap.cid.stringValue);

    // Render only if the page is currently visible (as driven by the
    // online flag for scheduling and customer segmentation that the merchant
    // configured for the page)
    if (page != null && page.isVisible())  
    {
        response.writer.print(PageMgr.renderPage(page.ID, ""));
    } 
    else 
    {
        response.redirect(URLUtils.httpsHome().toString());
    }
};
exports.Show.public = true;