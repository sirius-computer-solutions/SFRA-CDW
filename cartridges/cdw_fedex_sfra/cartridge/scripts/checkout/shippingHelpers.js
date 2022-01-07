'use strict';

var base = module.superModule;

var collections = require('*/cartridge/scripts/util/collections');
var ArrayList = require('dw/util/ArrayList');
var ShippingMgr = require('dw/order/ShippingMgr');
var ShippingMethodModel = require('*/cartridge/models/shipping/shippingMethod');

/** Fedex START */
var fedexRatesHelper = require('*/cartridge/scripts/helpers/fedexRatesHelper');
/** Fedex END */

// Public (class) static model functions

/**
 * Plain JS object that represents a DW Script API dw.order.ShippingMethod object
 * @param {dw.order.Shipment} shipment - the target Shipment
 * @param {Object} [address] - optional address object
 * @returns {dw.util.Collection} an array of ShippingModels
 */
function getApplicableShippingMethods(shipment, address) {
    if (!shipment) return null;
    var BasketMgr = require('dw/order/BasketMgr');

    var currentBasket = BasketMgr.getCurrentBasket();

    var shipmentShippingModel = ShippingMgr.getShipmentShippingModel(shipment);

    var shippingMethods;
    if (address) {
        shippingMethods = shipmentShippingModel.getApplicableShippingMethods(address);
    } else {
        shippingMethods = shipmentShippingModel.getApplicableShippingMethods();
    }

    /** Fedex START */
    // Retrieve function to filter out Fedex methods that do not have a corresponding rate
    var fedexRatesFilter = fedexRatesHelper.getShippingMethodFilter(shipment, address, customer);
    /** Fedex END */

    /** ACME freight and state restrictions START */
    var restrictedShippingMethods =[];
    if (currentBasket && shipment && shipment.shippingAddress){       
        if(isCartContainingFreight(currentBasket)){
            //Freight check here, allow only bopis/truck if there are 1 or more freight items
            restrictedShippingMethods = ["005","Truck"];
        }else if(isCartContainingAirRestricted(currentBasket)){
            //Air restricted, allow only ground
            restrictedShippingMethods = ["005","FEDEX_GROUND","GROUND","EXPRESS"];
        }
    }

    var filteredMethods = [];
    collections.forEach(shippingMethods, function (shippingMethod) {
        var isIncluded = (restrictedShippingMethods.includes(shippingMethod.ID));

        // If our order isn't restricted and the shipping method isn't truck, add all available shipping methods
        // OR
        // If our order is restricted, add only shipping methods in the restricted list
        if((empty(restrictedShippingMethods) && shippingMethod.ID !== "Truck") || restrictedShippingMethods.includes(shippingMethod.ID)){
            //  filter out any fedex methods that don't have rates
            if(!fedexRatesFilter(shippingMethod)){
                filteredMethods.push(new ShippingMethodModel(shippingMethod, shipment));
            }
        }
    });
    /** ACME freight and state restrictions END */
    return filteredMethods;
}

//check items in basket for air restricted attribute
function isCartContainingAirRestricted(currentBasket){
    var containsAirRestrictedItem = false;

    if(currentBasket) {
        var productLineItems = currentBasket.productLineItems;
        collections.forEach(productLineItems, function (item) {
            if(item.product.custom && "w1noair" in item.product.custom) {
                if(item.product.custom["w1noair"] == 'Y'){
                    containsAirRestrictedItem = true;
                }
            }
        });
                
    }

    return containsAirRestrictedItem;    
};

//check items in basket for drop ship attribute
function isCartContainingDropShip(currentBasket){
    var containsDropShipItem = false;

    if(currentBasket) {
        var productLineItems = currentBasket.productLineItems;
        collections.forEach(productLineItems, function (item) {
            if(item.custom && "dropShip" in item.custom) {
                if(item.custom["dropShip"] == true){
                    containsDropShipItem = true;
                }
            }
        });
    }

    return containsDropShipItem;
};

//check items in basket for drop ship attribute
function isCartContainingFreight(currentBasket){
    var containsFreightItem = false;

    if(currentBasket) {
        var productLineItems = currentBasket.productLineItems;
        collections.forEach(productLineItems, function (item) {
            if(item.product.custom && "w1frt" in item.product.custom) {
                if(item.product.custom["w1frt"] == 'F'){
                    containsFreightItem = true;
                }
            }
        });
    } 

    return containsFreightItem;
};

