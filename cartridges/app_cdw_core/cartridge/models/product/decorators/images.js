'use strict';

var ImageModel = require('*/cartridge/models/product/productImages');
var ArrayList = require('dw/util/ArrayList');

module.exports = function (object, product, config) {
    var images = new ImageModel(product, config);
    //Reversing the image order
    if(images!=null && 'large' in images)
    {
        var imageJSONString = '[';
        for(var k=images.large.length-1;k>=0;k--)
        {
            imageJSONString = imageJSONString + JSON.stringify(images.large[k]);
            if(k>0) imageJSONString = imageJSONString + ',';
           
        }
        imageJSONString = imageJSONString + ']';
        images.large = JSON.parse(imageJSONString);
    }
    if(images!=null && 'medium' in images)
    {
        var imageJSONString = '[';
        for(var k=images.medium.length-1;k>=0;k--)
        {
            imageJSONString = imageJSONString + JSON.stringify(images.medium[k]);
            if(k>0) imageJSONString = imageJSONString + ',';
        }
        imageJSONString = imageJSONString + ']';
        images.medium = JSON.parse(imageJSONString);
    }

    if(images!=null && 'small' in images)
    {
        var imageJSONString = '[';
        for(var k=images.small.length-1;k>=0;k--)
        {
            imageJSONString = imageJSONString + JSON.stringify(images.small[k]);
            if(k>0) imageJSONString = imageJSONString + ',';
        }
        imageJSONString = imageJSONString + ']';
        images.small = JSON.parse(imageJSONString);
    }
        
    Object.defineProperty(object, 'images', {
        enumerable: true,
        value: images
    });

    var videoURLs = new ArrayList();
    var discontinued = false;
    var buyable = true;
    var productBrandName = '';
    var manufacturerSKU = "";
    var contentBannerAssetIds;
    var displayCommonBanner = false;

    var acmePartnumber = "";
    
    if('custom' in product && product.custom)
    {
        if('acme-tools-utube-video-1---url' in product.custom && product.custom['acme-tools-utube-video-1---url']!=null){
            videoURLs.add(product.custom['acme-tools-utube-video-1---url']);
        }
        if('acme-tools-utube-video-2---url' in product.custom && product.custom['acme-tools-utube-video-2---url']!=null){
            videoURLs.add(product.custom['acme-tools-utube-video-2---url']);
        }
        if('assembly-instruction-video-link---url' in product.custom && product.custom['assembly-instruction-video-link---url']!=null){
            videoURLs.add(product.custom['assembly-instruction-video-link-url']);
        }
    
        if('assembly-instruction-video-link-url' in product.custom && product.custom['assembly-instruction-video-link-url']!=null){
            videoURLs.add(product.custom['assembly-instruction-video-link-url']);
        }
        if('product-information-video-link---url' in product.custom && product.custom['product-information-video-link---url']!=null){
            videoURLs.add(product.custom['product-information-video-link---url']);
        }
        if('product-information-video-link-url' in product.custom && product.custom['product-information-video-link-url']!=null){
            videoURLs.add(product.custom['product-information-video-link-url']);
        }
        if('product-video-1---url' in product.custom && product.custom['product-video-1---url']!=null){
            videoURLs.add(product.custom['product-video-1---url']);    
        }
        if('product-installation-video-link---url' in product.custom && product.custom['product-installation-video-link---url']!=null){
            videoURLs.add(product.custom['product-installation-video-link---url']);    
        }
        if('product-installation-video-link---url' in product.custom && product.custom['product-installation-video-link---url']!=null){
            videoURLs.add(product.custom['product-installation-video-link---url']);
        }
        if('product-review-video-link-url' in product.custom && product.custom['product-review-video-link-url']!=null){
            videoURLs.add(product.custom['product-review-video-link-url']);        
        }
        if('product-review-video-link---url' in product.custom && product.custom['product-review-video-link---url']!=null){
            videoURLs.add(product.custom['product-review-video-link---url']);        
        }
        if( 'w1dscdt' in product.custom && product.custom['w1dscdt']!=null)
        {
            var disContinueDate = product.custom['w1dscdt'];
            if(disContinueDate.getTime() < new Date().getTime())
            {
                discontinued = true;
            }  
        } 
        if( 'w1buyable' in product.custom && (product.custom['w1buyable']==='N' || product.custom['w1buyable']==='NO' || product.custom['w1buyable']==='false' || product.custom['w1buyable']===false) )
        {
            buyable = false;
        }  
        if( 'acme-tools-brand-name' in product.custom)
        {
            productBrandName = product.custom['acme-tools-brand-name'];
        }    

        if(!empty(product.manufacturerSKU))
        {
            manufacturerSKU = product.manufacturerSKU;
        }else {
            manufacturerSKU = product.ID;
        }   

        if( 'contentBannerAssetIds' in product.custom)
        {
            contentBannerAssetIds = product.custom['contentBannerAssetIds'];
        }    

        if( 'displayCommonBanner' in product.custom)
        {
            displayCommonBanner = product.custom['displayCommonBanner'];
        }  
        if( 'acme-tools-part-number' in product.custom)
        {
            acmePartnumber = product.custom['acme-tools-part-number'];
        }          
        
    }
        
    Object.defineProperty(object, 'acmePartnumber', {
        enumerable: true,
        value: acmePartnumber
    });

    Object.defineProperty(object, 'video', {
        enumerable: true,
        value: videoURLs
    });

    Object.defineProperty(object, 'discontinued', {
        enumerable: true,
        value: discontinued
    });

    Object.defineProperty(object, 'buyable', {
        enumerable: true,
        value: buyable
    });

    Object.defineProperty(object, 'productBrandName', {
        enumerable: true,
        value: productBrandName
    });
    Object.defineProperty(object, 'manufacturerSKU', {
        enumerable: true,
        value: manufacturerSKU
    });    
    Object.defineProperty(object, 'contentBannerAssetIds', {
        enumerable: true,
        value: contentBannerAssetIds
    });    

    Object.defineProperty(object, 'contentBannerAssetIds', {
        enumerable: true,
        value: contentBannerAssetIds
    });  

    Object.defineProperty(object, 'displayCommonBanner', {
        enumerable: true,
        value: displayCommonBanner
    });  
    
};
