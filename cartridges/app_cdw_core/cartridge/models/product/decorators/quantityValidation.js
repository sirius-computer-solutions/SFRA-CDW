'use strict';

var Resource = require('dw/web/Resource');
var preferences = require('*/cartridge/config/preferences');
var DEFAULT_MAX_ORDER_QUANTITY = preferences.maxOrderQty || 99999;

module.exports = function (object, quantity, minOrderQuantity, availabilityModel) {

    Object.defineProperty(object, 'availability', {
        enumerable: true,
        value: (function () {
            var availability = {};
            availability.messages = [];
            var productQuantity = quantity ? parseInt(quantity, 10) : minOrderQuantity;
            var availabilityModelLevels = availabilityModel.getAvailabilityLevels(productQuantity);
            var inventoryRecord = availabilityModel.inventoryRecord;

            var dropShipQuantity = 0;
            if('custom' in inventoryRecord && 'dropShipQuantity' in inventoryRecord.custom)
                dropShipQuantity = inventoryRecord.custom.dropShipQuantity;

            if (availabilityModelLevels.inStock.value > 0 && availabilityModelLevels.inStock.value > productQuantity) {
                return;
            }else if (availabilityModelLevels.backorder.value > 0 && inventoryRecord.ATS.value >= productQuantity && availabilityModelLevels.inStock.value!=0) {
                availability.messages.push(
                    Resource.msgf(
                        'label.back.order.items.qty',
                        'common',
                        null,
                        productQuantity,
                        availabilityModelLevels.inStock.value
                    )
                );
            }else if (availabilityModelLevels.backorder.value > 0 && inventoryRecord.ATS.value < productQuantity) {
                availability.messages.push(
                    Resource.msgf(
                        'label.back.order.items.qty.exceeded',
                        'common',
                        null,
                        inventoryRecord.ATS.value
                    )
                );
            }
            return availability;
        }())
    });
    Object.defineProperty(object, 'available', {
        enumerable: true,
        value: availabilityModel.isOrderable(parseFloat(quantity) || minOrderQuantity)
    });

};