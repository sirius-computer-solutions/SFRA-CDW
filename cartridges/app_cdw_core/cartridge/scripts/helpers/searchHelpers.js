'use strict';

var base = module.superModule;



/**
 * Set search configuration values
 *
 * @param {dw.catalog.ProductSearchModel} apiProductSearch - API search instance
 * @param {Object} params - Provided HTTP query parameters
 * @return {dw.catalog.ProductSearchModel} - API search instance
 * @param {Object} httpParameterMap - Query params
 */
 function setupSearch(apiProductSearch, params, httpParameterMap) {
    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var searchModelHelper = require('*/cartridge/scripts/search/search');
    var sortingRule;

    if(!empty(session.custom.sortRule)) {
        sortingRule = CatalogMgr.getSortingRule(session.custom.sortRule);
    } else if(!empty(params.srule)) {
        sortingRule = params.srule ? CatalogMgr.getSortingRule(params.srule) : null;
    }
    

    
    var selectedCategory = CatalogMgr.getCategory(params.cgid);
    selectedCategory = selectedCategory && selectedCategory.online ? selectedCategory : null;

    searchModelHelper.setProductProperties(apiProductSearch, params, selectedCategory, sortingRule, httpParameterMap);

    if (params.preferences) {
        searchModelHelper.addRefinementValues(apiProductSearch, params.preferences);
    }

    return apiProductSearch;
}


/**
 * Retrieves the Category Landing Page, if available in Page Designer
 * @param {Object} categoryID - the category ID as determined from the request
 * @returns {Object} a lookup result with these fields:
 *  * page - the page that is configured for this category, if any
 *  * invisiblePage - the page that is configured for this category if we ignore visibility, if it is different from page
 *  * aspectAttributes - the aspect attributes that should be passed to the PageMgr, null if no page was found
 */
 function getPageDesignerCategoryPage(categoryID) {
    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var PageMgr = require('dw/experience/PageMgr');
    var HashMap = require('dw/util/HashMap');

    var category = CatalogMgr.getCategory(categoryID);
    var page = PageMgr.getPage(category, true, 'plp');
    var invisiblePage = PageMgr.getPage(category, false, 'plp');

    if (page) {
        var aspectAttributes = new HashMap();
        aspectAttributes.category = category;

        return {
            page: page,
            invisiblePage: page.ID !== invisiblePage.ID ? invisiblePage : null,
            aspectAttributes: aspectAttributes
        };
    }

    return {
        page: null,
        invisiblePage: invisiblePage,
        aspectAttributes: null
    };
}



