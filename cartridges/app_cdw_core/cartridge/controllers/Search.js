'use strict';

var server = require('server');
server.extend(module.superModule);
var URLUtils = require('dw/web/URLUtils');
var PromotionMgr = require('dw/campaign/PromotionMgr');
var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');
var Resource = require('dw/web/Resource');
var SearchHelper = require('*/cartridge/scripts/helpers/categoryHelper')

server.prepend('Show', function (req, res, next) {

    /** Resetting the sort rule when pageloads */
    if(!empty(session.custom.sortRule)) {
        session.custom.sortRule = "";
    }
    next();
}, pageMetaData.computedPageMetaData);


server.append('Show', function (req, res, next) {
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var resViewData = res.viewData;
    var breadcrumbs;
    var h1CatLevelString;

    /** Logic to handle the page desiger extra values STARTS */
    var origSearchString = req.querystring.q;
    if(!empty(res.renderings)) {
        var queryString = resViewData.queryString;
        if(res.renderings[0].aspectAttributes) {
            res.renderings[0].aspectAttributes.queryString = queryString;
        }
    }
    /** Logic to handle the page desiger extra values ENDS */

    /** Check if the origCatId is present or if the incoming category has the subCategories flag enable to pupulate the sub-cats -- BEGINS */
    if(resViewData.productSearch && resViewData.productSearch.isCategorySearch) {
        res.setViewData({
            showSubCatName: resViewData.apiProductSearch.category.displayName,
            subCategoriesToShow: resViewData.apiProductSearch.category.subCategories
        });
    }
    
    //Defaulting
    res.setViewData({
        slotBannerStyle: "",
        origSearchString: origSearchString
    });
 
    var origCatId = req.querystring.oci;
    
    if(empty(origCatId) && !empty(req.querystring.preferences) && 'cdw-tools-brand-name' in req.querystring.preferences && resViewData.apiProductSearch && resViewData.apiProductSearch.categorySearch && resViewData.apiProductSearch.category){   
        var brandName = req.querystring.preferences['cdw-tools-brand-name'];
        var currentCategoryID = resViewData.apiProductSearch.category.ID;
        var origCatIdTemp = brandName + '-' +currentCategoryID;
        origCatId = origCatIdTemp.replace(/ /g, '-').toLowerCase();
    }

    if(!empty(origCatId) || (resViewData.apiProductSearch && resViewData.apiProductSearch.category && 
                                resViewData.apiProductSearch.category.custom && 
                                    'showSubCategories' in resViewData.apiProductSearch.category.custom && 
                                        resViewData.apiProductSearch.category.custom.showSubCategories)) {

            
            if(!empty(origCatId)) {
                var CatalogMgr = require('dw/catalog/CatalogMgr');
                var subCat = CatalogMgr.getCategory(origCatId); 
                if(!empty(subCat) && 'showSubCategories' in subCat.custom && 
                                        subCat.custom.showSubCategories) {
                    res.setViewData({
                        showSubCategories: true,
                        showSubCatName: subCat.displayName,
                        subCategoriesToShow: subCat.subCategories
                    });
                }

                if(!empty(subCat) && 'displayThisCategoryName' in subCat.custom && 
                        subCat.custom.displayThisCategoryName) {
                            h1CatLevelString = subCat.displayName;
                }

                if(!empty(subCat) && 'slotBannerImage' in subCat.custom && 
                                        subCat.custom.slotBannerImage) {
                    res.setViewData({
                        showOrignialslotBannerImage: true,
                        orignialslotBannerImage: subCat.custom.slotBannerImage
                    });
                }          
                if(!empty(subCat) && 'slotBannerStyle' in subCat.custom && 
                                        subCat.custom.slotBannerStyle) {
                    res.setViewData({
                        slotBannerStyle: subCat.custom.slotBannerStyle
                    });
                }      
                res.setViewData({
                    origCategoryObject: subCat
                });                                
            }  else{
                var subCategoriesToShow;
                if(empty(req.querystring.preferences)) {
                    subCategoriesToShow = resViewData.apiProductSearch.category.subCategories;
                }
                res.setViewData({
                    showSubCategories: true,
                    showSubCatName: resViewData.apiProductSearch.category.displayName,
                    subCategoriesToShow: subCategoriesToShow,
                    slotBannerStyle: resViewData.apiProductSearch.category.custom.slotBannerStyle
                });

            }        
    }
    /** Check if the origCatId is present or if the incoming category has the subCategories flag enable to pupulate the sub-cats -- ENDS*/    

    /**
     * Logic to get the breadcrumbs for category pages - BEGINS
     */
    if(resViewData.productSearch && resViewData.productSearch.category) {
        var breadcrumbHome = [
            {
                htmlValue: Resource.msg('global.home', 'common', null),
                url: URLUtils.home().toString()
            }
        ];
        
        breadcrumbs = productHelper.getAllBreadcrumbs(resViewData.productSearch.category.id, null, []).reverse();
        breadcrumbs = breadcrumbHome.concat(breadcrumbs);
        res.setViewData({
            breadcrumbs: breadcrumbs
        });
    }
    /** Logic to get the breadcrumbs for category pages - ENDS */


    /* BEGIN: code for All Brands Landing Page */
    var view = res.view;
    if(view!=undefined && view!=null && view == 'rendering/category/allBrandLanding' && resViewData.productSearch && resViewData.productSearch.category){
        
        var categoryHelper = require('*/cartridge/scripts/helpers/categoryHelper.js');
        var sortedCategoriesMap = categoryHelper.getAllBrandCategories(resViewData.productSearch.category.id);
        var categoryAlphabets = categoryHelper.getCategoryAlphabets(sortedCategoriesMap);

        res.setViewData({
            sortedCategoriesMap: sortedCategoriesMap,
            categoryAlphabets: categoryAlphabets
        });
    }
    /* END: code for All Brands Landing Page */

    /**
     * Logic below  to handle alt url when the category is not selected to show in navigation
     */
    // if(resViewData.apiProductSearch.category && resViewData.apiProductSearch.category.custom && 'alternativeUrl' in resViewData.apiProductSearch.category.custom && resViewData.apiProductSearch.category.custom.alternativeUrl) {
    //     var altUrl = resViewData.apiProductSearch.category.custom.alternativeUrl;
    //     altUrl = resViewData.apiProductSearch.category.custom.alternativeUrl.toString().replace(/&amp;/g, '&');
    //     if('showSubCategories' in resViewData.apiProductSearch.category.custom && resViewData.apiProductSearch.category.custom.showSubCategories) { // Condition to check if the incoming categories requires to show sub-categories too
    //         if(altUrl.includes("?")) {
    //             res.redirect(altUrl+"&oci="+resViewData.apiProductSearch.category.ID);
    //         }else {
    //             res.redirect(altUrl+"?oci="+resViewData.apiProductSearch.category.ID);
    //         }
            
    //     }else {
    //         res.redirect(altUrl);
    //     }        
    // }

    /**
     * Logic to include the promotion details when promotion ID is present in the response
     */
    if(resViewData.apiProductSearch && resViewData.apiProductSearch.promotionID){
        var promoId = resViewData.apiProductSearch.promotionID;
        if(promoId != '' && promoId != undefined) {
            var promotionObj = PromotionMgr.getPromotion(promoId);
            res.setViewData({
                promoDetails: promotionObj,
                promoListing: true
            });
        }
        
    }

    /**
     * Logic to handle the H1 String if its forwarded with the AltURL with Brand Attribute selected
     */
    if(resViewData.productSearch && resViewData.productSearch.isCategorySearch) {
        res.setViewData({
            refinementIncludedH1: SearchHelper.getGeneratedH1String(req.querystring)+" "+resViewData.productSearch.category.name
        });
        if(h1CatLevelString) {
            res.setViewData({
                refinementIncludedH1: h1CatLevelString
            });  
        }

        //Set an attribute to check if the reuqest is refined
        if(!empty(req.querystring) && !empty(req.querystring.preferences)) {
            res.setViewData({
                refinedPage: true,
                refinedKey: SearchHelper.getGeneratedRefinedKey(req.querystring)+"-"+resViewData.productSearch.category.name
            });  

            var refinedPageTitle = SearchHelper.getGeneratedH1String(req.querystring)+" "+resViewData.productSearch.category.name;
            if(!empty(refinedPageTitle)) {
                var CurrentPageMetaDataNew = resViewData.CurrentPageMetaData;
                CurrentPageMetaDataNew.title = refinedPageTitle;
                res.setViewData({
                    CurrentPageMetaData: CurrentPageMetaDataNew
                });  
    
            }
        }

        /**
         * Logic to handle category banner underneath the header and the global banner -- START
         */
        if (resViewData.apiProductSearch && resViewData.apiProductSearch.category && 
                resViewData.apiProductSearch.category.custom && 
                'contentBannerAssetIds' in resViewData.apiProductSearch.category.custom) {
                    res.setViewData({
                        contentBannerAssetIds: resViewData.apiProductSearch.category.custom.contentBannerAssetIds
                    });  
        }

        if (resViewData.apiProductSearch && resViewData.apiProductSearch.category && 
            resViewData.apiProductSearch.category.custom && 
            'displayCommonBanner' in resViewData.apiProductSearch.category.custom) {
                res.setViewData({
                    displayCommonBanner: resViewData.apiProductSearch.category.custom.displayCommonBanner
                });  
        }        
        /**
         * Logic to handle category banner underneath the header and the global banner -- END
         */

    }



    /**
     * Logic to handle Exact SKU Search to PDP
     */
     if(resViewData.productSearch ) {
        var productSearch = resViewData.productSearch;
        if(productSearch.productIds.length ===1)
        {
            var product = productSearch.productIds[0].productSearchHit.product;
            var productSKU = product.ID;
            if(!empty(product.custom) && 'custom' in product && 'searchablePartNumber' in product.custom) {
                 productSKU = product.custom.searchablePartNumber;
            }
            
            if(productSearch.searchKeywords  && (productSKU.toLowerCase() === productSearch.searchKeywords.toLowerCase()
                                                || productSearch.searchKeywords.toLowerCase() === product.ID))
            {
                var canonicalUrl = URLUtils.url('Product-Show', 'pid', product.ID);
                res.redirect(canonicalUrl);
            }
        }
    }
    if(!empty(resViewData.canonicalUrl) && resViewData.canonicalUrl.toString().includes('undefined') ) {
        res.setViewData({
            canonicalUrl: null
        });  
    }

    next();
}, 
pageMetaData.computedPageMetaData
);

