'use strict';

module.exports = function (object, product) {
    var longDesc = null;
    if('custom' in product && 'acme-tools-override-marketing-copy' in product.custom && product.custom['acme-tools-override-marketing-copy']!=null)
    {
        var overrideLongDesc = product.custom['acme-tools-override-marketing-copy'];
        if(overrideLongDesc.toString().trim()!=''){
            longDesc = overrideLongDesc;
        }
        else if(product.longDescription){
            longDesc = product.longDescription.markup;
        }
    }
    else if(product.longDescription){
        longDesc = product.longDescription.markup;
    }
    Object.defineProperty(object, 'longDescription', {
        enumerable: true,
        value: longDesc
    });
    Object.defineProperty(object, 'shortDescription', {
        enumerable: true,
        value: product.shortDescription ? product.shortDescription.markup : null
    });
};
