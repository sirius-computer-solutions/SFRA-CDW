'use strict';

/* API Includes */
var Logger = require('dw/system/Logger').getLogger('Fedex', 'service');

/* Local Includes */
var Fedex = require('*/cartridge/scripts/services/fedex');
var cacheHelper = require('*/cartridge/scripts/helpers/cacheHelper');
var Configuration = require('*/cartridge/scripts/configuration');
var collections = require('*/cartridge/scripts/util/collections');
var varsityHelper = require('*/cartridge/scripts/helpers/varsityHelper');
var dateHelper = require('*/cartridge/scripts/helpers/dateHelper');
var Transaction = require('dw/system/Transaction');

var Site = require('dw/system/Site');
const defaultShippingWeight = 1;
const weightThreshold = 150;
var rates = null;
var varsityJSONResponse = null;

/**
 * Returns cartridge enable/disable status.
 *
 * @returns {boolean|null} Fedex enable/disable status.
 */
function isFedexEnabled() {
    return Configuration.enabled();
}

/**
 * Identifies shipping method as one that should use Fedex rates.
 *
 * @param {dw.order.ShippingMethod} shippingMethod Shipping method being processed.
 * @returns {boolean} Fedex method status.
 */
function isFedexShippingMethod(shippingMethod) {
    return shippingMethod.custom.fedexRates === true;
}

/**
 * Uses shipmentNo as a proxy for order placement status in the context of a shipment.
 *
 * @param {dw.order.Shipment} shipment Shipment to use in the rates calculation.
 * @returns {boolean} Order placement status.
 */
function isOrderPlaced(shipment) {
    return shipment.shipmentNo !== null;
}

/**
 * Checks if rates are stored on the shipment from a shipping calculation.
 *
 * @param {dw.order.Shipment} shipment Shipment to use in the rates calculation.
 * @returns {boolean} Whether rates are stored on the shipment.
 */
function hasStoredRates(shipment) {
    return shipment.custom.fedexRatesCache !== null;
}

/**
 * Takes the product line item and builds according to if it is simple, bundle, or variant item and
 * 
 * @param {dw.order.Shipment} pli Product
 * @returns {Object} Item request object.
 */
 function buildPackageLineItems(shipment) {
    var packageLineItemsArray = [];

    var packageWeight = 0;
    
    collections.forEach(shipment.productLineItems, function (pli) {
        var product = pli.product && pli.product.variant ? pli.product.masterProduct : pli.product;

        //ACME - updated to use package-weight instead of dimWeight
        var productWeight = product.custom['package-weight'] || defaultShippingWeight;
        var productQuantity = pli.quantityValue;
        var packageCount = 0;

        for (var i = 1; i <= productQuantity; i++) {
            var tempPackageWeight = +packageWeight + +productWeight;
            if (tempPackageWeight <= weightThreshold) {
                // keep adding till we reach weightThreshold or till
                // weight of all quantities is added
                packageWeight += +productWeight;
            } else {
                // create new package
                packageCount++;
                packageLineItemsArray.push(new XML(createNewPackage(packageWeight, packageCount)));
                
                // reset package weight
                packageWeight = +productWeight;
                tempPackageWeight = 0;
            }
        }
        
        // if there is a positive weight then one more package need to
        // be created (for regular FedEx shipping items ONLY) 
        if (packageWeight > 0) {
            packageCount++;
            packageLineItemsArray.push(new XML(createNewPackage(packageWeight, packageCount)));
        }        
    });
    return packageLineItemsArray;
}

 function createNewPackage(shippingPackageWeight, sequenceNumber) {
    var packageLineItems =
            <RequestedPackageLineItems>
                <SequenceNumber>{sequenceNumber}</SequenceNumber>
                <GroupPackageCount>1</GroupPackageCount>
                <Weight>
                    <Units>LB</Units>
                    <Value>{shippingPackageWeight}</Value>
                </Weight>
            </RequestedPackageLineItems>;
    return packageLineItems;
 }