/**
 * Logic to process the PLP driven out of PageDesigner
 * @param {Object} categoryID - the category ID as determined from the request
 * @returns {Object} a lookup result with these fields:
 *  * page - the page that is configured for this category, if any
 *  * invisiblePage - the page that is configured for this category if we ignore visibility, if it is different from page
 *  * aspectAttributes - the aspect attributes that should be passed to the PageMgr, null if no page was found
 */
 function pageDesignerSearch(model, content) {


    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var ProductSearchModel = require('dw/catalog/ProductSearchModel');
    var ProductSearch = require('*/cartridge/models/search/productSearch');
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var URLUtils = require('dw/web/URLUtils');
    var Resource = require('dw/web/Resource');
    var QueryString = require('../../../../modules/server/queryString');
    var categoryHelper = require('*/cartridge/scripts/helpers/categoryHelper')
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    var reportingUrlsHelper = require('*/cartridge/scripts/reportingUrls');
    var schemaHelper = require('*/cartridge/scripts/helpers/structuredDataHelper');
    var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
    var reportingURLs;
    var breadcrumbs;
    var qParams = new QueryString(content.queryString);
    var h1CatLevelString;

    var apiProductSearch = new ProductSearchModel();

    // /** Resetting the sort rule when pageloads */
    if(!empty(session.custom.sortRule)) {
        session.custom.sortRule = "";
    }

    var start = 0;
    var size = 24;
    var params = {cgid: model.categoryId};

    if(!empty(qParams.start) && !empty(qParams.sz)) {
        params.start = qParams.start;
        params.size = qParams.sz;
    }

    if(!empty(qParams.oci)) {
        params.oci = qParams.oci;
    }

    if(!empty(qParams.preferences)) {
        params.preferences = qParams.preferences;
    }

    apiProductSearch = setupSearch(apiProductSearch, qParams);
    var sortingRule = apiProductSearch.category.defaultSortingRule.ID;
    //if srule is in request parameters, apply that to search model
    if(!empty(qParams.srule)){
        sortingRule = qParams.srule;
    }
    apiProductSearch.search();

    var productSearch = new ProductSearch(
        apiProductSearch,
        params,
        sortingRule,
        CatalogMgr.getSortingOptions(),
        CatalogMgr.getSiteCatalog().getRoot()
    );
    model.productSearch = productSearch;
    model.apiProductSearch = apiProductSearch;
    model.maxSlots = 4;

    /** Logic to habndle the BRAND search with showSubCategories START */
    var origCatId = qParams.oci;
    if(!empty(origCatId) || (apiProductSearch.category && 
                                apiProductSearch.category.custom && 
                                    'showSubCategories' in apiProductSearch.category.custom && 
                                        apiProductSearch.category.custom.showSubCategories)) {

            
            if(!empty(origCatId)) {
                var CatalogMgr = require('dw/catalog/CatalogMgr');
                var subCat = CatalogMgr.getCategory(origCatId); 
                if(!empty(subCat) && 'showSubCategories' in subCat.custom && 
                                        subCat.custom.showSubCategories) {

                        model.showSubCategories = true;
                        model.showSubCatName = subCat.displayName;;
                        model.subCategoriesToShow = subCat.subCategories;
                }else if(apiProductSearch.category.custom && 'showSubCategories' in apiProductSearch.category.custom 
                            && apiProductSearch.category.custom.showSubCategories ) {
                    model.showSubCategories = true;
                    model.showSubCatName = apiProductSearch.category.displayName;
                    model.subCategoriesToShow = apiProductSearch.category.subCategories;
                }

                if(!empty(subCat) && 'displayThisCategoryName' in subCat.custom && 
                        subCat.custom.displayThisCategoryName) {
                            h1CatLevelString = subCat.displayName;
                }     
                
                if(!empty(subCat) && 'slotBannerImage' in subCat.custom && 
                                        subCat.custom.slotBannerImage) {

                        model.showOrignialslotBannerImage = true;
                        model.orignialslotBannerImage = subCat.custom.slotBannerImage;
                }   
                model.origCategoryObject = subCat;
                                
            }  else{
                model.showSubCategories = true;
                model.showSubCatName = apiProductSearch.category.displayName;
                if(empty(qParams.preferences)) {
                    model.subCategoriesToShow = apiProductSearch.category.subCategories;
                }
                

            }        
    }
    /** Logic to habndle the BRAND search with showSubCategories END */

    /** Appending BreadCrumb for PLP START */
    if(apiProductSearch.category) {
        var breadcrumbHome = [
            {
                htmlValue: Resource.msg('global.home', 'common', null),
                url: URLUtils.home().toString()
            }
        ];
        
        breadcrumbs = productHelper.getAllBreadcrumbs(apiProductSearch.category.ID, null, []).reverse();
        breadcrumbs = breadcrumbHome.concat(breadcrumbs);
        
        model.breadcrumbs = breadcrumbs;
    }
    /** Appending BreadCrumb for PLP END */

    /**
     * Logic to handle the H1 String if its forwarded with the AltURL with Brand Attribute selected
     */
     if(apiProductSearch.isCategorySearch) {
            model.refinementIncludedH1 = categoryHelper.getGeneratedH1String(qParams)+" "+productSearch.category.name;

            if(h1CatLevelString) {
                model.refinementIncludedH1 = h1CatLevelString;
            }

            if(!empty(qParams) && !empty(qParams.preferences)) {
                model.refinedPage = true;
                model.refinedKey =  categoryHelper.getGeneratedRefinedKey(qParams)+"-"+productSearch.category.name;
            }

            /**
             * Logic to handle category banner underneath the header and the global banner -- START
             */
            if (apiProductSearch && apiProductSearch.category && 
                apiProductSearch.category.custom && 
                'contentBannerAssetIds' in apiProductSearch.category.custom) {
                    model.contentBannerAssetIds = apiProductSearch.category.custom.contentBannerAssetIds;
            }

            if (apiProductSearch && apiProductSearch.category && 
                apiProductSearch.category.custom && 
                'displayCommonBanner' in apiProductSearch.category.custom) {
                    model.displayCommonBanner = apiProductSearch.category.custom.displayCommonBanner;
            }     
            /**
             * Logic to handle category banner underneath the header and the global banner -- END
             */

             var refinedPageTitle = categoryHelper.getGeneratedH1String(qParams)+" "+productSearch.category.name;
             if(!empty(refinedPageTitle)) {
                 var CurrentPageMetaDataNew = model.CurrentPageMetaData;
                 if(!empty(CurrentPageMetaDataNew)) {
                    CurrentPageMetaDataNew.title = refinedPageTitle;
                    model.CurrentPageMetaData =  CurrentPageMetaDataNew;
                 }
             }    
             
             if(!empty(model.page)) {
                pageMetaHelper.setPageMetaTags(request.pageMetaData, apiProductSearch);
                model.CurrentPageMetaData = PageRenderHelper.getPageMetaData(model.page);
                // var CurrentPageMetaDataNew = model.CurrentPageMetaData;
                // CurrentPageMetaDataNew.title = refinedPageTitle;
                // model.CurrentPageMetaData =  CurrentPageMetaDataNew;
             }        

     }    



     /** Appending Compare Checkbox for PLP START */
     model.compareEnabled = getCategoryCompareStatus(content.category);
    /** Appending Compare Checkbox for PLP END */

     /** Populating Refine and Reporting URL for PLP START */
    
     var refineurl = URLUtils.url('Search-Refinebar');
     var whitelistedParams = ['q', 'cgid', 'pmin', 'pmax', 'srule', 'pmid', 'oci'];
     var isRefinedSearch = false;
 
     Object.keys(qParams).forEach(function (element) {
         if (whitelistedParams.indexOf(element) > -1) {
             refineurl.append(element, qParams[element]);
         }
 
         if (['pmin', 'pmax'].indexOf(element) > -1) {
             isRefinedSearch = true;
         }
 
         if (element === 'preferences') {
             var i = 1;
             isRefinedSearch = true;
             Object.keys(qParams[element]).forEach(function (preference) {
                 refineurl.append('prefn' + i, preference);
                 refineurl.append('prefv' + i, qParams[element][preference]);
                 i++;
             });
         }
     });
 

     if (productSearch.searchKeywords !== null && !isRefinedSearch) {
         reportingURLs = reportingUrlsHelper.getProductSearchReportingURLs(productSearch);
     }
 
     model.reportingURLs = reportingURLs;
     model.refineurl = refineurl;
     
     /** Populating Refine and Reporting URL for PLP END */

     model.schemaData = schemaHelper.getListingPageSchema(productSearch.productIds);


    // BazaarVoice scout for inline ratings
    var BVHelper = require('*/cartridge/scripts/lib/libBazaarvoice').getBazaarVoiceHelper();
    var Site = require('dw/system/Site').getCurrent();
    var ratingPref = Site.getCustomPreferenceValue('bvEnableInlineRatings_C2013');
    var quickviewPref = Site.current.getCustomPreferenceValue('bvQuickViewRatingsType_C2013');
    var addScout = false;
    if ((ratingPref && ratingPref.value && ratingPref.value.equals('hosted')) || (quickviewPref && quickviewPref.value && quickviewPref.value.equals('pdpsummary'))) {
        addScout = true;
    }
    if (addScout) {
        model.bvScout = BVHelper.getBvLoaderUrl();
    }

     return model;
    
}


