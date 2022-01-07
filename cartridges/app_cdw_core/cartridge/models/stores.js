'use strict';

var base = module.superModule;

var Site = require('dw/system/Site');

/**
 * Adding the customAttributes list to an existing list of current stores.
 * @param {Array} currentStores - an array of objects that contains store information
 * @param {dw.util.Set} apiStores - a set of <dw.catalog.Store> objects
 * @returns {currentStores} an array of objects that contains store information
 */
 function addCustomAttributes(currentStores, apiStores) {
    Object.keys(apiStores).forEach(function (key) {
        var apiStore = apiStores[key];
        currentStores.forEach(function (store) {
            if (apiStore.ID === store.ID) {
                if (apiStore.custom && apiStore.custom.storeDetailsURL) {
                    store.storeDetailsURL = apiStore.custom.storeDetailsURL;
                }
                if (apiStore.email ||
                    (apiStore.custom && apiStore.custom.email)) {
                    store.email = apiStore.email;
                }                
            }
        });
    });
    return currentStores;
}

/**
 * @constructor
 * @classdesc The stores model
 * @param {dw.util.Set} storesResultsObject - a set of <dw.catalog.Store> objects
 * @param {Object} searchKey - what the user searched by (location or postal code)
 * @param {number} searchRadius - the radius used in the search
 * @param {dw.web.URL} actionUrl - a relative url
 * @param {string} apiKey - the google maps api key that is set in site preferences
 * @param {boolean} showMap - boolean to show map
 */
function stores(storesResultsObject, searchKey, searchRadius, actionUrl, apiKey, showMap) {
    base.call(this, storesResultsObject, searchKey, searchRadius, actionUrl, apiKey, showMap);
    //Add the Custom Attribtues here
    this.stores = addCustomAttributes(this.stores, storesResultsObject);
    var stores = this.stores;
    var radiusOptionsValues = Site.current.getCustomPreferenceValue('storeLocatorRadiusOptions') || [50,100,200,300];
    this.radiusOptions = radiusOptionsValues;
    var a = radiusOptionsValues;
}

stores.prototype = Object.create(base.prototype);

module.exports = stores;
