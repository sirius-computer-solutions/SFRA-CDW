'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

/**
 * Render logic for the storepage.
 *
 * @param {dw.experience.PageScriptContext} context The page script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commcerce Cloud Plattform.
 *
 * @returns {string} The markup to be displayed
 */
module.exports.render = function (context, modelIn) {
    var model = modelIn || new HashMap();

    var page = context.page;
    var content = context.content;
    model.page = page;
    model.content = context.content;

    if(!empty(context.renderParameters)) {
        var jsonRenderParams = JSON.parse(context.renderParameters);
        var canonicalUrl = jsonRenderParams.canonicalUrl;
        if(!empty(canonicalUrl)) {
            model.canonicalUrl = canonicalUrl;
        }
        var datalayer = jsonRenderParams.datalayer;
        if(!empty(datalayer)) {
            model.datalayer = datalayer;
        }
    }
    
    // render the page
    return module.superModule.render(context, model);
};
