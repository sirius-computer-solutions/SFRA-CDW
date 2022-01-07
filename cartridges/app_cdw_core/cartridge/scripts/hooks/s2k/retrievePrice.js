'use strict';
var Money = require('dw/value/Money');
var Resource = require('dw/web/Resource');
var Logger = require('dw/system/Logger');
var s2kConstants = require('*/cartridge/scripts/utils/s2kServiceConstants').getConstants();
var s2kLogger = Logger.getLogger('S2K', 'S2K_General');
var s2kRestService = require('*/cartridge/scripts/services/s2kRestService');
var BasketMgr = require('dw/order/BasketMgr');
var HashMap = require('dw/util/HashMap');

/**
 * Retrieves the B2B Price from S2K.
 * @param {accountNumber} B2BAccountNumber
 * @param {partNumber} partNumber
 * @param {quantity} Quantity
 * @return {Object} returns an PriceModel object
 */
 function GetB2BPrice(b2bPriceObj) {
    var serverErrors = [];
    var error = false;
    var b2bPrice =   Money.NOT_AVAILABLE;
    try { 
        // populate the 'body' element with parameters 
        var body = {
                        customerId: b2bPriceObj.customerId,
                        prospectId:'',
                        dataRequest:
                        [
                            {
                                itemNumber:b2bPriceObj.partNumber,
                                uomList:
                                [
                                  {
                                    uom:'EA',
                                    quantity: b2bPriceObj.quantity
                                  }
                                ]
                            }
                        ]
                    };

        // create the request object
        var data = { path : s2kConstants.GET_B2B_PRICE_ACTION, 
                     method : s2kConstants.HTTP_METHOD_POST, 
                     body : body };
        // invoke the s2k service call
        var s2kServiceResponse = s2kRestService.call(data);
        if (s2kServiceResponse == null) {
            s2kLogger.error("No response was received from S2K");
        }
        if (s2kServiceResponse.success) {
            s2kLogger.debug("Request was successful. Response: " + s2kServiceResponse);
            
            if(s2kServiceResponse.priceList)
            {
                var currency = b2bPriceObj.currencyCode;
                if(!currency){
                    var currentBasket = BasketMgr.getCurrentBasket();
                    var currency = b2bPriceObj.getCurrencyCode();
                }
                for(var i=0;i<s2kServiceResponse.priceList.length;i++)
                {
                    var pList = s2kServiceResponse.priceList[i];
                    if(pList.uomList)
                    for(var j=0;j<pList.uomList.length;j++)
                    {
                        var price = pList.uomList[j].price;
                        b2bPrice = new Money(price,currency);
                    }
                        
                }    
    
            }
            
        } else {
            if (s2kServiceResponse.message) {
                error = true;
                serverErrors.push (s2kServiceResponse.message, 's2k', null);
            }
        }
    } catch (e) {
        error = true;
        serverErrors.push (
            Resource.msg('error.technical', 's2k', null)
        );
    }
    return b2bPrice;
}

/**
 * Retrieves the B2B Price from S2K.
 * @param {basket} basket
 * @param {customerId} b2bcustomerId
 * @return {Object} returns an PriceModel object
 */
 function GetB2BPriceForProducts(basket,b2bAccountNumber) {
    var serverErrors = [];
    var error = false;
    var b2bPrice =   Money.NOT_AVAILABLE;
    var b2bPriceMap = new HashMap();
    var currency = basket.getCurrencyCode();
    
    try { 
        
        if (b2bAccountNumber!=null && b2bAccountNumber!='')
        {
            // populate the 'body' element with parameters 
            var jsonString = '{"customerId":"'+ b2bAccountNumber +'","prospectId":"","dataRequest":[';
            var index = 0 ;
            var productLineItems = basket.getAllProductLineItems().iterator();
            while (productLineItems.hasNext()) {
                var productLineItem = productLineItems.next();
                if('b2bPriceQuantity' in productLineItem.custom && productLineItem.custom.b2bPriceQuantity == productLineItem.quantity)
                {
                    var key = productLineItem.productID + '~' + productLineItem.quantity;
                    var existinB2bPrice = new Money(productLineItem.basePrice.value,currency);
                    b2bPriceMap.put(key,existinB2bPrice);
                    continue;
                }
                jsonString+='{"itemNumber":"'+ productLineItem.productID +'","uomList":[{"uom":"EA","quantity":"'+productLineItem.quantity+'"}]},';
                index = index + 1 ;
            }

            if(index>0)
            {
                if(jsonString.endsWith(','))
                {
                    jsonString = jsonString.substring(0,jsonString.length-1);
                }
                jsonString+=']}';

                var body = JSON.parse(jsonString);
                // create the request object
                var data = { path : s2kConstants.GET_B2B_PRICE_ACTION, 
                            method : s2kConstants.HTTP_METHOD_POST, 
                            body : body };
                // invoke the s2k service call
                var s2kServiceResponse = s2kRestService.call(data);
                if (s2kServiceResponse == null) {
                    s2kLogger.error("No response was received from S2K");
                }
                if (s2kServiceResponse.success) {
                    s2kLogger.debug("Request was successful. Response: " + s2kServiceResponse);
                    
                    if(s2kServiceResponse.priceList)
                    {
                        for(var i=0;i<s2kServiceResponse.priceList.length;i++)
                        {
                            var pList = s2kServiceResponse.priceList[i];
                            if(pList.uomList)
                            for(var j=0;j<pList.uomList.length;j++)
                            {
                                var price = pList.uomList[j].price;
                                var b2bPrice = new Money(price,currency);
                                var key = pList.itemNumber + '~' + pList.uomList[j].quantity;
                                b2bPriceMap.put(key,b2bPrice);
                            }
                        }    
                    }
                } else {
                    if (s2kServiceResponse.message) {
                        error = true;
                        serverErrors.push (s2kServiceResponse.message, 's2k', null);
                    }
                }
            }
        }
    } catch (e) {
        var exception =e;
        error = true;
        serverErrors.push (
            Resource.msg('error.technical', 's2k', null)
        );
    }
    return b2bPriceMap;
}

module.exports = {
    GetB2BPrice: GetB2BPrice,
    GetB2BPriceForProducts: GetB2BPriceForProducts
};