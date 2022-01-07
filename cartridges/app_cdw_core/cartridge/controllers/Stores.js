'use strict';

var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var storeHelpers = require('*/cartridge/scripts/helpers/storeHelpers');
var Site = require('dw/system/Site');
var URLUtils = require('dw/web/URLUtils');
var Resource = require('dw/web/Resource');
server.extend(module.superModule);

server.replace('GetStoreById', cache.applyDefaultCache, function (req, res, next) {
    var StoreMgr = require('dw/catalog/StoreMgr');
    var StoreModel = require('*/cartridge/models/store');
    var storeId = req.querystring.storeId ? req.querystring.storeId : '';
    var storeObject = StoreMgr.getStore(storeId);
    var store = new StoreModel(storeObject);
    res.render('store/storeDetails', store);
    next();
});

/**
 *  Function to identify if customer in the geolocaiton of stores so that to display the BOPIS option in the page.
 */
server.get('ShowBOPIS', function (req, res, next) {
    var selectedStoreId = session.custom.bopisStore;
    var result= {};
    var productId = req.querystring.productId ? req.querystring.productId : '';
    var defaultRadius = Site.current.getCustomPreferenceValue('storeLocatorDefaultRadius');

    if(empty(selectedStoreId)) { //Its not present in session, so now check the Geo and see if geo is present in store radius

        var currentZipCode = request.geolocation.postalCode;
        /**TODO: Remove the hardcoded after testing */
        // var currentZipCode = "56601"
      
        if(!empty(currentZipCode)) {
            var lat = req.querystring.lat;
            var long = req.querystring.long;
        
            var prodObject = buildProductListAsJson(productId+":1");

            var url = URLUtils.url('Stores-FindStores', 'showMap', false, 'products', prodObject).toString();
            var storesModel = storeHelpers.getStores(defaultRadius, currentZipCode, lat, long, req.geolocation, false, url, prodObject);
            
            if(!empty(storesModel) && !empty(storesModel.stores)) {
                selectedStoreId = storesModel.stores[0].ID;
                session.custom.bopisStore = selectedStoreId;
                result.showBOPIS = true;
            }else {
                result.showBOPIS = false;
            }       
        }
    } else {
        result.showBOPIS = true;
    }

    res.render('product/components/pdpShowBOPIS', result);
    next();


});


server.get('PDPStoreDetails', function (req, res, next) {
    // session.custom.bopisStore = "140";
    var StoreMgr = require('dw/catalog/StoreMgr');
    var StoreModel = require('*/cartridge/models/store');
    var Resource = require('dw/web/Resource');
    var productId = req.querystring.productId ? req.querystring.productId : '';
    var selectedStoreId = session.custom.bopisStore;
    var result= {};
    var defaultRadius = Site.current.getCustomPreferenceValue('storeLocatorDefaultRadius');
    
    // selectedStoreId = "820";

    if(empty(selectedStoreId)) { //Its not present in session, so now check the Geo and see if geo is present in store radius

        var currentZipCode = request.geolocation.postalCode;
        /**TODO: Remove the hardcoded after testing */
        // var currentZipCode = "56601"
      
        if(!empty(currentZipCode)) {
            var lat = req.querystring.lat;
            var long = req.querystring.long;
        
            var prodObject = buildProductListAsJson(productId+":1");

            var url = URLUtils.url('Stores-FindStores', 'showMap', false, 'products', prodObject).toString();
            var storesModel = storeHelpers.getStores(defaultRadius, currentZipCode, lat, long, req.geolocation, false, url, prodObject);
            
            if(!empty(storesModel) && !empty(storesModel.stores)) {
                selectedStoreId = storesModel.stores[0].ID;
                session.custom.bopisStore = selectedStoreId;
            }       
        }
    }


    if(selectedStoreId) {
        //Get the store object
        var storeObject = StoreMgr.getStore(selectedStoreId);
        var store = new StoreModel(storeObject);

        //Now get the inventory for the given store and product ids
        var instorePUstoreHelpers = require('*/cartridge/scripts/helpers/instorePickupStoreHelpers');
        var instoreInventory = instorePUstoreHelpers.getStoreInventory(selectedStoreId, productId);
    
        result.store = store;
        var storeName = store.name.split("|");
        storeName = storeName[0].split(",");
        result.storeName = storeName;
        result.selectedStoreId = selectedStoreId;
        result.currentProductId = productId;

        if(!empty(instoreInventory) && instoreInventory > 0) {
            result.availabilityForSelectedStore = Resource.msg('store.product.inventory.available', 'storeLocator', null);
        }else {
            result.availabilityForSelectedStore = Resource.msg('store.product.inventory.not.available', 'storeLocator', null);
        }
        
        result.pickUpInStore= {};
   
    } 

    /** Adding the default radius from the configuration BEGINS */
    var defaultRadius = Site.current.getCustomPreferenceValue('storeLocatorDefaultRadius');
    result.pickUpInStore = {
        actionUrl: URLUtils.url('Stores-InventorySearch', 'showMap', false, 'horizontalView', true, 'isForm', true, 'radius', defaultRadius).toString(),
        atsActionUrl: URLUtils.url('Stores-getAtsValue').toString()
    };
    /** Adding the default radius from the configuration ENDS */     
    
    res.render('product/components/pdpInstoreInventory', result);
    next();
});



