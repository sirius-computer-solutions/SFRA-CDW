'use strict';
var server = require('server');
server.extend(module.superModule);

var URLUtils = require('dw/web/URLUtils');
var Resource = require('dw/web/Resource');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
var b2bUtils = require('*/cartridge/scripts/helpers/b2bUtils');
var s2kConstants = require('*/cartridge/scripts/utils/s2kServiceConstants').getConstants();
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');




/**
 * Address-List : Used to show a list of address created by a registered shopper
 * @name Base/Address-List
 * @function
 * @memberof Address
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {middleware} - consentTracking.consent
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
 server.append('List', userLoggedIn.validateLoggedIn, consentTracking.consent, function (req, res, next) {

    res.setViewData({
        breadcrumbs: [
            {
                htmlValue: Resource.msg('global.home', 'common', null),
                url: URLUtils.home().toString()
            },
            {
                htmlValue: Resource.msg('page.title.myaccount', 'account', null),
                url: URLUtils.url('Account-Show').toString()
            },
            {
                htmlValue: Resource.msg('page.title.addressbook', 'account', null),
                url: URLUtils.url('Account-Show').toString()
            }
        ]
    });

    var computedMetaData = {
        title: Resource.msg('account.page.address.list.description', 'account', null), 
        description: Resource.msg('account.page.address.list.description', 'account', null),
        keywords: Resource.msg('account.page.address.list.description', 'account', null),
        pageMetaTags: []
    };
    var pageGroup = {name: Resource.msg('account.page.pageGroup.name', 'account', null),
                    ID: Resource.msg('account.page.pageGroup.name', 'account', null),
                    content: Resource.msg('account.page.address.list.pageGroup.value', 'account', null)};
    var robots = {name: Resource.msg('account.page.robots.name', 'account', null),
                    ID: Resource.msg('account.page.robots.name', 'account', null),
                    content: Resource.msg('account.page.robots.value', 'account', null)};                    
    computedMetaData.pageMetaTags.push(pageGroup);
    computedMetaData.pageMetaTags.push(robots);

    res.setViewData({
        CurrentPageMetaData: computedMetaData
    });
    next();
});


/**
 * Address-List : Used to show a list of address created by a registered shopper
 * @name Base/Address-EditAddress
 * @function
 * @memberof Address
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {middleware} - consentTracking.consent
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
 server.append('EditAddress', userLoggedIn.validateLoggedIn, consentTracking.consent, function (req, res, next) {

    var computedMetaData = {
        title: Resource.msg('account.page.address.edit.description', 'account', null), 
        description: Resource.msg('account.page.address.edit.description', 'account', null),
        keywords: Resource.msg('account.page.address.edit.description', 'account', null),
        pageMetaTags: []
    };
    var pageGroup = {name: Resource.msg('account.page.pageGroup.name', 'account', null),
                    ID: Resource.msg('account.page.pageGroup.name', 'account', null),
                    content: Resource.msg('account.page.address.edit.pageGroup.value', 'account', null)};
    var robots = {name: Resource.msg('account.page.robots.name', 'account', null),
                    ID: Resource.msg('account.page.robots.name', 'account', null),
                    content: Resource.msg('account.page.robots.value', 'account', null)};                    
    computedMetaData.pageMetaTags.push(pageGroup);
    computedMetaData.pageMetaTags.push(robots);

    res.setViewData({
        CurrentPageMetaData: computedMetaData
    });
    next();
});


/**
 * Address-List : Used to show a list of address created by a registered shopper
 * @name Base/Address-EditAddress
 * @function
 * @memberof Address
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {middleware} - consentTracking.consent
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
 server.append('AddAddress', userLoggedIn.validateLoggedIn, consentTracking.consent, function (req, res, next) {

    var computedMetaData = {
        title: Resource.msg('account.page.address.add.description', 'account', null), 
        description: Resource.msg('account.page.address.add.description', 'account', null),
        keywords: Resource.msg('account.page.address.add.description', 'account', null),
        pageMetaTags: []
    };
    var pageGroup = {name: Resource.msg('account.page.pageGroup.name', 'account', null),
                    ID: Resource.msg('account.page.pageGroup.name', 'account', null),
                    content: Resource.msg('account.page.address.add.pageGroup.value', 'account', null)};
    var robots = {name: Resource.msg('account.page.robots.name', 'account', null),
                    ID: Resource.msg('account.page.robots.name', 'account', null),
                    content: Resource.msg('account.page.robots.value', 'account', null)};                    
    computedMetaData.pageMetaTags.push(pageGroup);
    computedMetaData.pageMetaTags.push(robots);

    res.setViewData({
        CurrentPageMetaData: computedMetaData
    });
    next();
});

/**
 * Address-SaveAddress : Save a new or existing address
 * @name Base/Address-SaveAddress
 * @function
 * @memberof Address
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {querystringparameter} - addressId - a string used to identify the address record
 * @param {httpparameter} - dwfrm_address_addressId - An existing address id (unless new record)
 * @param {httpparameter} - dwfrm_address_firstName - A person’s first name
 * @param {httpparameter} - dwfrm_address_lastName - A person’s last name
 * @param {httpparameter} - dwfrm_address_address1 - A person’s street name
 * @param {httpparameter} - dwfrm_address_address2 -  A person’s apartment number
 * @param {httpparameter} - dwfrm_address_country - A person’s country
 * @param {httpparameter} - dwfrm_address_states_stateCode - A person’s state
 * @param {httpparameter} - dwfrm_address_city - A person’s city
 * @param {httpparameter} - dwfrm_address_postalCode - A person’s united states postel code
 * @param {httpparameter} - dwfrm_address_phone - A person’s phone number
 * @param {httpparameter} - csrf_token - hidden input field CSRF token
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
 server.replace('SaveAddress', csrfProtection.validateAjaxRequest, function (req, res, next) {

    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Transaction = require('dw/system/Transaction');
    var formErrors = require('*/cartridge/scripts/formErrors');
    var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');
    var addressHelpers = require('*/cartridge/scripts/helpers/addressHelpers');

    var addressForm = server.forms.getForm('address');
    var addressFormObj = addressForm.toObject();
    addressFormObj.addressForm = addressForm;
    var customer = CustomerMgr.getCustomerByCustomerNumber(
        req.currentCustomer.profile.customerNo
    );
    var addressBook = customer.getProfile().getAddressBook();
    if (addressForm.valid) {
        res.setViewData(addressFormObj);
        this.on('route:BeforeComplete', function () { // eslint-disable-line no-shadow
            var formInfo = res.getViewData();
            Transaction.wrap(function () {
                var address = null;
                if (formInfo.addressId.equals(req.querystring.addressId) || !addressBook.getAddress(formInfo.addressId)) {
                    address = req.querystring.addressId
                        ? addressBook.getAddress(req.querystring.addressId)
                        : addressBook.createAddress(formInfo.addressId);
                }

                if (address) {
                    if (req.querystring.addressId) {
                        address.setID(formInfo.addressId);
                    }

                    // Save form's address
                    addressHelpers.updateAddressFields(address, formInfo);

                    
                    // Send account edited email
                    accountHelpers.sendAccountEditedEmail(customer.profile);

                    /**Logic to update the S2K with the address information if the user is B2B user and has the account number */
                    if(customer.registered && customer.profile && customer.profile.custom 
                        && customer.profile.custom.b2bUser && customer.profile.custom.b2bAccountNumber) {
                            /*Check if the  b2bS2KAddressId is present, if its request is for update, so we update the S2K, if not we create the S2K Address and get the response from S2K and update the same field */
                            if(address.custom && "b2bS2KAddressId" in address.custom && !empty(address.custom.b2bS2KAddressId)) { //This means, existing address so its update
                                var s2kAddressJSONRequest = b2bUtils.populateS2KAddressRequest(address, address.custom.b2bS2KAddressId, customer.profile.custom.b2bAccountNumber, s2kConstants.ADDRESS_ACTIVE);
                                var s2kAddressResponse = hooksHelper('app.s2k.b2b.address_sync', 'AddressSync', s2kAddressJSONRequest, function () {});

                            } else {
                                var s2kAddressJSONRequest = b2bUtils.populateS2KAddressRequest(address, '', customer.profile.custom.b2bAccountNumber, s2kConstants.ADDRESS_ACTIVE);
                                var s2kAddressResponse = hooksHelper('app.s2k.b2b.address_sync', 'AddressSync', s2kAddressJSONRequest, function () {});
                                if(s2kAddressResponse.success && !empty(s2kAddressResponse.addressId)) {
                                    address.custom.b2bS2KAddressId = s2kAddressResponse.addressId;
                                }
                                
                            }
                            
                    }

                    res.json({
                        success: true,
                        redirectUrl: URLUtils.url('Address-List').toString()
                    });
                } else {
                    formInfo.addressForm.valid = false;
                    formInfo.addressForm.addressId.valid = false;
                    formInfo.addressForm.addressId.error =
                        Resource.msg('error.message.idalreadyexists', 'forms', null);
                    res.json({
                        success: false,
                        fields: formErrors.getFormErrors(addressForm)
                    });
                }
            });
        });
    } else {
        res.json({
            success: false,
            fields: formErrors.getFormErrors(addressForm)
        });
    }
    return next();
});

