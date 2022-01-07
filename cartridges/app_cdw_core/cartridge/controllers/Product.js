'use strict';

var server = require('server');
var URLUtils = require('dw/web/URLUtils');
var Site = require('dw/system/Site');
var Resource = require('dw/web/Resource');
var cache = require('*/cartridge/scripts/middleware/cache');

server.extend(module.superModule);

var varsityHelper = require('~/cartridge/scripts/helpers/varsityHelper');
var dateHelper = require('*/cartridge/scripts/helpers/dateHelper');

server.get('GetInventory', cache.applycdwInventorySensitiveCache, function (req, res, next) {
    
    var productParams = {};
    Object.keys(req.querystring).forEach(function (key) {
        productParams[key] = req.querystring[key];
    });

    var productId = productParams.pid;
    var product = Object.create(null);
    var ProductMgr = require('dw/catalog/ProductMgr');
    var apiProduct = ProductMgr.getProduct(productId);
    if (apiProduct === null) {
        return product;
    }
    var decorators = require('*/cartridge/models/product/decorators/index');
    if(!apiProduct.custom || !"w1call" in apiProduct.custom || !apiProduct.custom.w1call  || (apiProduct.custom.w1call !== "Y" && apiProduct.custom.w1call !== true) ) {
        decorators.availability(product, 1, apiProduct.minOrderQuantity.value, apiProduct.availabilityModel);
    }
    decorators.readyToOrder(product, "");
    var context = {
        product:product,
        callingPage:productParams.callingPage,
        isCallForPriceProduct:productParams.isCallForPriceProduct,
        shipsTruck:productParams.shipsTruck
     };
    res.render('product/components/availability',context);
    next();
});

server.get('GetPrice', cache.applycdwPriceSensitiveCache, function (req, res, next) {
    var productParams = {};
    Object.keys(req.querystring).forEach(function (key) {
        productParams[key] = req.querystring[key];
    });

    var productId = productParams.pid;
    var product = Object.create(null);
    var ProductMgr = require('dw/catalog/ProductMgr');
    var apiProduct = ProductMgr.getProduct(productId);
    if (apiProduct === null) {
        return product;
    }
    var decorators = require('*/cartridge/models/product/decorators/index');
    if(!apiProduct.custom || !"w1call" in apiProduct.custom || !apiProduct.custom.w1call  || (apiProduct.custom.w1call !== "Y" && apiProduct.custom.w1call !== true) ) {
        var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
        var options = productHelper.getConfig(apiProduct, productParams);
        decorators.price(product, apiProduct, options.promotions, false, options.optionModel);
    }
    var context = {
        product:product,
        display:productParams};
    res.render('product/components/pricing/default',context);
    next();
});

server.get('GetPriceForPDP', function (req, res, next) {
    var productParams = {};
    Object.keys(req.querystring).forEach(function (key) {
        productParams[key] = req.querystring[key];
    });

    var productId = productParams.pid;
    var product = Object.create(null);
    var ProductMgr = require('dw/catalog/ProductMgr');
    var apiProduct = ProductMgr.getProduct(productId);
    if (apiProduct === null) {
        return product;
    }
    var rebateForm = "";
    if(apiProduct && 'custom' in apiProduct && 'rebate-form-pdf' in apiProduct.custom) {
        rebateForm = apiProduct.custom['rebate-form-pdf'];
    }
    var decorators = require('*/cartridge/models/product/decorators/index');
    if(!apiProduct.custom || !"w1call" in apiProduct.custom || !apiProduct.custom.w1call  || (apiProduct.custom.w1call !== "Y" && apiProduct.custom.w1call !== true) ) {
        var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
        var options = productHelper.getConfig(apiProduct, productParams);
        decorators.price(product, apiProduct, options.promotions, false, options.optionModel);
    }
    var context = {
        product:product,
        rebateForm:rebateForm,
        display:productParams };
    res.render('product/components/pricing/default',context);
    next();
});

server.prepend('Show',  function (req, res, next) {
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var showProductPageHelperResult = productHelper.showProductPage(req.querystring, req.pageMetaData);
    var productType = showProductPageHelperResult.product.productType;
    if (!showProductPageHelperResult.product.online && productType !== 'set' && productType !== 'bundle') {
        res.setStatusCode(200);
        res.render('error/notFound');
        this.emit('route:Complete', req, res);
        return;
    }
    next();
});

server.get('GetArrivalDate', cache.applycdwArrivalDateSensitiveCache, function (req, res, next) {
    var qs = res.viewData.queryString;
    if(qs) {
        var params = qs.split('=');
        var geoZipCode = params[1];
    }
    
    if(!geoZipCode) {

        geoZipCode = request.httpCookies.zipCode ? request.httpCookies.zipCode.value : request.geolocation.postalCode;
    }

    if(geoZipCode) {
        var jsonResponse = varsityHelper.getVarsityResponse(geoZipCode);
        var serviceType = Site.current.getCustomPreferenceValue('carrierServiceType');
        var rangeStart = Site.current.getCustomPreferenceValue('estimatedDateRange');
        var rangeEnd = Site.current.getCustomPreferenceValue('estimatedDaysToPad');

        if(jsonResponse != null && !jsonResponse.error) {
            var dateRange = varsityHelper.getEstimatedDateRange(jsonResponse, true, serviceType, rangeStart, rangeEnd);
            var {
               estStartDate,
               estEndDate
            } = dateRange;
            estStartDate = dateHelper.formatEstimatedDate(estStartDate);
            estEndDate = dateHelper.formatEstimatedDate(estEndDate);
            res.render('product/components/estimatedArrival',{startDate:estStartDate, endDate:estEndDate, shippingType:Site.current.getCustomPreferenceValue('carrierDescription'), zipCode:geoZipCode});
         } else {
            res.render('product/components/estimatedArrival',{varsityError: "true", responseObj: jsonResponse.serverErrors});
         }
    } else {
        res.render('product/components/estimatedArrival');
    }
    next();
});
/**
 * Product-ValidateQty: This endpoint is called to validate the inventory
 * @param {querystringparameter} - pid - product ID
 * @param {querystringparameter} - quantity - selected quantity
 */
