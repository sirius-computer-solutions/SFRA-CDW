'use strict';

var Resource = require('dw/web/Resource');
var preferences = require('*/cartridge/config/preferences');
var DEFAULT_MAX_ORDER_QUANTITY = preferences.maxOrderQty || 99999;

module.exports = function (object, quantity, minOrderQuantity, availabilityModel) {

    var maxOrderQuantity = object.maxOrderQuantity;
    Object.defineProperty(object, 'availability', {
        enumerable: true,
        value: (function () {
            var availability = {};
            availability.messages = [];
            availability.dropShip = false;
            availability.preOrder = false;
            availability.inStock = false;
            var productQuantity = quantity ? parseInt(quantity, 10) : minOrderQuantity;
            var availabilityModelLevels = availabilityModel.getAvailabilityLevels(productQuantity);
            var inventoryRecord = availabilityModel.inventoryRecord;
            var pastInStockDate = false;

            var dropShipQuantity = 0;
            if(!empty(inventoryRecord) && 'custom' in inventoryRecord && 'dropShipQuantity' in inventoryRecord.custom)
                dropShipQuantity = inventoryRecord.custom.dropShipQuantity;

            if (inventoryRecord && inventoryRecord.inStockDate) {
                availability.inStockDate = inventoryRecord.inStockDate.toDateString();
                if(inventoryRecord.inStockDate.getTime()< new Date().getTime())
                    pastInStockDate = true;
            } else {
                availability.inStockDate = null;
            }

            if (availabilityModelLevels.inStock.value > 0) {
                if (availabilityModelLevels.inStock.value === productQuantity) {
                    if(dropShipQuantity<=0)
                    {
                        availability.inStock = true;
                        availability.messages.push(Resource.msg('label.instock', 'common', null));
                    }
                    else{
                        availability.dropShip = true;
                        availability.messages.push(Resource.msg('label.instock.dropship', 'common', null));
                    }
                        
                } else {
                    availability.messages.push(
                        Resource.msgf(
                            'label.quantity.in.stock',
                            'common',
                            null,
                            availabilityModelLevels.inStock.value
                        )
                    );
                }
            }
            else if (availabilityModelLevels.preorder.value > 0) {
                availability.preOrder = true;
                if(!pastInStockDate && dropShipQuantity<=0)
                {
                    if (availabilityModelLevels.preorder.value === productQuantity) {
                        availability.messages.push(Resource.msgf('label.preorder', 'common', null,inventoryRecord.inStockDate.toLocaleDateString()));
                    } else {
                        availability.messages.push(
                            Resource.msgf(
                                'label.preorder.items',
                                'common',
                                null,
                                availabilityModelLevels.preorder.value
                            )
                        );
                    }
                }
                else if(dropShipQuantity>0){
                    availability.preOrder = false;
                    availability.messages.push(Resource.msg('label.instock.dropship', 'common', null));
                }
                else {
                    availability.preOrder = false;
                    availability.messages.push(
                        Resource.msgf(
                            'label.pre.order.past.date',
                            'common',
                            null
                        )
                    );
                }
            }
            else if (availabilityModelLevels.backorder.value > 0) {

                if (availabilityModelLevels.backorder.value === productQuantity) {
                    if(dropShipQuantity<=0)
                    {
                        availability.messages.push(Resource.msg('label.back.order', 'common', null));
                    }
                    else
                    {
                        availability.messages.push(Resource.msg('label.back.order.dropship', 'common', null));
                    }
                } else {
                    availability.messages.push(
                        Resource.msgf(
                            'label.back.order.items',
                            'common',
                            null,
                            availabilityModelLevels.backorder.value
                        )
                    );
                }
            }

            if (availabilityModelLevels.notAvailable.value > 0)
            {
                availability.messages = [];
                if (availabilityModelLevels.notAvailable.value === productQuantity) {
                    availability.messages.push(Resource.msg('label.not.available', 'common', null));
                } else {
                    availability.messages.push(Resource.msg('label.not.available.items', 'common', null));
                }
            }
            
            return availability;
        }())
    });
    Object.defineProperty(object, 'available', {
        enumerable: true,
        value: availabilityModel.isOrderable(parseFloat(quantity) || minOrderQuantity)
    });

};
