'use strict';
/* global request, response */
var URLUtils = require('dw/web/URLUtils');
var HashMap = require('dw/util/HashMap');
var Template = require('dw/util/Template');
var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
var collections = require('*/cartridge/scripts/util/collections');

/**
 * Render logic for the product list page.
 *
 * @param {dw.experience.PageScriptContext} context The page script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commcerce Cloud Plattform.
 *
 * @returns {string} The markup to be displayed
 */
module.exports.render = function (context, modelIn) {
    
    var model = modelIn || new HashMap();
    var content = context.content;
    var page = context.page;
    model.page = page;

    var QueryString = require('../../../../modules/server/queryString');
    var qParams = new QueryString(content.queryString);
    /** Add populated datalayer to rendering model */
    var datalayer = content.datalayer;
    model.datalayer = datalayer;
    model.categoryId = content.category.getID();

    //If there any filters selected, then it has to to to PLP Page.
    if(!empty(qParams.preferences)) {
        qParams.showPLP = "Y";
    }
     

    /** Check if the request is to ALT URL, if yes, check if the original page is PLP, if NOT send it to NO PageDesigner PLP. If its PLP send it to PageDesigner PLP itself */
    if(!empty(qParams.oci) || (!empty(qParams.showPLP) && qParams.showPLP == "Y")) {
        var page = context.page;
        var alreadyProductList = false;
    
        var regions = PageRenderHelper.getRegionModelRegistry(page);
        if(!empty(regions.main) && !empty(regions.main.region) && !empty(regions.main.region.visibleComponents)) {
            var visibleComponents = regions.main.region.visibleComponents;
            collections.forEach(visibleComponents, function (visibleCompnent) {
                if(visibleCompnent.typeID === "dynamic.productList"){
                    alreadyProductList = true;
                }
            });
            
        }

        //Execute below only if existing page is NOT PLP
        if(!alreadyProductList) {
            var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');
            var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');

            //Populate the meta data into model
            model.CurrentPageMetaData = PageRenderHelper.getPageMetaData(page);     


            //Getther PLP data
            model = searchHelper.pageDesignerSearch(model, content);

            //Populate the meta data now
            pageMetaHelper.setPageMetaTags(request.pageMetaData, model.apiProductSearch);

        
            // Component Regions
            var gridCol = '4';
            if (content.displayFormat && content.displayFormat.value === 'row') {
                gridCol = '12';
            }
            model.gridClassName = 'region col-6 col-sm-' + gridCol;
            model.isEditMode = PageRenderHelper.isInEditMode();
        
            //Populate Reporting URLS as EMPTY
            model.reportingURLs = [];
    
            if (PageRenderHelper.isInEditMode()) {
                var HookManager = require('dw/system/HookMgr');
                HookManager.callHook('app.experience.editmode', 'editmode');
                model.resetEditPDMode = true;
            }
        
            var expires = new Date();
            expires.setHours(expires.getHours() + 1); // this handles overflow automatically
            response.setExpires(expires);
        
            var canonicalUrl = URLUtils.url('Search-Show', 'cgid', qParams.cgid);
            if(!empty(model.productSearch.canonicalLink)) {
                 canonicalUrl = model.productSearch.canonicalLink;
            }
            model.canonicalUrl = canonicalUrl;     

            return new Template('search/searchResults').render(model).text;
        }
   
    }
    
    /**CanonicalURL for PLP START */
    var canonicalUrl = URLUtils.url('Search-Show', 'cgid', content.category.ID);
    if(!empty(qParams.cgid)) {
        var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');
        var searchModel = searchHelper.pageDesignerSearch(model, content);
    
        if(!empty(searchModel.productSearch.canonicalLink)) {
             canonicalUrl = model.productSearch.canonicalLink;
        }
        if(searchModel && "displayCommonBanner" in searchModel && searchModel.displayCommonBanner) {
            model.displayCommonBanner = "Yes";
       }
    }
    model.canonicalUrl = canonicalUrl;

    /**CanonicalURL for PLP END */

    return module.superModule.render(context, model);
};
