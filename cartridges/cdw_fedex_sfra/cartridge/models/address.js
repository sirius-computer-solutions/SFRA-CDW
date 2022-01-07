'use strict';

var base = module.superModule;

/**
 * Address class that represents an orderAddress
 * @param {dw.order.OrderAddress} addressObject - User's address
 * @constructor
 */
function address(addressObject) {
    base.call(this, addressObject);
    if(addressObject !== null && addressObject.custom && "fedexAVS" in addressObject.custom) {
        if(addressObject.custom.fedexAVS != null) {
            var fedexAVS = addressObject.custom.fedexAVS;
            this.address.fedexAVS = JSON.parse(fedexAVS); 
        }
    }
}

module.exports = address;