/**
 * Stores-Find : This endpoint is used to load the Find Stores page
 * @name Base/Stores-Find
 * @function
 * @memberof Stores
 * @param {middleware} - server.middleware.https
 * @param {middleware} - cache.applyDefaultCache
 * @param {middleware} - consentTracking
 * @param {querystringparameter} - radius - The radius that the shopper selected to refine the search
 * @param {querystringparameter} - postalCode - The postal code that the shopper used to search
 * @param {querystringparameter} - lat - The latitude of the shopper position
 * @param {querystringparameter} - long - The longitude of the shopper position
 * @param {querystringparameter} - showMap - A flag indicating whether or not map is to be shown
 * @param {querystringparameter} - horizontalView - Boolean value to show map in Horizontal View
 * @param {querystringparameter} - isForm - Boolean value to show (or not) the form to Find Stores
 * @param {category} - non-sensitive
 * @param {serverfunction} - get
 */
 server.append('Find', server.middleware.https, consentTracking.consent, function (req, res, next) {
    var radius = req.querystring.radius;
    var postalCode = req.querystring.postalCode;
    var lat = req.querystring.lat;
    var long = req.querystring.long;
    var showMap = req.querystring.showMap || false;
    var horizontalView = req.querystring.horizontalView || false;
    var isForm = req.querystring.isForm || false;

    var stores = storeHelpers.getStores(radius, postalCode, lat, long, req.geolocation, showMap);
    var viewData = {
        stores: stores,
        horizontalView: horizontalView,
        isForm: isForm,
        showMap: showMap,
        currentZipCode: request.geolocation.postalCode
    };

    res.render('storeLocator/storeLocator', viewData);

    /**
     * Page Meta data changes for location page -START
     */

     var computedMetaData = {
        title: Resource.msg('location.page.title', 'storeLocator', null),
        description: Resource.msg('location.page.description', 'storeLocator', null),
        keywords: Resource.msg('location.page.keywords', 'storeLocator', null),
        pageMetaTags: []
    };

    var pageGroup = {name: Resource.msg('location.page.pageGroup.name', 'storeLocator', null),
                    ID: Resource.msg('location.page.pageGroup.name', 'storeLocator', null),
                    content: Resource.msg('location.page.pageGroup.value', 'storeLocator', null)};
    var robots = {name: Resource.msg('location.page.robots.name', 'storeLocator', null),
                    ID: Resource.msg('location.page.robots.name', 'storeLocator', null),
                    content: Resource.msg('location.page.robots.value', 'storeLocator', null)};                    
    computedMetaData.pageMetaTags.push(pageGroup);
    computedMetaData.pageMetaTags.push(robots);

    res.setViewData({
        CurrentPageMetaData: computedMetaData
    });

    /**
     * Page Meta data changes for location page -END
     */

    next();
});

server.replace('InventorySearch', function (req, res, next) {
    var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');
    var URLUtils = require('dw/web/URLUtils');

    var radius = req.querystring.radius;
    // var postalCode = "58203";
    var postalCode = req.querystring.postalCode;
    if(empty(req.querystring.postalCode)) {
        postalCode = request.geolocation.postalCode;
    }
    
    var lat = req.querystring.lat;
    var long = req.querystring.long;
    var showMap = req.querystring.showMap || false;
    var horizontalView = req.querystring.horizontalView || false;
    var isForm = req.querystring.isForm || false;

    var products = buildProductListAsJson(req.querystring.products);

    var url = URLUtils.url('Stores-FindStores', 'showMap', showMap, 'products', req.querystring.products).toString();
    var storesModel = storeHelpers.getStores(radius, postalCode, lat, long, req.geolocation, showMap, url, products);

    var viewData = {
        stores: storesModel,
        horizontalView: horizontalView,
        isForm: isForm,
        showMap: showMap,
        currentZipCode: request.geolocation.postalCode
    };

    var storesResultsHtml = storesModel.stores
        ? renderTemplateHelper.getRenderedHtml(viewData, 'storeLocator/storeLocatorNoDecorator')
        : null;

    storesModel.storesResultsHtml = storesResultsHtml;
    res.json(storesModel);
    next();
});


server.prepend('getAtsValue', function (req, res, next) {
    var storeId = req.querystring.storeId;

    if(!empty(storeId)) {
        session.custom.bopisStore = storeId;
    }
    
    next();

});

server.append('getAtsValue', function (req, res, next) {
    var storeId = req.querystring.storeId;

    var StoreMgr = require('dw/catalog/StoreMgr');
    var StoreModel = require('*/cartridge/models/store');
    var Resource = require('dw/web/Resource');
    var storeObject = StoreMgr.getStore(storeId);
    var store = new StoreModel(storeObject);

    var storeName = store.name.split("|");
    storeName = storeName[0].split(",");



    var atsValue = res.viewData.atsValue;
    if(atsValue == 0) {
        storeName = Resource.msgf('button.bopis.notavail.addtocart', 'common', null,storeName);
    }else {
        storeName = Resource.msgf('button.bopis.addtocart', 'common', null,storeName);
    }

    res.setViewData({
        storeNameWithATS: storeName
    });

    if(!empty(storeId)) {
        session.custom.bopisStore = storeId;
    }
    
    next();

});

server.get('ResetBOPISSession', function (req, res, next) {
    session.custom.bopisStore = "";
    var returnJSON = {};
    res.json(returnJSON);
    next();

});

/**
 *
 * @param {string} products - list of product details info in the form of "productId:quantity,productId:quantity,... "
 * @returns {Object} a object containing product ID and quantity
 */
 function buildProductListAsJson(products) {
    if (!products) {
        return null;
    }

    return products.split(',').map(function (item) {
        var properties = item.split(':');
        return { id: properties[0], quantity: properties[1] };
    });
}

module.exports = server.exports();