/**
 * Builds out the request payload, including shipment, address, and customer information.
 * 
 * @param {dw.order.Shipment} shipment Shipment to rate.
 * @param {dw.order.Address} address Address to rate.
 * @param {dw.customer.Customer|null} customer Customer to rate.
 * @returns {Object} Item request object.
 */
 function buildRequestPayload(shipment, address, customer) {
    //var requestPayload = <RateRequest xmlns="http://fedex.com/ws/rate/v28"><WebAuthenticationDetail><UserCredential><Key>CpJqv3RQUTX9mDr8</Key><Password>vM2noBV7Yr4ilELIFRPZPplAb</Password></UserCredential></WebAuthenticationDetail><ClientDetail><AccountNumber>510087240</AccountNumber><MeterNumber>119222049</MeterNumber></ClientDetail><TransactionDetail><CustomerTransactionId>RateRequest_v28</CustomerTransactionId></TransactionDetail><Version><ServiceId>crs</ServiceId><Major>28</Major><Intermediate>0</Intermediate><Minor>0</Minor></Version><RequestedShipment><ShipTimestamp>2021-06-25T12:34:56-06:00</ShipTimestamp><DropoffType>REGULAR_PICKUP</DropoffType><ServiceType></ServiceType><PackagingType></PackagingType><TotalWeight><Units>LB</Units><Value>20.0</Value></TotalWeight><Shipper><AccountNumber>510087240</AccountNumber><Contact><CompanyName>FedEx-WAPI</CompanyName><PhoneNumber>INPUT YOUR INFORMATION</PhoneNumber></Contact><Address><StreetLines>SN2000 Test Meter 8</StreetLines><StreetLines>10 Fedex Parkway</StreetLines><City>AUSTIN</City><StateOrProvinceCode>TX</StateOrProvinceCode><PostalCode>73301</PostalCode><CountryCode>US</CountryCode></Address></Shipper><Recipient><Contact><PersonName>Recipient Contact</PersonName><PhoneNumber>INPUT YOUR INFORMATION</PhoneNumber></Contact><Address><StreetLines>Recipient Address Line 1</StreetLines><StreetLines>Recipient Address Line 2</StreetLines><City>Collierville</City><StateOrProvinceCode>TN</StateOrProvinceCode><PostalCode>38017</PostalCode><CountryCode>US</CountryCode></Address></Recipient><ShippingChargesPayment><PaymentType>SENDER</PaymentType><Payor><ResponsibleParty><AccountNumber>510087240</AccountNumber><Tins><TinType>BUSINESS_STATE</TinType><Number>INPUT YOUR INFORMATION</Number></Tins></ResponsibleParty></Payor></ShippingChargesPayment><PackageCount>1</PackageCount><RequestedPackageLineItems><SequenceNumber>1</SequenceNumber><GroupNumber>1</GroupNumber><GroupPackageCount>1</GroupPackageCount><Weight><Units>LB</Units><Value>20.0</Value></Weight><Dimensions><Length>12</Length><Width>12</Width><Height>12</Height><Units>IN</Units></Dimensions><ContentRecords><PartNumber>123XX5</PartNumber><ItemNumber>INPUT YOUR INFORMATION</ItemNumber><ReceivedQuantity>12</ReceivedQuantity><Description>ContentDescription</Description></ContentRecords></RequestedPackageLineItems></RequestedShipment></RateRequest>;
    var requestPayload =
        <RateRequest xmlns="http://fedex.com/ws/rate/v28">
            <WebAuthenticationDetail>
                <UserCredential>
                    <Key></Key>
                    <Password></Password>
                </UserCredential>
            </WebAuthenticationDetail>
            <ClientDetail>
                <AccountNumber></AccountNumber>
                <MeterNumber></MeterNumber>
            </ClientDetail>
            <TransactionDetail>
                <CustomerTransactionId>RateRequest_v28</CustomerTransactionId>
            </TransactionDetail>
            <Version>
                <ServiceId>crs</ServiceId>
                <Major>28</Major>
                <Intermediate>0</Intermediate>
                <Minor>0</Minor>
            </Version>
            <RequestedShipment>
                <ShipTimestamp>2021-06-25T12:34:56-06:00</ShipTimestamp>
                <DropoffType>REGULAR_PICKUP</DropoffType>
                <ServiceType />
                <PackagingType />
                <Shipper>
                    <Address>
                        <StreetLines>1603 12th Ave North</StreetLines>
                        <StreetLines></StreetLines>
                        <City>Grand Forks</City>
                        <StateOrProvinceCode>ND</StateOrProvinceCode>
                        <PostalCode>58201</PostalCode>
                        <CountryCode>US</CountryCode>
                    </Address>
                </Shipper>
                <Recipient>
                    <Contact>
                        <PersonName></PersonName>
                        <PhoneNumber></PhoneNumber>
                    </Contact>
                    <Address>
                        <StreetLines></StreetLines>
                        <StreetLines></StreetLines>
                        <City></City>
                        <StateOrProvinceCode></StateOrProvinceCode>
                        <PostalCode></PostalCode>
                        <CountryCode></CountryCode>
                    </Address>
                </Recipient>
                <RateRequestTypes>LIST</RateRequestTypes>
                <PackageCount></PackageCount>
            </RequestedShipment>
        </RateRequest>;

    var ns = new Namespace("http://fedex.com/ws/rate/v28");

    //destination
    requestPayload.ns:: RequestedShipment.ns:: Recipient.ns:: Contact.ns:: PersonName = address.fullName;
    requestPayload.ns:: RequestedShipment.ns:: Recipient.ns:: Contact.ns:: PhoneNumber = address.phone;
    requestPayload.ns:: RequestedShipment.ns:: Recipient.ns:: Address.ns:: StreetLines[0] = address.address1;
    requestPayload.ns:: RequestedShipment.ns:: Recipient.ns:: Address.ns:: StreetLines[1] = address.address2;
    requestPayload.ns:: RequestedShipment.ns:: Recipient.ns:: Address.ns:: City = address.city;
    requestPayload.ns:: RequestedShipment.ns:: Recipient.ns:: Address.ns:: StateOrProvinceCode = address.stateCode;
    requestPayload.ns:: RequestedShipment.ns:: Recipient.ns:: Address.ns:: PostalCode = address.postalCode;
    requestPayload.ns:: RequestedShipment.ns:: Recipient.ns:: Address.ns:: CountryCode = 'US';

    //package
    var packageLineItems = buildPackageLineItems(shipment);
    var packageCount = packageLineItems.length;
    requestPayload.ns:: RequestedShipment.ns:: PackageCount = packageCount;
    packageLineItems.forEach(element => {
        requestPayload.ns:: RequestedShipment.ns::RequestedPackageLineItems = element;
    });
    return requestPayload;
 };

