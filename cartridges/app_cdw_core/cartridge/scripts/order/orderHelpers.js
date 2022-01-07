'use strict';

var base = module.superModule;
var Resource = require('dw/web/Resource');
var collections = require('*/cartridge/scripts/util/collections');
var formatCurrency = require('*/cartridge/scripts/util/formatting').formatCurrency;
var OrderConstants = require('*/cartridge/scripts/utils/acmeConstants').getConstants();

/**
 * Parse the S2K Order response and constructs the order object similar to OOTB to display the order details
 * @param {Object} s2korderDetailsResponse - S2K Order Details response
 * @returns {Object} a plain object containing the results of the search
 */
function getS2KOrderDetailsFromResponse(s2korderDetailsResponse) {
   var order = {};

   // Now get the values from S2K response and construct the JSON for display purpose
   if(!empty(s2korderDetailsResponse.order)) {
        var s2kOrder = s2korderDetailsResponse.order;

        //Order Header Section
        var webOrderNo = s2kOrder.orderSummary.webOrderNo;
        if(!empty(webOrderNo)) {
            order.orderNumber = webOrderNo;
        } else {
            order.orderNumber = s2kOrder.orderSummary.orderNo;
        }
        
        order.priceTotal = "$"+s2kOrder.orderSummary.orderTotal;
        if(s2kOrder.orderSummary.orderDate) {
            var orderDate = s2kOrder.orderSummary.orderDate.toString();
            var dateFormat = orderDate.substring(0,4)+"/"+orderDate.substring(4,6)+"/"+orderDate.substring(6,8);
            order.creationDate = new Date(dateFormat);
        }
        order.orderEmail = s2kOrder.orderSummary.emailAddress;
        order.productQuantityTotal = s2kOrder.orderSummary.itemCount;
        order.status = s2kOrder.orderSummary.statusDescription;
        order.type = s2kOrder.orderSummary.type;

        var totals = {};
        //Totals Section
        totals.subTotal = formatCurrency(s2kOrder.orderSummary.materialTotal,OrderConstants.US_CURRENCY_CUDE);
        totals.totalShippingCost = formatCurrency(s2kOrder.orderSummary.freight,OrderConstants.US_CURRENCY_CUDE);
        totals.totalTax = formatCurrency(s2kOrder.orderSummary.tax,OrderConstants.US_CURRENCY_CUDE);
        totals.grandTotal = formatCurrency(s2kOrder.orderSummary.orderTotal,OrderConstants.US_CURRENCY_CUDE);

        var orderLevelDiscountTotal = {};
        orderLevelDiscountTotal.formatted = formatCurrency(s2kOrder.orderSummary.miscCharge,OrderConstants.US_CURRENCY_CUDE);
        orderLevelDiscountTotal.value = s2kOrder.orderSummary.miscCharge;
        totals.orderLevelDiscountTotal = orderLevelDiscountTotal;
        
        // order.totals.discounts = "-$1.25";
        totals.adjustedShippingTotalPrice = formatCurrency(s2kOrder.orderSummary.freight,OrderConstants.US_CURRENCY_CUDE);
        totals.shippingTotalLessSurcharge = formatCurrency(s2kOrder.orderSummary.freight,OrderConstants.US_CURRENCY_CUDE);
        totals.shippingSurcharge = formatCurrency(s2kOrder.orderSummary.handlingCharge,OrderConstants.US_CURRENCY_CUDE);

        order.totals = totals;

        //Items Section
        var items = [];
        for(var i=0;i<s2kOrder.orderDetailList.length;i++) {
            var s2kOrderItem = s2kOrder.orderDetailList[i];

            var item = {};
            item.id = s2kOrderItem.itemNumber;
            item.manufacturerSKU = s2kOrderItem.itemNumber;
            if(!empty(s2kOrderItem.itemNumber))  {
                var ProductMgr = require('dw/catalog/ProductMgr');
                // var origPrd = ProductMgr.getProduct(s2kOrderItem.itemNumber);
                var origPrd = ProductMgr.getProduct(s2kOrderItem.itemNumber);
                if(!empty(origPrd)) {
                    item.manufacturerSKU = origPrd.manufacturerSKU;
                    item.productName = origPrd.shortDescription;
                    item.shortDescription = origPrd.shortDescription;
                    // item.productType = origPrd.getProductT
                    item.images = origPrd.getImages("small");

                } else {
                    item.productName = s2kOrderItem.description1;
                    item.shortDescription = s2kOrderItem.description1;
    
                }
                
            }

            //Get it from the ProductMgr
            item.quantityShipped = s2kOrderItem.qtyShip;
            item.quantityBackOrdered = s2kOrderItem.qtyBo;
            var totalQuantity = parseInt(s2kOrderItem.qtyShip) + parseInt(s2kOrderItem.qtyBo);
            item.quantity = totalQuantity;

            var priceTotal = {};
            if(!empty(s2kOrderItem.linePrice)) {
                priceTotal.price = formatCurrency(s2kOrderItem.linePrice,OrderConstants.US_CURRENCY_CUDE);
            }
            
            item.priceTotal = priceTotal;

            //TODO check if below one is required and construct that here based on the price
            // item.priceTotal.renderedPrice = s2kOrderItem.
            items.push(item);
        }
        //Get the Quantity from the order headerlevel or calculate by adding all the quantity at the item level
        order.items = {
                        items: items,
                        totalQuantity: s2kOrder.orderSummary.itemCount};

        
        //Billing Section --Billing Address
        var billing = {};
        var billingAddress = {};
        var address = {};

        address.address1 = s2kOrder.billTo.address1;
        address.address2 = s2kOrder.billTo.address2;
        address.address3 = s2kOrder.billTo.address3;
        address.city = s2kOrder.billTo.city;
        address.firstName = s2kOrder.billTo.name;
        address.lastName = "";
        address.phone = s2kOrder.billTo.phoneNumber;
        address.postalCode = s2kOrder.billTo.zip;
        address.stateCode = s2kOrder.billTo.state;
        //Setting address now
        billingAddress.address = address;
        //Settig billing address now
        billing.billingAddress = billingAddress;
        billing.salesmanNo = s2kOrder.billTo.salesmanNo;

        //Billing Section --Payyment
        var selectedPayment = {};
        var payments = [];
        if(!empty(s2kOrder.payments)) {
            for(var i=0; i<s2kOrder.payments.length;i++) {
                var s2kPayment = s2kOrder.payments[i];
                var payment = {};
                payment.paymentMethod = s2kPayment.paymentMethod;
                payment.amount = s2kPayment.amount;
                payment.lastFour = s2kPayment.lastFour;
                payment.owner = s2kOrder.billTo.name;
                payment.expirationYear = s2kPayment.expirationYear;
                payment.type = s2kPayment.type;
                payment.maskedCreditCardNumber = s2kPayment.maskedCreditCardNumber;
                payment.expirationMonth = s2kPayment.expirationMonth;

                if(payment.paymentMethod === "GIFT_CERTIFICATE") {
                    payment.maskedGiftCertificateCode = s2kPayment.maskedCreditCardNumber;
                }
                if(payment.paymentMethod === "PayPal") {
                    var payPal = {};
                    // payPal.paypalEmail = Resource.msg('label.paypal.order.id', 'order', null)+s2kPayment.paypalOrderId;
                    if(!empty(s2kPayment.payPalEmailId)) {
                        payment.paypalEmail = s2kPayment.payPalEmailId;
                    } else {
                        payment.paypalEmail = "N/A";
                    }
                    payment.paymentAmount = formatCurrency(s2kPayment.amount,OrderConstants.US_CURRENCY_CUDE);
                    order.paypal = payPal;
                } 
                
                if(s2kOrder.orderSummary.poNumber) {
                    payment.webReference = s2kOrder.orderSummary.poNumber;
                }
                
    
                payments.push(payment);
            }
        }

        selectedPayment.selectedPaymentInstruments = payments;
        billing.payment = selectedPayment;
        //Setting billing into order now
        order.billing = billing;


        //Shipment Section 
        var shipments = [];
        //Currently supports only one shipment
        for(var i=0;i<1;i++) {
            var shipment = {};
            ///Shipping Method Section
            var selectedShippingMethod = {};

            if(s2kOrder.orderSummary.shipVia && s2kOrder.orderSummary.shipVia == 'Customer Pick Up') {
                selectedShippingMethod.ID = "005";
                // var ShippingMgr = require('dw/order/ShippingMgr');
                
                selectedShippingMethod.displayName = "Store Pickup";
                selectedShippingMethod.description = "In-store pickup";
                // selectedShippingMethod.estimatedArrivalTime = "";
                selectedShippingMethod.shippingCost = formatCurrency(s2kOrder.orderSummary.freight,OrderConstants.US_CURRENCY_CUDE);
    
            }else {
                var s2kShippingMethodValue = s2kOrder.orderSummary.shippingMethod;
                selectedShippingMethod.ID = s2kShippingMethodValue;
                var ShippingMgr = require('dw/order/ShippingMgr');
                var availableShippingMethods = ShippingMgr.getAllShippingMethods();
                var orderedShippingMethod;
                collections.forEach(availableShippingMethods, function (shippingMethod) {
                    if(shippingMethod.ID == s2kShippingMethodValue) {
                        orderedShippingMethod = shippingMethod;
                    }
                });



                if(!empty(orderedShippingMethod)) {
                    selectedShippingMethod.displayName = orderedShippingMethod.displayName;
                    selectedShippingMethod.description = orderedShippingMethod.description;
                } else {
                    //Since it returns with ShipMethod not availble in SalesForce, so we are just getting that value from ShipVia
                    selectedShippingMethod.displayName = s2kOrder.orderSummary.shipVia;
                    selectedShippingMethod.description = s2kOrder.orderSummary.shipVia;
                }
                // selectedShippingMethod.estimatedArrivalTime = "";
                selectedShippingMethod.shippingCost = formatCurrency(s2kOrder.orderSummary.freight,OrderConstants.US_CURRENCY_CUDE);
            }
            //Setting selectedShippingMethod to Shipping now
            shipment.selectedShippingMethod = selectedShippingMethod;



            //Shipping Address Section
            var shippingAddress = {};
            shippingAddress.address1 = s2kOrder.shipTo.address1;
            shippingAddress.address2 = s2kOrder.shipTo.address2;
            shippingAddress.address3 = s2kOrder.shipTo.address3;
            shippingAddress.city = s2kOrder.shipTo.city;
            shippingAddress.firstName = s2kOrder.shipTo.name;
            shippingAddress.lastName = "";
            shippingAddress.phone = s2kOrder.shipTo.phoneNumber;
            shippingAddress.postalCode = s2kOrder.shipTo.zip;
            shippingAddress.stateCode = s2kOrder.shipTo.state;
            //Setting the shippingAddress to shipment now
            shipment.shippingAddress = shippingAddress;

            //Setting the product Line Items
            //Items Section
            var items = [];
            for(var i=0;i<s2kOrder.orderDetailList.length;i++) {
                var s2kOrderItem = s2kOrder.orderDetailList[i];
                var commentLineItem = false;
                commentLineItem = s2kOrderItem.comment;

                if(!commentLineItem) {
                    var item = {};
                    item.id = s2kOrderItem.itemNumber;
                    item.manufacturerSKU = s2kOrderItem.itemNumber;
                    if(!empty(s2kOrderItem.itemNumber))  {
                        var ProductMgr = require('dw/catalog/ProductMgr');
                        // var origPrd = ProductMgr.getProduct(s2kOrderItem.itemNumber);
                        var origPrd = ProductMgr.getProduct(s2kOrderItem.itemNumber);
                        if(!empty(origPrd)) {
                            item.manufacturerSKU = origPrd.manufacturerSKU;
                            item.productName = origPrd.shortDescription;
                            item.shortDescription = origPrd.shortDescription;
                            // item.productType = origPrd.getProductT
                            item.images = origPrd.getImages("small");
                        } else {
                            item.productName = s2kOrderItem.description1;
                            item.shortDescription = s2kOrderItem.description1;
                        }
                    }


                    //Logic to check if the item is canclled and add the cancelled status to the line level
                    if(!empty(s2kOrderItem.isCancelled) && s2kOrderItem.isCancelled) {
                        item.itemCancelled = true;
                        if(!empty(s2kOrderItem.cancelledQty)) {
                            item.cancelledQty = s2kOrderItem.cancelledQty;
                        }
                    } else {
                        //Get it from the ProductMgr
                        item.quantityShipped = s2kOrderItem.qtyShip;
                        item.quantityBackOrdered = s2kOrderItem.qtyBo;
                        var totalQuantity = parseInt(s2kOrderItem.qtyShip) + parseInt(s2kOrderItem.qtyBo);
                        // item.quantity = totalQuantity;
                    }

                    // item.itemCancelled = true;
                    // item.cancelledQty = s2kOrderItem.qtyShip;

                    var priceTotal = {};
                    priceTotal.price = formatCurrency(s2kOrderItem.extPrice,OrderConstants.US_CURRENCY_CUDE);
                    item.priceTotal = priceTotal;

                    //Item Leve Tracking Information
                    var trackingDetails = [];
                    if(!empty(s2kOrderItem.trackingInfo)) {
                        for(var k=0;k<s2kOrderItem.trackingInfo.length;k++) {
                            var itemTrackingInfo = s2kOrderItem.trackingInfo[k];
                            var trackingDetail = {};
                            trackingDetail.trackingNumber = itemTrackingInfo.trackingInfo;
                            trackingDetail.carrier = itemTrackingInfo.shippingMethod;
                            var carrierCode = itemTrackingInfo.shipViaCode;
                            if(!empty(carrierCode)) {
                                var carrierURL = Resource.msg(carrierCode, 'order', null);
                                if(!empty(carrierURL)) {
                                    trackingDetail.trackingURL = carrierURL+itemTrackingInfo.trackingInfo;
                                }else {
                                    trackingDetail.trackingURL = "#";
                                }
                            } else{
                                trackingDetail.trackingURL = "#";
                            }
                            trackingDetails.push(trackingDetail);
                        }
                    }
                    item.trackingInfo = trackingDetails;


                    //TODO check if below one is required and construct that here based on the price
                    // item.priceTotal.renderedPrice = s2kOrderItem.
                    items.push(item);
                }
            }            
            var productLineItems = {};
            productLineItems.items = items;
            shipment.productLineItems = productLineItems;


            //Now push the shipment into an array
            shipments.push(shipment);
        }

        order.shipping = shipments;


        
    }

    //Now return the order JSON object back
    return order;
}

