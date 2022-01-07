/* eslint-disable no-unused-vars */
'use strict';
// This function should return a list of product items.
// Samples are given inside sampleContainsGiftCards.json and sampleWithoutGiftCards.json
// One sample includes gift card details and one sample does not.

/**
 * This is a description of the getCustomizedCustomerDetails function.
 * This function is used to get customize items details
 * @param {Object} items - This is the initial items details created using order data
 * @param {dw.order.Order} order - This is the demandware order
 * @returns {Object} - items: This will return customized items details
 */
const getCustomizedOrderItems = function (items, order) {

    try{
        if(order.custom && "trackingInfoForNarvar" in order.custom && order.custom.trackingInfoForNarvar) {
            var customTrackInfo = order.custom.trackingInfoForNarvar;
            var jsonNarvarObj = JSON.parse(customTrackInfo);
            //Iterate the loop and get the item ID
            for(var i=0;i<jsonNarvarObj.Items.length;i++) {
                var updateItem = jsonNarvarObj.Items[i].itemId;
                items.forEach(function (item) {
                    if(item.item_id === updateItem) {
                        item.fulfillment_status = "SHIPPED";
                    }
                });
            }
        }
            
    
    } catch(error) {
        const err = error;
        log.sendLog('error', 'orderItems:getCustomizedOrderItems, Error while getting and updating the shipping status:: ' + JSON.stringify(err));
    }

    return items;
};

module.exports = {
    getCustomizedOrderItems: getCustomizedOrderItems
};
