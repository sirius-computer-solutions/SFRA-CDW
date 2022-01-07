/* eslint-disable */
'use strict';

/**
 * @module mergeCartOnLogin.js
 *
 * This javascript file implements methods (via Common.js exports) that are needed by
 * the new (smaller) CalculateCart.ds script file.  This allows OCAPI calls to reference
 * these tools via the OCAPI 'hook' mechanism
 *
 */


/**
 * @function mergeCartOnLogin
 *
 * This hook merges the guest user cart and the registered user cart after login.
 *
 * 
 */
exports.mergeCartOnLogin = function () {
    var Status = require('dw/system/Status');
    var BasketMgr = require('dw/order/BasketMgr');
    var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
    var Logger = require('dw/system/Logger');
    var mergeCartLogger = Logger.getLogger('MergeCart', 'MergeCartOnLogin');
    var Transaction = require('dw/system/Transaction');
    var storedBasket = BasketMgr.getStoredBasket();
    if(storedBasket!=null)
    {
        var currentBasket = BasketMgr.getCurrentBasket();
        if(currentBasket!=null)
        {
            var productLineItems = storedBasket.getAllProductLineItems().iterator();
            while (productLineItems.hasNext()) 
            {
                try{
                    var storeProdLine = productLineItems.next();

                    Transaction.wrap(function () {
                        cartHelper.addProductToCart(
                            currentBasket,
                            storeProdLine.productID,
                            parseInt(storeProdLine.quantity),
                            [],
                            [],null,request
                        );
                    });
                } catch (e) {
                    var a =e;
                    mergeCartLogger.error('Error occured while merging item ' + storeProdLine.productID + ' while login. Error = ' + e );
                }
            }
        }
    }
    return new Status(Status.OK);
};