/**
 * Check if product comparision is enabled for a category or any of its ancestors.
 *
 * @param {dw.catalog.Category} selectedCategory the category that should be checked
 * @returns {boolean} true if product comparision is enabled, false if it is not enabled.
 */
 function getCategoryCompareStatus(selectedCategory) {
    var compareBooleanValue = false;
    if (selectedCategory) {
        var currentCategory;
        compareBooleanValue = selectedCategory.custom.enableCompare;

        if (selectedCategory.parent) {
            currentCategory = selectedCategory.parent;
            while (currentCategory.ID !== 'root') {
                compareBooleanValue = compareBooleanValue || currentCategory.custom.enableCompare;
                currentCategory = currentCategory.parent;
            }
        }
    }
    return compareBooleanValue;
}


/**
 * performs a search
 *
 * @param {Object} req - Provided HTTP query parameters
 * @param {Object} res - Provided HTTP query parameters
 * @return {Object} - an object with relevant search information
 * @param {Object} httpParameterMap - Query params
 */
 function search(req, res) {
    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var URLUtils = require('dw/web/URLUtils');
    var ProductSearchModel = require('dw/catalog/ProductSearchModel');
    var Site = require('dw/system/Site');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    var ProductSearch = require('*/cartridge/models/search/productSearch');
    var reportingUrlsHelper = require('*/cartridge/scripts/reportingUrls');
    var schemaHelper = require('*/cartridge/scripts/helpers/structuredDataHelper');

    var apiProductSearch = new ProductSearchModel();
    var categoryTemplate = '';
    var maxSlots = 4;
    var productSearch;
    var reportingURLs;

    var replacedSearchQuery;
    if(!empty(req.querystring.q)) {
        replacedSearchQuery = req.querystring.q;
    var regex = new RegExp(Site.getCurrent().getCustomPreferenceValue('ProductIDRegex') || '[+-*/]','g');
        if(replacedSearchQuery.match(regex))
        {
            replacedSearchQuery = replacedSearchQuery.replace(regex, "_"); 
        }
    }
    var searchRedirect = replacedSearchQuery ? apiProductSearch.getSearchRedirect(replacedSearchQuery) : null;

    if (searchRedirect) {
        return { searchRedirect: searchRedirect.getLocation() };
    }

    apiProductSearch = setupSearch(apiProductSearch, req.querystring, req.httpParameterMap);
    apiProductSearch.search();

    if (!apiProductSearch.personalizedSort) {
        base.applyCache(res);
    }
    categoryTemplate = base.getCategoryTemplate(apiProductSearch);
    productSearch = new ProductSearch(
        apiProductSearch,
        req.querystring,
        req.querystring.srule,
        CatalogMgr.getSortingOptions(),
        CatalogMgr.getSiteCatalog().getRoot()
    );

    pageMetaHelper.setPageMetaTags(req.pageMetaData, productSearch);

    var canonicalUrl = URLUtils.url('Search-Show', 'cgid', req.querystring.cgid);
    var refineurl = URLUtils.url('Search-Refinebar');
    var whitelistedParams = ['q', 'cgid', 'pmin', 'pmax', 'srule', 'pmid', 'oci'];
    var isRefinedSearch = false;

    Object.keys(req.querystring).forEach(function (element) {
        if (whitelistedParams.indexOf(element) > -1) {
            refineurl.append(element, req.querystring[element]);
        }

        if (['pmin', 'pmax'].indexOf(element) > -1) {
            isRefinedSearch = true;
        }

        if (element === 'preferences') {
            var i = 1;
            isRefinedSearch = true;
            Object.keys(req.querystring[element]).forEach(function (preference) {
                refineurl.append('prefn' + i, preference);
                refineurl.append('prefv' + i, req.querystring[element][preference]);
                i++;
            });
        }
    });

    if (productSearch.searchKeywords !== null && !isRefinedSearch) {
        reportingURLs = reportingUrlsHelper.getProductSearchReportingURLs(productSearch);
    }


    if(!empty(productSearch.canonicalLink)) {
        canonicalUrl = productSearch.canonicalLink;
   }

    var result = {
        productSearch: productSearch,
        maxSlots: maxSlots,
        reportingURLs: reportingURLs,
        refineurl: refineurl,
        canonicalUrl: canonicalUrl,
        apiProductSearch: apiProductSearch
    };

    if (productSearch.isCategorySearch && !productSearch.isRefinedCategorySearch && categoryTemplate ) {
        pageMetaHelper.setPageMetaData(req.pageMetaData, productSearch.category);
        result.category = apiProductSearch.category;
        result.categoryTemplate = categoryTemplate;
    }

    if (!categoryTemplate || categoryTemplate === 'rendering/category/categoryproducthits') {
        result.schemaData = schemaHelper.getListingPageSchema(productSearch.productIds);
    }

    return result;
}

