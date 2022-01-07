'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var ImageTransformation = require('*/cartridge/experience/utilities/ImageTransformation.js');


/**
 * Render logic for storefront.imageAndText component.
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commcerce Cloud Plattform.
 *
 * @returns {string} The markup to be displayed
 */
module.exports.render = function (context, modelIn) {
    var model = modelIn || new HashMap();
    var content = context.content;

    model.ITCText = content.ITCText ? content.ITCText : null;
    model.image = content.image ? ImageTransformation.getScaledImage(content.image) : null;
    model.imageLink = content.imageLink ? content.imageLink : null;
    model.alt = content.alt ? content.alt : null;
    model.textOverLayOrientation = content.textOverLayOrientation ? content.textOverLayOrientation : null;
    model.overlayImage = content.overlayImage ? ImageTransformation.getScaledImage(content.overlayImage) : null;
    
    
    if(!empty(content.imageTextOverLay1)) {
        var imageTextOverLay1 = content.imageTextOverLay1.replace("<p>", '').replace("</p>", '');
        model.imageTextOverlay1 = imageTextOverLay1;
    }
    if(!empty(content.imageTextOverLay2)) {
        var imageTextOverLay2 = (content.imageTextOverLay2.replace("<p>", '')).replace("</p>", '');
        model.imageTextOverlay2 = imageTextOverLay2;
    }

    // if(!empty(content.imageTextOverLayOrientation)) {
    //     var imageTextOverLayOrientation = content.imageTextOverLayOrientation;
    //     model.imageTextOverLayOrientation = imageTextOverLayOrientation;
    // }
    

    model.textOverlay1 = content.textOverlay1 ? content.textOverlay1 : null;
    model.textOverlayLink1 = content.textOverlayLink1 ? content.textOverlayLink1 : null;
    model.textOverlayButtonColor1 = content.textOverlayButtonColor1 ? content.textOverlayButtonColor1 : null;

    model.textOverlay2 = content.textOverlay2 ? content.textOverlay2 : null;
    model.textOverlayLink2= content.textOverlayLink2 ? content.textOverlayLink2 : null;
    model.textOverlayButtonColor2 = content.textOverlayButtonColor2 ? content.textOverlayButtonColor2 : null;
    
    model.textOverlay3 = content.textOverlay3 ? content.textOverlay3 : null;
    model.textOverlayLink3 = content.textOverlayLink3 ? content.textOverlayLink3 : null;
    model.textOverlayButtonColor3 = content.textOverlayButtonColor3 ? content.textOverlayButtonColor3 : null;

    model.textOverlay4 = content.textOverlay4 ? content.textOverlay4 : null;
    model.textOverlayLink4 = content.textOverlayLink4 ? content.textOverlayLink4 : null;
    model.textOverlayButtonColor4 = content.textOverlayButtonColor4 ? content.textOverlayButtonColor4 : null;




    return new Template('experience/components/commerce_assets/productListTile').render(model).text;
};
