'use strict';

var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var UUIDUtils = require('dw/util/UUIDUtils');
const Resource = require('dw/web/Resource');
const Logger = require('dw/system/Logger');
var b2bLogger = Logger.getLogger('B2B', 'B2B_General');

var s2kConstants = require('*/cartridge/scripts/utils/s2kServiceConstants').getConstants();

/**
 * Checks if the custom B2BOrganization object exists for the specified account.
 *
 * @param {string} accountNumber 
 * @returns {boolean} true if the B2BOrganization exists, false otherwise
 */
 function b2bOrganizationExists(accountNumber) {
    var result;
    try {
        var b2bOrganization = CustomObjectMgr.getCustomObject('B2BOrganization', accountNumber);
        b2bOrganization == null ? result = false : result = true;
    } catch (error) {
        b2bLogger.info(Resource.msgf('b2b.errors.org.not.found', 'b2berrors', null, accountNumber));
        result = false;
    }
    return result;
}

/**
 * Creates the custom B2BOrganization object for the B2B Administrator.
 * @param {string} organizationName
 * @param {string} accountNumber
 * @param {string} accountAdminLoginId
 * @returns {CustomObject} object The B2BOrganization custom object
 */
 function createB2BOrganization(organizationName, accountNumber, accountAdminLoginId) {
    var b2bOrganization;
    try {
        b2bOrganization = CustomObjectMgr.createCustomObject('B2BOrganization', UUIDUtils.createUUID());
        b2bOrganization.custom.organizationName = organizationName;
        b2bOrganization.custom.accountNumber = accountNumber;
        b2bOrganization.custom.accountAdminLoginId = accountAdminLoginId;
    } catch (error) {
        b2bLogger.error(Resource.msgf('b2b.errors.org.create', 'b2berrors', null, accountAdminLoginId));
        return null;
    }

    return b2bOrganization;
};

/**
 * Creates and sends the B2B registered user email message.
 * @param {form} registrationForm
 */
 function createSendB2BRegisteredUserEmail(registrationForm) {
    var hooksHelper = require('*/cartridge/scripts/helpers/hooks');

    try {
        var userDetails = {
            logonId: registrationForm.logonId, 
            email: registrationForm.email, 
            firstName: registrationForm.firstName, 
            lastName: registrationForm.lastName, 
            accountNumber: registrationForm.b2bAccountNumber || Resource.msg('user.registration.email.noS2KAccountNumber', 'b2bUserRegistration', null), 
            organizationName: registrationForm.organizationName,
            phone: registrationForm.phone,
            interestedInACA: registrationForm.interestedInACA 
        };

        hooksHelper('app.b2b.registration.email', 'sendB2BRegisteredUserEmail', userDetails, function () {});

      } catch (error) {
        b2bLogger.error(Resource.msgf('b2b.errors.b2b.email.send', 'b2berrors', null, registrationForm.logonId));
        return null;
    }
};

/**
 * Creates and sends the B2B Contact Account Manager email message.
 * @param {form} contactAccountManagerForm
 */
 function createSendB2BContactAccountManagerEmail(contactAccountManagerForm) {
    var hooksHelper = require('*/cartridge/scripts/helpers/hooks');

    try {

        hooksHelper('app.b2b.accountmanager.email', 'sendB2BContactAccountManagerEmail', contactAccountManagerForm, function () {});

      } catch (error) {
        b2bLogger.error(Resource.msgf('b2b.errors.b2b.account.manager.email.send', 'b2berrors', null, contactAccountManagerForm.customerEmailAddress));
        return null;
    }
};

/**
 * Creates the JSON Request for the address operations.
 * @param {address} address
 * @returns {addressJSONObject} addressJSONObject
 */
 function populateS2KAddressRequest(address, existingId, b2bAcccountNumber, status) {

    var addressJSONObject;

    try {
        addressJSONObject = {
            statusCode: status, 
            billto: b2bAcccountNumber, 
            id: existingId, 
            name: address.fullName, 
            address1: address.address1, 
            address2: !empty(address.address2)?address.address2:"", 
            address3: '', 
            city: address.city, 
            state: address.stateCode, 
            zip: address.postalCode, 
            country: s2kConstants.S2KCOUNTRY_CODE, 
            phoneNumber: address.phone            
        };


      } catch (error) {
        b2bLogger.error("Error creating JSON Object for Address Sync.");
        return null;
    }
    return addressJSONObject;
};