/**
 * Retrieves banner image URL
 *
 * @param {dw.catalog.Category} category - Subject category
 * @return {string} - Banner's image URL
 */
 function getBannerImageUrl(category) {
    var url = null;

    if (category.custom && 'slotBannerImage' in category.custom &&
        category.custom.slotBannerImage) {
        url = category.custom.slotBannerImage.getURL();
    } 

    return url;
}

 /**
 * check to see if we are coming back from a pdp, if yes, use the old qs to set up the grid refinements and number of tiles
 *
 * @param {Object} clickStream - object with an array of request to the server in the current session
 * @return {string} - url to redirect to
 */
  function backButtonDetection(clickStream) {
    var preferences = require('*/cartridge/config/preferences');
    if (!preferences.plpBackButtonOn) {
        return null;
    }

    var URLUtils = require('dw/web/URLUtils');
    var currentClick;
    var limit = preferences.plpBackButtonLimit || 10;
    var clicks = clickStream.clicks.reverse().slice(0, limit);
    var productClick = null;
    var searchClick = null;
    var counter = 0;
    var done = false;

    // find the last pdp click and the last search click
    var backClicks = clicks.filter(function (click) {
        if (counter === 0) {
            currentClick = click;
            counter++;
            return true;
        }

        if (click.pipelineName.indexOf('Product-Show') > -1 && productClick == null && !done) {
            productClick = click;
            counter++;
            return true;
        }

        if ((click.pipelineName.indexOf('Search-Show') > -1 && searchClick == null)
            || (click.pipelineName.indexOf('Search-UpdateGrid') > -1 && searchClick == null)
            || (click.pipelineName.indexOf('Search-ShowAjax') > -1 && searchClick == null)
        ) {
            searchClick = click;
            counter++;
            done = true;
            return true;
        }
        counter++;
        return false;
    });

    if (backClicks.length === 3) {
        var strCurrent = currentClick.queryString;
        var strCurrentArray = strCurrent.split('&');
        var paramCurrentArray = [];
        var valueCurrentArray = [];
        var cgidCurrentValue;
        var qCurrentValue;

        strCurrentArray.forEach(function (strElement) {
            var strElementSplit = strElement.split('=');
            if (strElementSplit[0] === 'cgid') { cgidCurrentValue = strElementSplit[1]; }
            if (strElementSplit[0] === 'q') { qCurrentValue = strElementSplit[1]; }
            paramCurrentArray.push(strElementSplit[0]);
            valueCurrentArray.push(strElementSplit[1]);
        });

        var str = searchClick.queryString;
        var strArray = str.split('&');
        var paramArray = [];
        var valueArray = [];
        var cgidValue;
        var ociValue;
        var qValue;
        var sruleValue;
        var szPos;
        var startPos;

        strArray.forEach(function (strElement2, i) {
            var strElementSplit2 = strElement2.split('=');
            if (strElementSplit2[0] === 'cgid') { cgidValue = strElementSplit2[1]; }
            if (strElementSplit2[0] === 'oci') { ociValue = strElementSplit2[1]; }
            if (strElementSplit2[0] === 'q') { qValue = strElementSplit2[1]; }
            if (strElementSplit2[0] === 'sz') { szPos = i; }
            if (strElementSplit2[0] === 'start') { startPos = i; }
            if (strElementSplit2[0] === 'srule') { sruleValue = strElementSplit2[1]; }
            if (strElementSplit2[0] === 'pmax' || strElementSplit2[0] === 'pmin') { 
                strElementSplit2[1] = strElementSplit2[1].replace(/%2c/g,"");
                var strElementSplit3 = strElementSplit2[1].split('%2e');
                strElementSplit2[1] = strElementSplit3[0];
            }
            paramArray.push(strElementSplit2[0]);
            valueArray.push(strElementSplit2[1]);
        });

        // alter the sz and start parameters
        /* ACME-1487: The below code is applicable only for OOB-SFRA since their 
           pagination is done by 'More Results' button.
           AcmeTools Site pagination behavior is different and the below
           2 lines of code was breaking it. Hence commenting it out.
        */
        /*
        if (!!szPos && !!startPos) {
            valueArray[szPos] = parseInt(valueArray[startPos], 10) + parseInt(valueArray[szPos], 10);
            valueArray[startPos] = 0;
        }*/

        // check that cgid or q parameter are matching and build url with old parameters
        if ((cgidCurrentValue && cgidCurrentValue === cgidValue) || (qCurrentValue && qCurrentValue === qValue)) {
            var redirectGridUrl = URLUtils.url('Search-Show');
            paramArray.forEach(function (param, i) {
                redirectGridUrl.append(paramArray[i], valueArray[i]);
            });
            return redirectGridUrl.toString();
        }
    }
    return null;
}

module.exports = {
    getPageDesignerCategoryPage: getPageDesignerCategoryPage,
    backButtonDetection: backButtonDetection,
    pageDesignerSearch: pageDesignerSearch,
    setupSearch: setupSearch,
    search: search,
    getBannerImageUrl: getBannerImageUrl
};
Object.keys(base).forEach(function (prop) {
    // eslint-disable-next-line no-prototype-builtins
    if (!module.exports.hasOwnProperty(prop)) {
        module.exports[prop] = base[prop];
    }
});