server.get('ValidateQty', function (req, res, next) {
    var ProductAvailability = require('*/cartridge/scripts/factories/productAvailability');
    var params = req.querystring;
    var availability = ProductAvailability.get(params);
    res.json({
        productAvailability: availability
    });

    next();
});

server.append('Show', function (req, res, next) {
    var viewData = res.getViewData();

    /** Adding Home Breadcrumb BEGIN */
    var breadcrumbs;
    var breadcrumbHome = [
        {
            htmlValue: Resource.msg('global.home', 'common', null),
            url: URLUtils.home().toString()
        }
    ];

    var productName = '';
    if(viewData && viewData.product && viewData.product.productName){
        productName = viewData.product.productName;
    }

    var breadcrumbPDP = [
        {
            htmlValue: productName,
            url: viewData.canonicalUrl!=null ? viewData.canonicalUrl.toString() :''
        }
    ];    
    breadcrumbs = breadcrumbHome.concat(viewData.breadcrumbs);
    breadcrumbs = breadcrumbs.concat(breadcrumbPDP);
    
    viewData.breadcrumbs = breadcrumbs;
    /** Adding Home Breadcrumb END */

    /** Adding the default radius from the configuration BEGINS */
    var defaultRadius = Site.current.getCustomPreferenceValue('storeLocatorDefaultRadius');
    viewData.pickUpInStore = {
        actionUrl: URLUtils.url('Stores-InventorySearch', 'showMap', false, 'horizontalView', true, 'isForm', true, 'radius', defaultRadius).toString(),
        atsActionUrl: URLUtils.url('Stores-getAtsValue').toString()
    };
    /** Adding the default radius from the configuration ENDS */


    /** Handle the BOPS addToCart enabble/disable based on the value START */
    if(!empty(session.custom.bopisStore)) {
        var instorePUstoreHelpers = require('*/cartridge/scripts/helpers/instorePickupStoreHelpers');
        var instoreInventory = instorePUstoreHelpers.getStoreInventory(session.custom.bopisStore, viewData.product.id, 1);
        if(instoreInventory > 0) {
            viewData.availabilityForSelectedStore =  Resource.msg('store.product.inventory.available', 'storeLocator', null);
        }else {
            viewData.availabilityForSelectedStore =  Resource.msg('store.product.inventory.not.available', 'storeLocator', null);
        }
        
    }
    /** Handle the BOPS addToCart enabble/disable based on the value END */

    /** Logic to enable the right Brand Link START */
    var productObj = viewData.product;
    var brandName;
    //Get the brand name for this product
    if(productObj && !empty(productObj.attributes)) {
        for(var i=0;i<productObj.attributes.length;i++){
            var attrGroup = productObj.attributes[i];
            if(attrGroup.ID === 'Specifications') {
                 var attrs = attrGroup.attributes;
                 for(var j=0;j<attrs.length;j++) {
                    if(attrs[j].ID === 'cdw-tools-brand-name') {
                        brandName = attrs[j].value;
                    }
                 }
                break;
            }
        }

    }

    if(!empty(brandName) && brandName.length >0) {
        // brandName = brandName.toString().toLowerCase().replace(/ /g, '-');
        var CatalogMgr = require('dw/catalog/CatalogMgr');
        var updatedBrandName = brandName[0].toLowerCase();
        updatedBrandName = updatedBrandName.replace(/ /g, '-');
        //Check if the brand name category is present
        var brandCategory = CatalogMgr.getCategory(updatedBrandName);
        if(!empty(brandCategory) && brandCategory.custom && 'alternativeUrl' in brandCategory.custom && brandCategory.custom.alternativeUrl) {
            var altUrl = brandCategory.custom.alternativeUrl.markup;

            if(altUrl.includes("?")) {
                altUrl = altUrl+"&oci="+brandCategory.ID;
            }else {
                altUrl = altUrl+"?oci="+brandCategory.ID;
            }

            viewData.brandStoreURL =  altUrl;

        } else {
            viewData.brandStoreURL =  URLUtils.url('Search-Show', 'cgid', updatedBrandName);
        }
    }

    /** Logic to enable the right Brand Link END */

    /**
     * Logic to handle product level banner underneath the header and the global banner
     */
    if (productObj && productObj.contentBannerAssetIds) {
        res.setViewData({
            contentBannerAssetIds: productObj.contentBannerAssetIds
        });  
    }
    if (productObj && productObj.displayCommonBanner) {
        res.setViewData({
            displayCommonBanner: productObj.displayCommonBanner
        });  
    }

    res.setViewData(viewData);
    next();
});

module.exports = server.exports();