/**
 * Update the address now
 * @param {address} currentAddress
 * @param {address} s2kAddress* 
 * @returns {addressJSONObject} addressJSONObject
 */
 function updateAddress(currentAddress, s2kAddress) {
    if(!empty(currentAddress)) {
        currentAddress.custom.b2bS2KAddressId = s2kAddress.id;
        currentAddress.address1 = s2kAddress.address1;
        currentAddress.address2 = s2kAddress.address2;
        currentAddress.city = s2kAddress.city;
        currentAddress.stateCode = s2kAddress.state;
        currentAddress.postalCode = s2kAddress.zip;
        currentAddress.phone = formatPhoneNumber(s2kAddress.phoneNumber);
        currentAddress.countryCode = s2kConstants.COUNTRY_CODE;
        var splittedName = s2kAddress.name.split(" ");
        currentAddress.firstName = splittedName[0]; 
        currentAddress.lastName = splittedName[1];
    }


 };

/**
 * Sync the address from the S2K Account info to the buyers profile
 *  - If the addressId is found at profile, then just update it
 *  - If its NOT found, create the address
 * @param {address} s2kShipToAddresses
 * @returns {addressJSONObject} addressJSONObject
 */
 function syncAccountShipToAddress(s2kShipToAddresses) {
    var collections = require('*/cartridge/scripts/util/collections');

    try {
        var rawAddressBook = customer.addressBook.getAddresses();

        if(!empty(s2kShipToAddresses)) {
            for(var i=0;i<s2kShipToAddresses.length;i++) {
                var s2kAddress = s2kShipToAddresses[i];
                var s2kAddressId = s2kAddress.id;
                var addressAlreadyPresent = false;

                var addressBook = collections.map(rawAddressBook, function (rawAddress) {
                    var s2kAddressIdLocal = rawAddress.custom.b2bS2KAddressId;
                    if(s2kAddressIdLocal == s2kAddressId && 
                            s2kAddress.statusCode == s2kConstants.ADDRESS_ACTIVE) { 
                        addressAlreadyPresent = true;
                        updateAddress(rawAddress,s2kAddress);
                    }
                });

                if(!addressAlreadyPresent) { //Create new addresshere
                    var newAddress = customer.addressBook.createAddress(s2kAddress.address1);
                    if(empty(newAddress)) {
                        newAddress = customer.addressBook.createAddress(s2kAddress.zip+"_"+s2kAddress.address1);
                    }
                    updateAddress(newAddress,s2kAddress);
                } 
            }
        }



      } catch (error) {
          var a = error;
        b2bLogger.error("Error creating JSON Object for Address Sync.");
        return null;
    }

};

/**
 * Format the phone number to 123-123-1234 if that is already NOT
 * @param {string} phoneNumber
 * @returns {string} formattedPhoneNumber
 */
 function formatPhoneNumber(phoneNumber) {
    if(empty(phoneNumber)) {
        return "";
    }

    var phonenoExp = /^\d{3}?(-|\s)?\d{3}(-|\s)\d{4}$/;
    if(phoneNumber.match(phonenoExp)) {
        return phoneNumber;
    }else {
        phoneNumber = phoneNumber.slice(0,3)+"-"+phoneNumber.slice(3,6)+"-"+phoneNumber.slice(6,15);
      return phoneNumber;
    }
 };


module.exports = {
    b2bOrganizationExists : b2bOrganizationExists,
    createB2BOrganization : createB2BOrganization,
    createSendB2BRegisteredUserEmail : createSendB2BRegisteredUserEmail,
    createSendB2BContactAccountManagerEmail : createSendB2BContactAccountManagerEmail,
    populateS2KAddressRequest : populateS2KAddressRequest,
    syncAccountShipToAddress: syncAccountShipToAddress,
    updateAddress: updateAddress,
    formatPhoneNumber: formatPhoneNumber
};