//check items in basket for carb compliant attribute
function isCartContainingNonCarbCompliant(currentBasket){
    var containsCarbCompliantItem = false;

    if(currentBasket) {
        var productLineItems = currentBasket.productLineItems;
        collections.forEach(productLineItems, function (item) {
            if(item.product.custom && "w1carb" in item.product.custom) {
                if(item.product.custom["w1carb"] == 'N'){
                    containsCarbCompliantItem = true;
                }
            }
        });
    }

    return containsCarbCompliantItem;
};

//check if address is PO box
function isAddressPOBOx(addressValue){
    var pattern = /\b[P|p]?(OST|ost)?\.?\s*[O|o|0]?(ffice|FFICE)?\.?\s*[B|b][O|o|0]?[X|x]?\.?\s+[#]?(\d+)\b/ig;
    var poBox = false;
    if(pattern.test(addressValue) || pattern.test(addressValue)){
        poBox=true;
    } 
    return poBox;
};

//check if address state is allowed
function isAddressStateAllowed(stateCode){
    var stateAllowed = true;
    if(['PR','VI','GU','AA','AP','AE'].includes(stateCode)){
        stateAllowed = false;
    }
    return stateAllowed;
};


function validateShippingRestrictions(currentBasket){
    var Resource = require('dw/web/Resource');

    var isBopis = false;
    var restrictionErrors = [];
    // only need to perform restriction and form error chesk if not bopis
    
    if (currentBasket && currentBasket.defaultShipment && currentBasket.defaultShipment.shippingMethod){
        isBopis = currentBasket.defaultShipment.shippingMethod.custom.storePickupEnabled;
        if (!isBopis) {
            if (currentBasket.defaultShipment.shippingAddress){
                var shippingAddress = currentBasket.defaultShipment.shippingAddress;
                var stateCode = shippingAddress.stateCode;
                if(("AK" === stateCode || "HI" === stateCode ) 
                && (isCartContainingAirRestricted(currentBasket) 
                    || isCartContainingDropShip(currentBasket) 
                    || isCartContainingFreight(currentBasket))){
                        restrictionErrors.push(Resource.msg('checkout.shipping.restricteditems.error', 'checkout', null));
                }
                if("CA" === stateCode && isCartContainingNonCarbCompliant(currentBasket)){
                    restrictionErrors.push(Resource.msg('checkout.shipping.carbcompliantitems.error', 'checkout', null));
                }
                if(isAddressPOBOx(shippingAddress.address1)){
                    restrictionErrors.push(Resource.msg('checkout.shipping.poboxnotpermitted.error', 'checkout', null));
                }
                if(!isAddressStateAllowed(shippingAddress.stateCode)){
                    restrictionErrors.push(Resource.msg('checkout.shipping.statenotpermitted.error', 'checkout', null));
                }
                // check if current shipping method is not among selected methods
                var applicableShippingMethods = new ArrayList(getApplicableShippingMethods(currentBasket.defaultShipment));
                var applicableShippingMethodIds = collections.map(applicableShippingMethods, function (shippingMethod) {
                    var shippingMethodId=shippingMethod.ID;
                    return shippingMethodId;
                });
                var currentShippingMethodID = currentBasket.defaultShipment.shippingMethod.ID;
                if(currentShippingMethodID && shippingAddress.address1 && !applicableShippingMethodIds.includes(currentShippingMethodID)){
                    restrictionErrors.push(Resource.msg('checkout.shipping.selectedmethod.error', 'checkout', null));
                }
            }
        }
    }
    return restrictionErrors;
}

module.exports = {
    getApplicableShippingMethods: getApplicableShippingMethods,
    isCartContainingAirRestricted: isCartContainingAirRestricted,
    isCartContainingDropShip: isCartContainingDropShip,
    isCartContainingFreight: isCartContainingFreight,
    isCartContainingNonCarbCompliant: isCartContainingNonCarbCompliant,
    isAddressPOBOx: isAddressPOBOx,
    isAddressStateAllowed: isAddressStateAllowed,
    validateShippingRestrictions: validateShippingRestrictions
};
Object.keys(base).forEach(function (prop) {
    // eslint-disable-next-line no-prototype-builtins
    if (!module.exports.hasOwnProperty(prop)) {
        module.exports[prop] = base[prop];
    }
});