/**
 * Parse the S2K Order History response and constructs the orders objects for display purpose
 * @param {Object} s2korderHistoryResponse - S2K Order Details response
 * @returns {Object} a plain object containing the results of the search
 */
 function getOrderHistoryFromS2KResponse(s2korderHistoryResponse) {
    var orders = [];

    // var today = new Date();

    // var filterValues = [
    //     {
    //         displayValue: Resource.msg('orderhistory.sixty.days.option', 'order', null),
    //         optionValue: getSixtiethDayBackFromToday()
    //     },
    //     {        // fromDate=20210501&20210613
    //         displayValue: (today.getFullYear()).toString(),
    //         optionValue: (today.getFullYear()).toString()+"0101&"+(today.getFullYear()).toString()+"1231"
    //     },
    //     {
    //         displayValue: (today.getFullYear()-1).toString(),
    //         optionValue: (today.getFullYear()-1).toString()+"0101&"+(today.getFullYear()-1).toString()+"1231"
    //     },
    //     {
    //         displayValue: (today.getFullYear()-2).toString(),
    //         optionValue: (today.getFullYear()-2).toString()+"0101&"+(today.getFullYear()-2).toString()+"1231"
    //     },
    //     {
    //         displayValue: (today.getFullYear()-3).toString(),
    //         optionValue: (today.getFullYear()-3).toString()+"0101&"+(today.getFullYear()-3).toString()+"1231"
    //     }
    // ];
    
    if(s2korderHistoryResponse.totalCount > 0 && s2korderHistoryResponse.orderList.length > 0) {

        for(var i=0;i<s2korderHistoryResponse.orderList.length;i++) {
            var order = s2korderHistoryResponse.orderList[i];
            var orderData = {};
            

            if(!empty(order.webOrderNo)) {
                orderData.orderNumber = order.webOrderNo+"-"+order.backOrderCode;
            } else {
                orderData.orderNumber = order.orderNo+"-"+order.backOrderCode;
            }
            
            orderData.s2kOrderNumber = order.orderNo;
            orderData.priceTotal = formatCurrency(order.orderTotal,OrderConstants.US_CURRENCY_CUDE);

            //TODO: Get first line item from the response
            

            var firstLineItem = {};
            if(!empty(order.itemNumber)) {
                var ProductMgr = require('dw/catalog/ProductMgr');
                // var origPrd = ProductMgr.getProduct(order.itemNumber);
                var origPrd = ProductMgr.getProduct(order.itemNumber)
                if(!empty(origPrd)) {
                    var prdImages = origPrd.getImages("small");
                    // firstLineItem.imageURL = "/on/demandware.static/-/Sites-acme-catalog-m-en/default/dw021a8404/images/images/catalog/products/full/E74327FC-1A65-40FC-B683-AD15607E061C.jpg";
                    firstLineItem.imageURL = prdImages && prdImages.length > 0 && prdImages[0].url ? prdImages[0].url:"";
                    firstLineItem.alt = origPrd.shortDescription+",small";
                    firstLineItem.title = origPrd.shortDescription+" ";
                    firstLineItem.isPickUpInStore = false
                }
    
            }
            orderData.firstLineItem = firstLineItem;

            

            //TODO: Get it from the response
            orderData.productQuantityTotal = order.itemCount;

            orderData.shippedToFirstName = order.shiptoName;
            orderData.shippedToLastName = "";

            if(order.orderDate) {
                var orderDate = order.orderDate.toString();
                var dateFormat = orderDate.substring(0,4)+"/"+orderDate.substring(4,6)+"/"+orderDate.substring(6,8);
                orderData.creationDate = new Date(dateFormat);
            }

            orderData.orderStatus = order.statusDescription;
            orderData.backOrderCode = order.backOrderCode;
            orderData.s2kCustomerNumber = order.customer
            orderData.poNumber = order.poNumber;
            orders.push(orderData);
        }
        
    }
 
    return {
        orders: orders
    };
 }


 function getSixtiethDayBackFromToday(){
    var today = new Date();
    

    var sixtiethDate = new Date(today.getTime() - (60 * 24 * 60 * 60 * 1000));
    
    var sixtiethDateYear = sixtiethDate.getFullYear();
    var sixtiethDateMonth = sixtiethDate.getMonth()+1;
    var sixtiethDateDay = sixtiethDate.getDate();
    
    var todayYear = today.getFullYear();
    var todayMonth = today.getMonth()+1;
    var todayDate = today.getDate();

    return (sixtiethDateYear).toString()
                +(sixtiethDateMonth<10?'0' + sixtiethDateMonth:''+sixtiethDateMonth).toString()
                +(sixtiethDateDay<10?'0' + sixtiethDateDay:''+sixtiethDateDay).toString()
            +"&"+(todayYear).toString()
                +(todayMonth<10?'0'+ todayMonth:''+todayMonth).toString()
                +(todayDate<10?'0'+ todayDate:''+todayDate).toString();
    
 }


 function getFilterValues(){
    var today = new Date();

    var filterValues = [
        {
            displayValue: Resource.msg('orderhistory.sixty.days.option', 'order', null),
            optionValue: getSixtiethDayBackFromToday()
        },
        {        // fromDate=20210501&20210613
            displayValue: (today.getFullYear()).toString(),
            optionValue: (today.getFullYear()).toString()+"0101&"+(today.getFullYear()).toString()+"1231"
        },
        {
            displayValue: (today.getFullYear()-1).toString(),
            optionValue: (today.getFullYear()-1).toString()+"0101&"+(today.getFullYear()-1).toString()+"1231"
        },
        {
            displayValue: (today.getFullYear()-2).toString(),
            optionValue: (today.getFullYear()-2).toString()+"0101&"+(today.getFullYear()-2).toString()+"1231"
        },
        {
            displayValue: (today.getFullYear()-3).toString(),
            optionValue: (today.getFullYear()-3).toString()+"0101&"+(today.getFullYear()-3).toString()+"1231"
        }
    ];

    return filterValues;
    
 }

 
module.exports = {
    getS2KOrderDetailsFromResponse: getS2KOrderDetailsFromResponse,
    getOrderHistoryFromS2KResponse: getOrderHistoryFromS2KResponse,
    getSixtiethDayBackFromToday: getSixtiethDayBackFromToday,
    getFilterValues: getFilterValues
};
Object.keys(base).forEach(function (prop) {
    // eslint-disable-next-line no-prototype-builtins
    if (!module.exports.hasOwnProperty(prop)) {
        module.exports[prop] = base[prop];
    }
});
