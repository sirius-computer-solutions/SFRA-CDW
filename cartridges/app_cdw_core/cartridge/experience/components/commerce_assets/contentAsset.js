'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var URLUtils = require('dw/web/URLUtils');
var ImageTransformation = require('*/cartridge/experience/utilities/ImageTransformation.js');

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
    model.contentAsset = content.contentAsset;

    var QueryString = require('../../../../../modules/server/queryString');
    var qParams = new QueryString(content.queryString);
    
    /** Logic to habndle the BRAND search with showSubCategories START */
    var origCatId = qParams.oci;

    var catObj = {};
    var cat = content.category;
    var contentAssetId;
    if (!empty(origCatId)) {
        contentAssetId = origCatId+"-"+content.contentAsset
    }else if (!empty(cat)) {
        contentAssetId = cat.ID+"-"+content.contentAsset
    } else {
        contentAssetId = content.contentAsset;
    }

    model.contentAssetId = contentAssetId;
    return new Template('experience/components/commerce_assets/contentAsset').render(model).text;
};