/**
 * Sets the processed rates on the shipment object for future reference.
 *
 * This function is necessitated by the model architecture used in SFRA. Because
 * calls for rates happen even after order placement, we must provide a way to access
 * the rates without making a meaningless rate request. Further, this function does
 * include a transcation intentionally. This is because the rates should really only
 * be set during rate calculation, which happens within a transactional hook.
 *
 * @param {dw.order.Shipment} shipment Shipment to use in the rates calculation.
 * @param {Object} rates rate data in useful format.
 */
function setStoredRates(shipment, rates) {
    try {
        // eslint-disable-next-line no-param-reassign
        if (Object.keys(rates).length){
            var stringifiedRate = JSON.stringify(rates);
            Transaction.begin();
            shipment.custom.fedexRatesCache = stringifiedRate;
            Transaction.commit();
        } 
    } catch (e) {
        var exception = e;
        Logger.error('Stringifying rates for storage: {0}', e);
    }
}

/**
 * Retrieves rates stored on shipment during calculation as an object.
 *
 * @param {dw.order.Shipment} shipment Shipment to use in the rates calculation.
 * @returns {Object} Stored rate data.
 */
function getStoredRates(shipment) {
    var rates;
    var ratesString = shipment.custom.fedexRatesCache;

    try {
        rates = JSON.parse(ratesString);
    } catch (e) {
        Logger.error('Error parsing shipment stored rates: {0}', e);
    }

    return rates;
}

/**
 * Instantiates new service instance and calls rates endpoint with passed payload.
 *
 * @param {Object} requestPayload Prepared API request body.
 * @returns {Object} API response.
 */
function getAPIRate(requestPayload) {
    var fedex = new Fedex();
    return fedex.rates.retrieve(requestPayload);
}

/**
 * Iterates over the returned shipping rates and pulls out the data we need
 * TODO Switch this to accept an array of responses and process them all at once
 * 
 * @param {Object} response Reponse object returned in the API request.
 * @returns {Object} Rate data in useful format.
 */
function processRates(response) {
    var ratesList = {};

    if (response.object) {
        var responseXML = new XML(response.object);        
        // Logger.debug("responseXML: " + responseXML);
        
        var ns = new Namespace("http://fedex.com/ws/rate/v28");
        var rateReplyDetails = (responseXML.ns::RateReplyDetails);

        for (var element in rateReplyDetails) {
            var type = rateReplyDetails[element].ns::ServiceType;
            var description = rateReplyDetails[element].ns::ServiceDescription.ns::Description;
            var name = description;
            var ratedShipmentDetails = rateReplyDetails[element].ns::RatedShipmentDetails;

            for (var detail in ratedShipmentDetails){
                var rateType = ratedShipmentDetails[detail].ns::ShipmentRateDetail.ns::RateType;
                //only fetch list pricing per current wcs implementation
                if('PAYOR_LIST_PACKAGE' == rateType){
                    var currency = ratedShipmentDetails[detail].ns::ShipmentRateDetail.ns::TotalNetCharge.ns::Currency;
                    var amount = ratedShipmentDetails[detail].ns::ShipmentRateDetail.ns::TotalNetCharge.ns::Amount;
                }
            }

            ratesList[type] = {
                ID: type,
                displayName: name,
                description: description,
                shippingCost: {
                    amount: {
                        currencyCode: currency.toUpperCase(),
                        value: amount.toUpperCase()
                    }
                }
            };
        }
       
    }

    return ratesList;
}