/**
 * Search-ShowAjax : This endpoint is called when a shopper click on any of the refinement eg. color, size, categories
 * @name Base/Search-ShowAjax
 * @function
 * @memberof Search
 * @param {middleware} - cache.applyShortPromotionSensitiveCache
 * @param {middleware} - consentTracking.consent
 * @param {querystringparameter} - cgid - Category ID
 * @param {querystringparameter} - q - query string a shopper is searching for
 * @param {querystringparameter} - prefn1, prefn2 ... prefn(n) - Names of the selected preferences e.g. refinementColor. These will be added to the query parameters only when refinements are selected
 * @param {querystringparameter} - prefv1, prefv2 ... prefv(n) - Values of the selected preferences e.g. Blue. These will be added to the query parameters only when refinements are selected
 * @param {querystringparameter} - pmin - preference for minimum amount
 * @param {querystringparameter} - pmax - preference for maximum amount
 * @param {querystringparameter} - page
 * @param {querystringparameter} - selectedUrl - The URL generated with the query parameters included
 * @param {category} - non-sensitive
 * @param {serverfunction} - get
 */
 server.append('ShowAjax', cache.applyShortPromotionSensitiveCache, consentTracking.consent, function (req, res, next) {
    var viewData = res.viewData;
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var categoryHelper = require('*/cartridge/scripts/helpers/categoryHelper')
    var breadcrumbs;

    res.setViewData({
        slotBannerStyle: ""
    });

    var tempOrigCatId;
    if (!empty(req.querystring.preferences) && 'cdw-tools-brand-name' in req.querystring.preferences && viewData.productSearch && viewData.productSearch.isCategorySearch) { // This is from the SEO Direct link or refresh of the page after the brand filters selected
        var catId = viewData.productSearch.category.id;
        if(catId == "categories") {
             tempOrigCatId = categoryHelper.getGeneratedKeyWithFilters(req.querystring).toString().replace(/ /g, '-' ).toLowerCase();
        } else {
             tempOrigCatId = categoryHelper.getGeneratedKeyWithFilters(req.querystring).toString().replace(/ /g, '-' ).toLowerCase()+"-"+catId.toString().replace(/ /g, '-' ).toLowerCase();
        }

    }

    if((viewData.productSearch && viewData.productSearch.isCategorySearch 
        &&  viewData.apiProductSearch.category.custom 
        &&  'showSubCategories' in viewData.apiProductSearch.category.custom 
        &&  viewData.apiProductSearch.category.custom.showSubCategories) || !empty(tempOrigCatId)) {
            var subCategoriesToShow;
            var showSubCatName = viewData.apiProductSearch.category.displayName;
            
            if(!empty(req.querystring.preferences)) {
                res.setViewData({
                    refinedPage: true,
                    refinedKey: categoryHelper.getGeneratedRefinedKey(req.querystring)+"-"+viewData.productSearch.category.name
                });  
            } else {
                 subCategoriesToShow = viewData.apiProductSearch.category.subCategories;
                 showSubCatName = viewData.apiProductSearch.category.displayName;
            }

            if(!empty(tempOrigCatId)) {
                var CatalogMgr = require('dw/catalog/CatalogMgr');
                var originalCategory = CatalogMgr.getCategory(tempOrigCatId); 
        
                if(!empty(originalCategory) && !empty(originalCategory.custom) && "showSubCategories" in originalCategory.custom && originalCategory.custom.showSubCategories) {
                    showSubCatName = originalCategory.displayName;
                    subCategoriesToShow = originalCategory.subCategories;
                }
            }

            res.setViewData({
                showSubCatName: showSubCatName,
                showSubCategories: true,
                subCategoriesToShow: subCategoriesToShow
            });
    }
    /**
     * Below logic needs to be handled
     *  - Generate the H1 Tag and update
     *  - Generate the Canonical URL and update
     *  - get the content for the image and update the search banner image
     *  - If there are no preferences, then update the H1 to Category one
     */
    if(viewData.productSearch.isCategorySearch) {
        res.setViewData({
            refinementIncludedH1: SearchHelper.getGeneratedH1String(req.querystring)+" "+viewData.productSearch.category.name
        });

        //Set an attribute to check if the reuqest is refined
        if(!empty(req.querystring) && !empty(req.querystring.preferences)) {
            res.setViewData({
                refinedPage: true,
                refinedKey: SearchHelper.getGeneratedRefinedKey(req.querystring)+"-"+viewData.productSearch.category.name
            });  
        }
    }

    /**
     * Logic to get the breadcrumbs for category pages - BEGINS
     */
     if(viewData.productSearch && viewData.productSearch.category) {
        var breadcrumbHome = [
            {
                htmlValue: Resource.msg('global.home', 'common', null),
                url: URLUtils.home().toString()
            }
        ];
        
        breadcrumbs = productHelper.getAllBreadcrumbs(viewData.productSearch.category.id, null, []).reverse();
        breadcrumbs = breadcrumbHome.concat(breadcrumbs);
        res.setViewData({
            breadcrumbs: breadcrumbs
        });
    }
    /** Logic to get the breadcrumbs for category pages - ENDS */    

    if(!empty(viewData.productSearch.category) && viewData.productSearch.productSearch.category.custom && 'slotBannerStyle' in viewData.productSearch.productSearch.category.custom && 
                            viewData.productSearch.productSearch.category.custom.slotBannerStyle) {
        res.setViewData({
            slotBannerStyle: viewData.productSearch.productSearch.category.custom.slotBannerStyle
        });
    } 


    /**
     * Logic to include the promotion details when promotion ID is present in the response
     */
         if(viewData.apiProductSearch && viewData.apiProductSearch.promotionID){
            var promoId = viewData.apiProductSearch.promotionID;
            if(promoId != '' && promoId != undefined) {
                var promotionObj = PromotionMgr.getPromotion(promoId);
                res.setViewData({
                    promoDetails: promotionObj,
                    promoListing: true
                });
            }
            
        }

    return next();
}, pageMetaData.computedPageMetaData);