/**
 * Address-DeleteAddress : Delete an existing address
 * @name Base/Address-DeleteAddress
 * @function
 * @memberof Address
 * @param {middleware} - userLoggedIn.validateLoggedInAjax
 * @param {querystringparameter} - addressId - a string used to identify the address record
 * @param {querystringparameter} - isDefault - true if this is the default address. false otherwise
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - get
 */
server.append('DeleteAddress', userLoggedIn.validateLoggedInAjax, function (req, res, next) {

    var addressId = req.querystring.addressId;
    var addressBook = customer.getProfile().getAddressBook();
    var address = addressBook.getAddress(addressId);

    /**Logic to update the S2K with the address information if the user is B2B user and has the account number */
    if(customer.registered && customer.profile && customer.profile.custom 
        && customer.profile.custom.b2bUser && customer.profile.custom.b2bAccountNumber) {
            if(address.custom && "b2bS2KAddressId" in address.custom && !empty(address.custom.b2bS2KAddressId)) { //This means, existing address so its update
                var s2kAddressJSONRequest = b2bUtils.populateS2KAddressRequest(address, address.custom.b2bS2KAddressId, customer.profile.custom.b2bAccountNumber, s2kConstants.ADDRESS_INACTIVE);
                var s2kAddressResponse = hooksHelper('app.s2k.b2b.address_sync', 'AddressSync', s2kAddressJSONRequest, function () {});

            }

    }
    return next();
});


module.exports = server.exports();