/**
 * Retreives shipping rates from the Fedex service or cache if available.
 *
 * @param {dw.order.Shipment} shipment Shipment to use in the rates calculation.
 * @param {dw.order.Address} address Shipping address to use in the rates calculation.
 * @param {dw.customer.Customer} customer Customer to use in rates calculation.
 * @returns {Object} Rate data in useful format.
 */
function getRates(shipment, address, customer) {

    if(rates==null) // lazy load
    {
        var orderPlaced = isOrderPlaced(shipment);

        if (orderPlaced && hasStoredRates(shipment)) {
            rates = getStoredRates(shipment);
        }

        if (!orderPlaced && isFedexEnabled()) {
            var shippingAddress = address;
            if (!shippingAddress && shipment && shipment.shippingAddress) {
                shippingAddress = shipment.shippingAddress;
            }

            // If there's a shipping address with a zip code, we can compute rates
            if (shippingAddress && shippingAddress.postalCode) {
                try {
                    var requestPayload = buildRequestPayload(shipment, shippingAddress, customer);
                    
                    rates = cacheHelper.getCache(requestPayload, function () {
                        var response = getAPIRate(requestPayload);
                        var processedRates = processRates(response);
                        // Store the processed rates for post-order placement
                        setStoredRates(shipment, processedRates);
                        return processedRates;
                    });
                    
                } catch (e) {
                    Logger.error('Error retrieving rates: {0}', e);
                }
            }
        }

    }
    

    return rates || {};
}

/**
 * Retrieve a single shipping rate.
 *
 * Due to the common use case and for the sake of efficiency, this relies on the
 * bulk rate retrieval as it is likely cached, instead of requesting just this rate.
 *
 * @param {dw.order.ShippingMethod} shippingMethod Method to retrieve from the rates.
 * @param {dw.order.Shipment} shipment Shipment to rate.
 * @param {dw.order.OrderAddress} address Address to rate.
 * @param {dw.customer.Customer} customer Customer to rate.
 * @returns {Object} Destination request object.
 */
function getRate(shippingMethod, shipment, address, customer) {
    var rate;
    if (isFedexShippingMethod(shippingMethod)) {
        var rates = getRates(shipment, address, customer);
        // eslint-disable-next-line no-prototype-builtins
        if ('fedexServiceType' in shippingMethod.custom && shippingMethod.custom.fedexServiceType && rates.hasOwnProperty(shippingMethod.custom.fedexServiceType)) {
            rate = rates[shippingMethod.custom.fedexServiceType];
            // apply discount specified at shippingMethod
            var rateValue = rate.shippingCost.amount.value;
            var discount = shippingMethod.custom.fedexRateDiscount;
            if(discount && rateValue) {
                Logger.debug('Discount found at shippingMethod level, updating rate: ' + rate);
                rateValue = rateValue * (100 - discount) / 100;
                Logger.debug('New rate: ' + rate);
                rate = JSON.parse(JSON.stringify(rate));
                rate.shippingCost.amount.value = rateValue;
            }
        }            
    }
    return rate;
}

/**
 * Retrieves rate for a given shipment and shipping method.
 *
 * @param {dw.order.ShippingMethod} shippingMethod Shipping method rate to retieve.
 * @param {dw.order.Shipment} shipment Shipment to use in the rates calculation.
 * @param {dw.order.Address} address Shipping address to use in the rates calculation.
 * @param {dw.customer.Customer} customer Customer to use in rates calculation.
 * @returns {Object|null} Requested rate or null if not available.
 */
function getShippingCost(shippingMethod, shipment, address, customer) {
    var rate = getRate(shippingMethod, shipment, address, customer);

    return rate ? rate.shippingCost : null;
}

/**
 * Creates a filter function to use when processing SFCC shipping methods with Fedex rates.
 *
 * @param {dw.order.Shipment} shipment Shipment to use in the rates calculation.
 * @param {dw.order.Address} address Shipping address to use in the rates calculation.
 * @param {dw.customer.Customer} customer Customer to use in rates calculation.
 * @returns {Function} Filter function used to remove invalid shipping methods.
 */
