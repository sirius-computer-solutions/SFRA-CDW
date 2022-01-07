'use strict';

/* API Includes */
var Logger = require('dw/system/Logger').getLogger('Fedex', 'service');

/* Local Includes */
var Fedex = require('*/cartridge/scripts/services/fedex');
var Configuration = require('*/cartridge/scripts/configuration');
var collections = require('*/cartridge/scripts/util/collections');

/**
 * Returns cartridge enable/disable status.
 *
 * @returns {boolean|null} Fedex enable/disable status.
 */
function isFedexEnabled() {
    return Configuration.enabled();
}

/**
 * Uses shipmentNo as a proxy for order placement status in the context of a shipment.
 *
 * @param {dw.order.Shipment} shipment Shipment to use in the avs calculation.
 * @returns {boolean} Order placement status.
 */
function isOrderPlaced(shipment) {
    return shipment.shipmentNo !== null;
}

/**
 * Checks current address to see if it is complete.
 *
 * @param {dw.order.Address} address Address to verify.
 * @returns {boolean} Order placement status.
 */
 function isValidAddress(address) {
    return ((address !== null) && (address.fullName !== null) && (address.address1 !== null) && (address.postalCode !== null));
}
/**
 * Builds out the request payload, including shipment, address, and customer information.
 * 
 * @param {dw.order.Address} address Address to verify.
 * @returns {Object} Item request object.
 */
function buildRequestPayload(address) {
    var requestPayload =
        <AddressValidationRequest xmlns="http://fedex.com/ws/addressvalidation/v4">
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
            <Version>
                <ServiceId>aval</ServiceId>
                <Major>4</Major>
                <Intermediate>0</Intermediate>
                <Minor>0</Minor>
            </Version>
            <AddressesToValidate>
                <Contact>
                    <PersonName></PersonName>
                    <CompanyName></CompanyName>
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
            </AddressesToValidate>
        </AddressValidationRequest>

    var ns = new Namespace("http://fedex.com/ws/addressvalidation/v4");

    //Contact
    requestPayload.ns:: AddressesToValidate.ns:: Contact.ns:: PersonName = address.fullName;
    requestPayload.ns:: AddressesToValidate.ns:: Contact.ns:: CompanyName = address.companyName || '';
    requestPayload.ns:: AddressesToValidate.ns:: Contact.ns:: PhoneNumber = address.phone;

    //Address
    requestPayload.ns:: AddressesToValidate.ns:: Address.ns:: StreetLines[0] = address.address1;
    requestPayload.ns:: AddressesToValidate.ns:: Address.ns:: StreetLines[1] = address.address2 || '';
    requestPayload.ns:: AddressesToValidate.ns:: Address.ns:: City = address.city;
    requestPayload.ns:: AddressesToValidate.ns:: Address.ns:: StateOrProvinceCode = address.stateCode;
    requestPayload.ns:: AddressesToValidate.ns:: Address.ns:: PostalCode = address.postalCode;
    requestPayload.ns:: AddressesToValidate.ns:: Address.ns:: CountryCode = 'US';

    return requestPayload;
};

/**
 * Grabs normalized / corrected address outr
 * 
 * @param {dw.order.Address} address Address to verify.
 * @param {Object} response Reponse object returned in the API request.
 */
function processAVSRecommendation(address, response) {

    if (response.object) {
        var responseXML = new XML(response.object);
        // TODO error handling here

        // TODO update address object
        // TODO need to export system object: OrderAddress for avs 
        var ns = new Namespace("http://fedex.com/ws/addressvalidation/v4");
        var addressResults = responseXML.ns:: AddressResults;
        var effectiveAddress = addressResults.ns:: EffectiveAddress;
        var streetLine1 = effectiveAddress.ns:: StreetLines[0];
        var streetLine2 = effectiveAddress.ns:: StreetLines[1] || '';
        var city = effectiveAddress.ns:: City;
        var state = effectiveAddress.ns:: StateOrProvinceCode;
        var postalCode = effectiveAddress.ns:: PostalCode;
        var countryCode = effectiveAddress.ns:: CountryCode;
        var avsState = addressResults.ns:: State;
        var attributes = addressResults.ns:: Attributes;
        var resolved = 'false';
        var dpv = 'false';

        for (var element in attributes) {
            var name = attributes[element].ns::Name;
            var value = attributes[element].ns::Value;
            if(name.toString() === 'DPV')
                dpv = value;
            else if (name.toString() === 'Resolved') 
                resolved = value;
        }

        var avsJSON = {
            streetLine1: streetLine1==null?"":streetLine1.toString(),
            streetLine2: streetLine2==null?"":streetLine2.toString(),
            city: city==null?"":city.toString(),
            state: state==null?"":state.toString(),
            postalCode: postalCode==null?"":postalCode.toString(),
            countryCode: countryCode==null?"":countryCode.toString(),
            avsState: avsState==null?"":avsState.toString(),
            //attributes: attributes.toString(),
            resolved: resolved==null?"":resolved.toString(),
            dpv: dpv==null?"":dpv.toString()
        };

        address.custom.fedexAVS = JSON.stringify(avsJSON);
        //address.address2 = 'avs: ' + streetLine1.toString();
    }
} 

/**
 * Instantiates new service instance and calls fedex endpoint with passed payload.
 *
 * @param {dw.order.Address} address Address to verify.
 * @returns {Object} API response.
 */
function applyAVSRecommendation(address) {
    if(isValidAddress(address)){
        var fedex = new Fedex();
        var requestPayload = buildRequestPayload(address);
        var avsResponse = fedex.avs.retrieve(requestPayload);
        processAVSRecommendation(address, avsResponse);
    }
}




module.exports = {
    applyAVSRecommendation: applyAVSRecommendation,
    processAVSRecommendation: processAVSRecommendation,
    isOrderPlaced: isOrderPlaced,
    isFedexEnabled: isFedexEnabled,
    buildRequestPayload: buildRequestPayload
};
