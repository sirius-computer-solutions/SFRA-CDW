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

    // module.superModule.render(context, model);

    var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');
    model = searchHelper.pageDesignerSearch(model, content);


    // Component Regions
    var gridCol = '4';
    if (content.displayFormat && content.displayFormat.value === 'row') {
        gridCol = '12';
    }
    model.gridClassName = 'region col-6 col-sm-' + gridCol;
    model.isEditMode = PageRenderHelper.isInEditMode();



    return new Template('experience/components/dynamic/productList/productList.isml').render(model).text;
};
