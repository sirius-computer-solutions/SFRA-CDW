/* eslint-disable no-unused-vars */
'use strict';
// This function should returns list of shipment details as per sample.json file
const StringUtils = require('dw/util/StringUtils');
const Calendar = require('dw/util/Calendar');

const util = require('../../utils/util');
const log = require('../../utils/log');
const custom = require('./custom');
var HashMap = require('dw/util/HashMap');

/**
 * This is a description of the getShipDate function.
 * This is to return the ship date
 * @returns {string} - This returns ship_date
 */
const getShipDate = function () {
    return StringUtils.formatCalendar(new Calendar(), util.TRANSFORMER_CONFIGURATIONS.DATE_FORMAT);
};

/**
 * This is a description of the getCustomizedShipmentsDetails function.
 * This function is used to get customize shipments details
 * @param {Object} shipmentList - This is the initial array of shipments
 * @param {dw.order.Order} order - This is the demandware order
 * @returns {Array} - shipmentList: This will return customized shipmentList
 */
const getCustomizedShipmentsDetails = function (shipmentList, order) {

    /** LOGIC TO MERGE THE OLD TRACKING INFO AND INCOMING FROM S2K BEGINS*/

    var trackingInfo = new HashMap();
    var trackingShipVia = new HashMap();
    var trackingShipViaCode = new HashMap();
    var Site = require('dw/system/Site');
    var carrierCodeMappingStr = Site.getCurrent().getCustomPreferenceValue('ShippingCarrierCodeJSON') || '{"ABFS":"ABF_Freight","CCYQ":"CCYQ_Freight","FDEG":"FedEx_Ground","FDEH":"FedEx_Ground","FDES":"FedEx_Express","FDHD":"FedEx_Ground","FEF":"FedEx_Freight","FEHD":"FedEx_Ground","FGC":"FedEx_Ground","FXFE":"FedEx_Freight","FXG":"FedEx_Ground","FXH":"FedEx_Ground","FXHD":"FedEx_Ground","FXNL":"FedEx_Freight","FXPP":"FedEx_Ground","FXS":"FedEx_Priority","FXSN":"FedEx_Priority","FX1":"FedEx_Priority","FX1N":"FedEx_Priority","FX2":"FedEx_Express","FX2N":"FedEx_Express","FX3":"FedEx_Express","FX4":"FedEx_Express","FX6":"FedEx_Ground","FX7":"FedEx_Ground","FX8":"FedEx_Ground","LMEL":"LMEL_Freight","ODFL":"ODFL_Freight","SPD":"SpeeDee_Ground","SPDC":"SpeeDee_Ground","UPB":"UPS_Ground","UPH":"UPS_Ground","UPR":"UPS_Priority","UPS":"UPS_Ground","UP1":"UPS_Ground","UP2":"UPS_Ground","UP3":"UPS_Express","UP4":"UPS_Ground","UP5":"UPS_Ground","UP6":"UPS_Ground","UP7":"UPS_Express","UP8":"UPS_Express"}';
    var carrierCodeMapping = JSON.parse(carrierCodeMappingStr);


    if(order.custom && "trackingInfoForNarvar" in order.custom && order.custom.trackingInfoForNarvar) {
        var customTrackInfo = order.custom.trackingInfoForNarvar;
        var jsonNarvarObj = JSON.parse(customTrackInfo);
        //Iterate the loop and get the item ID
        for(var i=0;i<jsonNarvarObj.Items.length;i++) {
            var itemInfo = {
                item_id: jsonNarvarObj.Items[i].itemId,
                quantity: jsonNarvarObj.Items[i].itemQuantity
            };
            if('shipVia' in jsonNarvarObj.Items[i])
            {
                trackingShipVia.put(jsonNarvarObj.Items[i].trackingNumber, jsonNarvarObj.Items[i].shipVia);
            }
            if('shipViaCode' in jsonNarvarObj.Items[i])
            {
                trackingShipViaCode.put(jsonNarvarObj.Items[i].trackingNumber, jsonNarvarObj.Items[i].shipViaCode);
            }

            if(trackingInfo.containsKey(jsonNarvarObj.Items[i].trackingNumber)) {
                var itemsInfoForTracking = trackingInfo.get(jsonNarvarObj.Items[i].trackingNumber);
                itemsInfoForTracking.items.push(itemInfo);
            }else {
                var items = {
                    items: []
                };
                items.items.push(itemInfo);
                trackingInfo.put(jsonNarvarObj.Items[i].trackingNumber,items);
            }
        }
    }
    /** LOGIC TO MERGE THE OLD TRACKING INFO AND INCOMING FROM S2K ENDS*/




    let shipmentList = [];
    try {
        const shimpents = order.shipments.toArray();
        const email = order.customerEmail;
        const billingAddress = order.billingAddress;

        if(trackingInfo.length > 0) {
            shimpents.forEach(function (shipment) {
                const keysItr =  trackingInfo.keySet().iterator();
                while (keysItr.hasNext()) {
                    var trackingNumber = keysItr.next();
                    var items = trackingInfo.get(trackingNumber).items;
                    const shippingAddress = (shipment.shippingAddress && shipment.shippingAddress.firstName) ? shipment.shippingAddress : billingAddress;
                    var carrier = '';
                    if(trackingShipViaCode.containsKey(trackingNumber)){
                        var shipViaCode = trackingShipViaCode.get(trackingNumber);
                        if(shipViaCode in carrierCodeMapping)
                        {
                            carrier = carrierCodeMapping[shipViaCode];
                        }
                    }
                    var carrier_service = trackingShipViaCode.containsKey(trackingNumber)?trackingShipViaCode.get(trackingNumber):'';

                    var shipmentData = {
                        ship_method: (shipment.shippingMethod) ? shipment.shippingMethod.displayName : util.TRANSFORMER_CONFIGURATIONS.GIFT_CARD_SHIPPING_METHOD,
                        carrier: carrier,
                        carrier_service: carrier_service,
                        // ship_source : 'DC-West',
                        // shipped_from: {},
                        items_info: [],
                        shipped_to: {
                            first_name: shippingAddress.firstName,
                            last_name: shippingAddress.lastName,
                            phone: shippingAddress.phone,
                            email: email,
                            address: {
                                street_1: shippingAddress.address1,
                                street_2: (shippingAddress.address2) ? shippingAddress.address2 : '',
                                city: shippingAddress.city,
                                state: shippingAddress.stateCode,
                                zip: shippingAddress.postalCode,
                                country: shippingAddress.countryCode.value
                            }
                        },
                        ship_discount: (shipment.shippingTotalNetPrice.available) ? shipment.shippingTotalNetPrice.subtract(shipment.adjustedShippingTotalNetPrice).value : 0,
                        ship_total: (shipment.adjustedShippingTotalNetPrice.available) ? shipment.adjustedShippingTotalNetPrice.value : 0,
                        ship_tax: (shipment.adjustedShippingTotalTax.available) ? shipment.adjustedShippingTotalTax.value : 0,
                        ship_date: getShipDate(),
                        tracking_number: trackingNumber
                    };

                    const productLineItems = shipment.productLineItems.toArray();
                    productLineItems.forEach(function (productLineItem) {
                        const id = productLineItem.productID;
                            //Iterate the loop and get the item ID
                            const localItems = items;
                            for(var m=0;m<localItems.length;m++) {
                                var val = m;
                                var updateItem = localItems[val].item_id;
                                
                                if(id === updateItem) {
                                    let itemInfo = {
                                        item_id: id,
                                        sku: id,
                                        quantity: localItems[val].quantity
                                    };
                                    shipmentData.items_info.push(itemInfo);
                                }
                            }
                    });

                    const giftCertLineItems = shipment.giftCertificateLineItems.toArray();
                    giftCertLineItems.forEach(function (giftCertLineItem) {
                        const id = giftCertLineItem.getGiftCertificateID() || util.TRANSFORMER_CONFIGURATIONS.GIFT_CARD_SKU;

                        let itemInfo = {
                            item_id: id,
                            sku: id,
                            quantity: 1
                        };
                        shipmentData.items_info.push(itemInfo);
                    });

                    shipmentList.push(shipmentData);
                }
            });
        }


    } catch (error) {
        var a = error;
        log.sendLog('error', 'shipmentsDetails:getBaseShipmentsDetails, Error while transforming shipments details:: ' + JSON.stringify(error));
    }

    return shipmentList;
};

module.exports = {
    getCustomizedShipmentsDetails: getCustomizedShipmentsDetails
};
