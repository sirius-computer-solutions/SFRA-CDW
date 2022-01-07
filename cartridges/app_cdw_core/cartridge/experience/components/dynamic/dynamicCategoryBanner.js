'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var ImageTransformation = require('*/cartridge/experience/utilities/ImageTransformation.js');
var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');


/**
 * Render logic for the storefront.popularCategories.
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commcerce Cloud Plattform.
 *
 * @returns {string} The markup to be displayed
 */
 module.exports.render = function (context, modelIn) {
    var model = modelIn || new HashMap();
    var content = context.content;
    var QueryString = require('../../../../../modules/server/queryString');
    var qParams = new QueryString(content.queryString);
    var categoryHelper = require('*/cartridge/scripts/helpers/categoryHelper')
        model.slotBannerStyle = "";
        
        /** Logic to habndle the BRAND search with showSubCategories START */
        var origCatId = qParams.oci;
        if(!empty(origCatId)) {
                var CatalogMgr = require('dw/catalog/CatalogMgr');
                var subCat = CatalogMgr.getCategory(origCatId); 

                if(!empty(subCat) && 'slotBannerImage' in subCat.custom && 
                                        subCat.custom.slotBannerImage) {
                        model.showOrignialslotBannerImage = true;
                        model.orignialslotBannerImage = subCat.custom.slotBannerImage;
                        model.heading = subCat.getDisplayName();
                }   
                if(!empty(subCat) && 'slotBannerStyle' in subCat.custom && 
                                        subCat.custom.slotBannerStyle) {
                        model.slotBannerStyle = subCat.custom.slotBannerStyle;
                }                

        } else {
            if(!empty(content.category) && 'slotBannerStyle' in content.category.custom && 
                                            content.category.custom.slotBannerStyle) {
                        model.slotBannerStyle = content.category.custom.slotBannerStyle;
            }  
            if(!empty(content.category) && 'slotBannerImage' in content.category.custom && 
                                            content.category.custom.slotBannerImage) {
                        model.slotBannerImage = content.category.custom.slotBannerImage;
            }              
        }

        if(!empty(qParams) && !empty(qParams.preferences)) {
            model.refinedPage = true;
            model.refinedKey =  categoryHelper.getGeneratedRefinedKey(qParams)+"-"+content.category.displayName;
        }


    return module.superModule.render(context, model);
};