/**
 * Search-UpdateGrid : This endpoint is called when the shopper changes the "Sort Order" or clicks "More Results" on the Product List page
 * @name Base/Search-UpdateGrid
 * @function
 * @memberof Search
 * @param {querystringparameter} - cgid - Category ID
 * @param {querystringparameter} - srule - Sort Rule ID
 * @param {querystringparameter} - start - Offset of the Page
 * @param {querystringparameter} - sz - Number of Products to Show on the List Page
 * @param {querystringparameter} - prefn1, prefn2 ... prefn(n) - Names of the selected preferences e.g. refinementColor. These will be added to the query parameters only when refinements are selected
 * @param {querystringparameter} - prefv1, prefv2 ... prefv(n) - Values of the selected preferences e.g. Blue. These will be added to the query parameters only when refinements are selected
 * @param {querystringparameter} - selectedUrl - The URL generated with the query parameters included
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
 server.prepend('UpdateGrid', function (req, res, next) {

    if(!empty(req.querystring.srule)) {
        session.custom.sortRule = req.querystring.srule;
    }

     next();
 });



/**
 * Search-UpdateGrid : This endpoint is called when the shopper changes the "Sort Order" or clicks "More Results" on the Product List page
 * @name Base/Search-UpdateGrid
 * @function
 * @memberof Search
 * @param {querystringparameter} - cgid - Category ID
 * @param {querystringparameter} - srule - Sort Rule ID
 * @param {querystringparameter} - start - Offset of the Page
 * @param {querystringparameter} - sz - Number of Products to Show on the List Page
 * @param {querystringparameter} - prefn1, prefn2 ... prefn(n) - Names of the selected preferences e.g. refinementColor. These will be added to the query parameters only when refinements are selected
 * @param {querystringparameter} - prefv1, prefv2 ... prefv(n) - Values of the selected preferences e.g. Blue. These will be added to the query parameters only when refinements are selected
 * @param {querystringparameter} - selectedUrl - The URL generated with the query parameters included
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
 server.append('UpdateGrid', function (req, res, next) {

    var resViewData = res.viewData;
    
    if(!empty(resViewData.productSearch) && !empty(resViewData.productSearch.showMoreUrl)) {

        for(var i=0;i<resViewData.productSearch.showMoreUrl.length;i++) {
            var paginationObj = resViewData.productSearch.showMoreUrl[i];
            if(paginationObj.pageSelected) {
                res.setViewData({
                    paginationCanonicalUrl: paginationObj.fullPageUrl
                });
            }
        }

    }


    
     next();
 });
module.exports = server.exports();