function getShippingMethodFilter(shipment, address, customer) {
    var rates = getRates(shipment, address, customer);

    var filterFunction = function (shippingMethod) {
        // eslint-disable-next-line no-prototype-builtins
        return isFedexShippingMethod(shippingMethod) && (!('fedexServiceType' in shippingMethod.custom ) || !rates.hasOwnProperty(shippingMethod.custom.fedexServiceType));
    };

    return filterFunction;
}

/**
 * Formats shipping rate based on the provided currency.
 *
 * @param {number} value Numeric value to format.
 * @param {string} currencyCode Currency code corresponding to the value.
 * @returns {string} Formatted shipping rate. *
 */
function formatShippingCost(value, currencyCode) {
    var formatCurrency = require('*/cartridge/scripts/util/formatting').formatCurrency;

    return formatCurrency(value, currencyCode);
}

/**
 * Fetches the estimated arrival time based on the varsityServiceType.
 *
 * @param {dw.order.ShippingMethod} shippingMethod Shipping method rate to retieve.
 * @param {dw.order.Shipment} shipment Shipment to use in the rates calculation.
 * @returns {string} estimated arrival time for the respective shipping method.
 */
function getEstimatedArrival(shippingMethod, shipment) {
    if(shipment.shippingAddress) {
        var zipCode = shipment.shippingAddress.postalCode;
        if(zipCode) {
            if(varsityJSONResponse ==null) // Implementing Lazy Load
                varsityJSONResponse= varsityHelper.getVarsityResponse(zipCode);
            if(varsityJSONResponse != null && !varsityJSONResponse.error) {
                var dateRange = varsityHelper.getEstimatedDateRange(varsityJSONResponse, shippingMethod.custom.addOneDayForPastNoonOrder, shippingMethod.custom.varsityServiceType, shippingMethod.custom.rangeStartDatePad, shippingMethod.custom.rangeEndDatePad);
                if(dateRange) {
                    var {
                        estStartDate,
                        estEndDate
                    } = dateRange;
                    
                    estStartDate = dateHelper.formatShippingDate(estStartDate);
                    if(!empty(estEndDate)) {
                        estEndDate = dateHelper.formatShippingDate(estEndDate);
                    }

                    var estArrTime = estStartDate + ' - ' + estEndDate;
                    if(estEndDate == null) {
                         estArrTime = estStartDate;
                    }else{
                         estArrTime = estStartDate + ' - ' + estEndDate;
                    }
                    
                    return estArrTime;
                }
            }
        }
    } 
    return;
}

/**
 * Applies rate data to the shipping method model.
 *
 * @param {Object} shippingMethodModel Model representing the shipping method.
 * @param {dw.order.ShippingMethod} shippingMethod Shipping method rate to retieve.
 * @param {dw.order.Shipment} shipment Shipment to use in the rates calculation.
 */
function applyShippingRateData(shippingMethodModel, shippingMethod, shipment) {
    var requestPath =request.httpPath; // 
    if(requestPath.indexOf('/')!=-1)
    {
        requestPath = requestPath.substring(requestPath.lastIndexOf('/')+1,requestPath.length);
    }

    var calculateShippingCostURLs = Site.current.getCustomPreferenceValue('calculateShippingCostURLs') || ['CheckoutShippingServices-SelectShippingMethod', 'Checkout-Begin','CheckoutShippingServices-SubmitShipping'];
    if(calculateShippingCostURLs.indexOf(requestPath)!=-1)
    {
        var rate = getRate(shippingMethod, shipment, shipment.shippingAddress, customer);
        var fedexShippingMethod = shippingMethodModel;
        if (rate) {
            // eslint-disable-next-line no-param-reassign
            fedexShippingMethod.shippingCost = formatShippingCost(rate.shippingCost.amount.value, rate.shippingCost.amount.currencyCode);
            /** Add any additional model updates based on Fedex rates here by either setting the value of an existing property or defining a new property */
            fedexShippingMethod.estimatedArrivalTime = rate.custom ? rate.custom.estimatedArrivalTime : null;
        }
        var varsityEnabled = Site.current.getCustomPreferenceValue('enableVarsity') || false;
        if(varsityEnabled) {
            var estArrTime = getEstimatedArrival(shippingMethod, shipment);
            if(estArrTime) {
                fedexShippingMethod.estimatedArrivalTime = estArrTime;
            }
        }
    }
    
}

module.exports = {
    applyShippingRateData: applyShippingRateData,
    getShippingCost: getShippingCost,
    getShippingMethodFilter: getShippingMethodFilter,
    isOrderPlaced: isOrderPlaced,
    isFedexEnabled: isFedexEnabled,
    isFedexShippingMethod: isFedexShippingMethod,
    buildRequestPayload: buildRequestPayload,
    getEstimatedArrival: getEstimatedArrival
};
