'use strict';

var base = module.superModule;
var ArrayList = require('dw/util/ArrayList');
var Site = require('dw/system/Site');
var ProductMgr = require('dw/catalog/ProductMgr');

/**
 * Searches for stores and creates a plain object of the stores returned by the search
 * @param {string} radius - selected radius
 * @param {string} postalCode - postal code for search
 * @param {string} lat - latitude for search by latitude
 * @param {string} long - longitude for search by longitude
 * @param {Object} geolocation - geolocation object with latitude and longitude
 * @param {boolean} showMap - boolean to show map
 * @param {dw.web.URL} url - a relative url
 * @param {[Object]} products - an array of product ids to quantities that needs to be filtered by.
 * @returns {Object} a plain object containing the results of the search
 */
function getStores(radius, postalCode, lat, long, geolocation, showMap, url, products) {
    var ProductInventoryMgr = require('dw/catalog/ProductInventoryMgr');
    var Resource = require('dw/web/Resource');

    var storesModel = base.getStores(radius, postalCode, lat, long, geolocation, showMap, url);

    if (products) {
       storesModel.stores = storesModel.stores.filter(function (store) {
            var storeInventoryListId = store.inventoryListId;
            if (storeInventoryListId) {
                var storeInventory = ProductInventoryMgr.getInventoryList(storeInventoryListId);
                return products.every(function (product) {
                    var inventoryRecord = storeInventory.getRecord(product.id);
                    // return inventoryRecord && inventoryRecord.ATS.value >= product.quantity;
                    //Return all the store records for the products with inventory status
                    if(!empty(inventoryRecord) && inventoryRecord.ATS && inventoryRecord.ATS.value >= product.quantity) {
                        store.inventoryStatus =  Resource.msg('store.product.inventory.available', 'storeLocator', null);
                    }else {
                        store.inventoryStatus =  Resource.msg('store.product.inventory.not.available', 'storeLocator', null);
                        return {};
                    }
                    
                    return inventoryRecord;
                });
            }
            return false;
        });
    }

    if(!isHeavyEquipmentCategory(products)){
        storesModel.stores = customSortStores(storesModel);
    }
    
    return storesModel;
}

/**
 * This method returs true if the product belongs to Heavy Equipment category
 * @param products 
 * @returns 
 */
 function isHeavyEquipmentCategory(products){
    var isHeavyEquipmentCategory=false;
    if(products){
        products.forEach(function(currentProduct){     
            var product = ProductMgr.getProduct(currentProduct.id);
            if(product != null && product.custom && "acme-tools-heavy-equipment" in product.custom) {
                if (product.custom["acme-tools-heavy-equipment"] == 'true' || product.custom["acme-tools-heavy-equipment"] == 'Yes' || product.custom["acme-tools-heavy-equipment"] === true || product.custom["acme-tools-heavy-equipment"] == 'Y') {
                    isHeavyEquipmentCategory=true;
                }
            }
        });
    }
    return isHeavyEquipmentCategory;
}

/**
 * This method custom sorts Stores in the give StoresModel
 * @param {storesModel} storesModel 
 */
function customSortStores(storesModel){
    
    var stores = storesModel.stores;

    var grandForksStore;
    var grandForksEquipment;
    var grandForksStoreLoc=-1;
    var grandForksEquipmentLoc=-1;
    
    var grandForksStoreID = Site.current.getCustomPreferenceValue('grandForksStoreID') || '';
    var grandForksEquipmentStoreID = Site.current.getCustomPreferenceValue('grandForksEquipmentStoreID') || '';

    if(!empty(grandForksStoreID) && !empty(grandForksEquipmentStoreID)){

        var count=0;
        // iterate through all stores and find 
        // location of 'GrandForks' & 'EquipmentStore'
        // in the stores array
        stores.forEach(function(store){
            if(store.ID==grandForksStoreID){
                grandForksStore = store;
                grandForksStoreLoc = count;
            } else if(store.ID==grandForksEquipmentStoreID){
                grandForksEquipment = store;
                grandForksEquipmentLoc = count;
            }
            count++;
        });

        count=0;

        // If 'GrandForksStore' & 'EquipmentStore' are present in the store results 
        // and if 'EquipmentStore' comes before 'GrandForksStore', then swap their 
        // locations in the Store results
        if(grandForksStoreLoc!=-1 && grandForksEquipmentLoc!=-1 && grandForksEquipmentLoc<grandForksStoreLoc){
            var newSortedStores = new ArrayList();
            stores.forEach(function(store){
                if(count==grandForksEquipmentLoc){
                    newSortedStores.add(grandForksStore);
                } else if (count==grandForksStoreLoc){
                    newSortedStores.add(grandForksEquipment);
                } else {
                    newSortedStores.add(store);
                }
                count++;
            });
            stores = newSortedStores;
        }
    }

    return stores;
}

module.exports = {
    getStores: getStores
};
Object.keys(base).forEach(function (prop) {
    // eslint-disable-next-line no-prototype-builtins
    if (!module.exports.hasOwnProperty(prop)) {
        module.exports[prop] = base[prop];
    }
});
