'use strict';

/* global request */

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

/**
 * Render logic for the product list component
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commcerce Cloud Plattform.
 *
 * @returns {string} The markup to be displayed
 */
module.exports.render = function (context, modelIn) {
    var model = modelIn || new HashMap();

    var component = context.component;
    model.component = component;
    model.regions = PageRenderHelper.getRegionModelRegistry(component);
    var content = context.content;
    model.categoryId = content.category.getID();

    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var ProductSearchModel = require('dw/catalog/ProductSearchModel');
    var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');
    var ProductSearch = require('*/cartridge/models/search/productSearch');
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var URLUtils = require('dw/web/URLUtils');
    var Resource = require('dw/web/Resource');
    var breadcrumbs;

    var apiProductSearch = new ProductSearchModel();
    var params = { cgid: model.categoryId };
    apiProductSearch = searchHelper.setupSearch(apiProductSearch, params);
    var sortingRule = apiProductSearch.category.defaultSortingRule.ID;
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

 
    // var origCatId = req.querystring.oci;
    var origCatId = null;
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
                }
            }  else{
                model.showSubCategories = true;
                model.showSubCatName = apiProductSearch.category.displayName;
                model.subCategoriesToShow = apiProductSearch.category.subCategories;

            }        
    }

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

    /**
     * Logic to handle the H1 String if its forwarded with the AltURL with Brand Attribute selected
     */
    //  if(apiProductSearch.isCategorySearch) {
    //         model.refinementIncludedH1 = SearchHelper.getGeneratedH1String(req)+" "+resViewData.productSearch.category.name
    //  }    

    // Component Regions
    var gridCol = '4';
    if (content.displayFormat && content.displayFormat.value === 'row') {
        gridCol = '12';
    }
    model.gridClassName = 'region col-6 col-sm-' + gridCol;
    model.isEditMode = PageRenderHelper.isInEditMode();

    return new Template('experience/components/dynamic/productList/productList.isml').render(model).text;
};
