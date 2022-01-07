'use strict';

/**
 * @namespace B2BBuyer
 */

var server = require('server');

var URLUtils = require('dw/web/URLUtils');
var Resource = require('dw/web/Resource');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var validationHelper = require('*/cartridge/scripts/helpers/validationHelper');

/**
 * Creates a list of buyer objects for the B2B account.
 * @param {string} b2bAccountNumber - the B2B account number
 * @returns {List} a list of buyers objects for the B2B account
 */
 function getBuyerList(b2bAccountNumber) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var profiles = [];
    var result = [];
    
    // Fix for ACME-1644
    if (b2bAccountNumber !== null && !empty(b2bAccountNumber)) {
        profiles = CustomerMgr.queryProfiles('custom.b2bAccountNumber = {0}', 'creationDate asc', b2bAccountNumber).asList().toArray();
    
        if (profiles) {
            for (var i = 0, ii = profiles.length; i < ii; i++) {
                var buyer = {
                    firstName : profiles[i].firstName,
                    lastName : profiles[i].lastName,
                    logonId : profiles[i].credentials.login,
                    email : profiles[i].email,
                    phone : profiles[i].phoneHome,
                    enabled : profiles[i].credentials.enabled,
                    buyerAdmin : profiles[i].custom.b2bAdmin,
                    customerNo : profiles[i].customerNo
                };
                result.push(buyer);
            }
        }        
    }

    return result;
}

/**
 * B2BBuyer-List : Used to show the list of buyers for the B2B account.
 * @name B2BBuyer-List
 * @function
 * @memberof Account
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {middleware} - consentTracking.consent
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('List', userLoggedIn.validateLoggedIn, consentTracking.consent, function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var actionUrls = {
        enableActionUrl: URLUtils.url('B2BBuyer-EnableBuyer').toString(),
        disableActionUrl: URLUtils.url('B2BBuyer-DisableBuyer').toString(),
        listActionUrl: URLUtils.url('B2BBuyer-List').toString()
    };

    var adminUser = CustomerMgr.getCustomerByCustomerNumber(req.currentCustomer.profile.customerNo);
    var b2bAccountNumber = adminUser.profile.custom.b2bAccountNumber;

    var computedMetaData = {
        title: Resource.msg('page.title.managebuyer', 'account', null),
        description: Resource.msg('account.page.managebuyer.list.description', 'account', null),
        keywords: Resource.msg('account.page.managebuyer.list.description', 'account', null),
        pageMetaTags: []
    }

    var pageGroup = {
        name: Resource.msg('account.page.pageGroup.name', 'account', null),
        ID: Resource.msg('account.page.pageGroup.name', 'account', null),
        content: Resource.msg('account.page.managebuyer.list.pageGroup.value', 'account', null)
    };
    var robots = {
        name: Resource.msg('account.page.robots.name', 'account', null),
        ID: Resource.msg('account.page.robots.name', 'account', null),
        content: Resource.msg('account.page.robots.value', 'account', null)
    };                    
    computedMetaData.pageMetaTags.push(pageGroup);
    computedMetaData.pageMetaTags.push(robots);

    res.render('account/b2b/buyersList', {
        buyerList: getBuyerList(b2bAccountNumber),
        actionUrls: actionUrls,
        CurrentPageMetaData: computedMetaData,
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
                htmlValue: Resource.msg('page.title.managebuyer', 'account', null),
                url: URLUtils.url('Account-Show').toString()
            }
        ]
    });
    next();
});

/**
 * B2BBuyer-AddBuyer : A link to a page to create a new B2B buyer
 * @name B2BBuyer-AddBuyer
 * @function
 * @memberof Account
 * @param {middleware} - csrfProtection.generateToken
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get(
    'AddBuyer',
    csrfProtection.generateToken,
    consentTracking.consent,
    userLoggedIn.validateLoggedIn,
    function (req, res, next) {
        var profileForm = server.forms.getForm('profile');
        profileForm.clear();

        var computedMetaData = {
            title: Resource.msg('account.page.managebuyer.add.description', 'account', null),
            description: Resource.msg('account.page.managebuyer.add.description', 'account', null),
            keywords: Resource.msg('account.page.managebuyer.add.description', 'account', null),
            pageMetaTags: []
        }
    
        var pageGroup = {
            name: Resource.msg('account.page.pageGroup.name', 'account', null),
            ID: Resource.msg('account.page.pageGroup.name', 'account', null),
            content: Resource.msg('account.page.managebuyer.add.pageGroup.value', 'account', null)
        };
        var robots = {
            name: Resource.msg('account.page.robots.name', 'account', null),
            ID: Resource.msg('account.page.robots.name', 'account', null),
            content: Resource.msg('account.page.robots.value', 'account', null)
        };                    
        computedMetaData.pageMetaTags.push(pageGroup);
        computedMetaData.pageMetaTags.push(robots);

        res.render('account/b2b/editAddBuyer', {
            profileForm: profileForm,
            CurrentPageMetaData: computedMetaData,
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
                    htmlValue: Resource.msg('page.title.managebuyer', 'account', null),
                    url: URLUtils.url('B2BBuyer-List').toString()
                }
            ]
        });
        next();
    }
);

/**
 * B2BBuyer-EditBuyer : A link to edit an existing buyer
 * @name B2BBuyer-EditBuyer
 * @function
 * @memberof Account
 * @param {middleware} - csrfProtection.generateToken
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {middleware} - consentTracking.consent
 * @param {querystringparameter} - customerNo - a string used to identify the buyer record
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
 server.get(
    'EditBuyer',
    csrfProtection.generateToken,
    userLoggedIn.validateLoggedIn,
    consentTracking.consent,
    function (req, res, next) {
        var CustomerMgr = require('dw/customer/CustomerMgr');
        var customerNo = req.querystring.customerNo;
        var customer = CustomerMgr.getCustomerByCustomerNumber(customerNo);
        var profileForm = server.forms.getForm('profile');
        profileForm.clear();
        // populate the profileForm
        profileForm.customer.firstname.value = customer.profile.firstName;
        profileForm.customer.lastname.value = customer.profile.lastName;
        profileForm.customer.phone.value = customer.profile.phoneHome;
        profileForm.customer.email.value = customer.profile.email;
        var b2bAdmin = customer.profile.custom.b2bAdmin;

        var computedMetaData = {
            title: Resource.msg('account.page.managebuyer.edit.description', 'account', null),
            description: Resource.msg('account.page.managebuyer.edit.description', 'account', null),
            keywords: Resource.msg('account.page.managebuyer.edit.description', 'account', null),
            pageMetaTags: []
        }
    
        var pageGroup = {
            name: Resource.msg('account.page.pageGroup.name', 'account', null),
            ID: Resource.msg('account.page.pageGroup.name', 'account', null),
            content: Resource.msg('account.page.managebuyer.edit.pageGroup.value', 'account', null)
        };
        var robots = {
            name: Resource.msg('account.page.robots.name', 'account', null),
            ID: Resource.msg('account.page.robots.name', 'account', null),
            content: Resource.msg('account.page.robots.value', 'account', null)
        };                    
        computedMetaData.pageMetaTags.push(pageGroup);
        computedMetaData.pageMetaTags.push(robots);
        

        res.render('account/b2b/editAddBuyer', {
            profileForm: profileForm,
            customerNo: customerNo,
            b2bAdmin: b2bAdmin,
            CurrentPageMetaData: computedMetaData,
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
                    htmlValue: Resource.msg('label.b2b.manage.buyers.buyerlist', 'account', null),
                    url: URLUtils.url('B2BBuyer-List').toString()
                }
            ]
        });

        next();
    }
);

/**
 * Route to create the B2B buyer by the B2B Admin using the Manage Buyer functionality.
 * B2BBuyer-CreateBuyer : The B2BBuyer-CreateBuyer endpoint is the endpoint that gets executed when B2B Admin submits the new buyer information
 * @name B2BBuyer-CreateBuyer
 * @function
 * @memberof Account
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {querystringparameter} - rurl - redirect url. The value of this is a number. This number then gets mapped to an endpoint set up in oAuthRenentryRedirectEndpoints.js
 * @param {httpparameter} - dwfrm_profile_customer_firstname - Input field for the shoppers's first name
 * @param {httpparameter} - dwfrm_profile_customer_lastname - Input field for the shopper's last name
 * @param {httpparameter} - dwfrm_profile_customer_phone - Input field for the shopper's phone number
 * @param {httpparameter} - dwfrm_profile_customer_email - Input field for the shopper's email address
 * @param {httpparameter} - dwfrm_profile_logonId - Input field for the shopper's logonId
 * @param {httpparameter} - dwfrm_profile_login_password - Input field for the shopper's password
 * @param {httpparameter} - dwfrm_profile_login_passwordconfirm: - Input field for the shopper's password to confirm
 * @param {httpparameter} - csrf_token - hidden input field CSRF token
 * @param {returns} - json
 * @param {serverfunction} - post
 */
 server.post(
    'CreateBuyer',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var CustomerMgr = require('dw/customer/CustomerMgr');
        var Resource = require('dw/web/Resource');
        var formErrors = require('*/cartridge/scripts/formErrors');
        var buyerForm = server.forms.getForm('profile');

        if (buyerForm.login.password.value !== buyerForm.login.passwordconfirm.value ) {
            buyerForm.login.password.valid = false;
            buyerForm.login.passwordconfirm.valid = false;
            buyerForm.login.passwordconfirm.error = Resource.msg('error.message.mismatch.password', 'forms', null);
            buyerForm.valid = false;
        }

        if (!CustomerMgr.isAcceptablePassword(buyerForm.login.password.value)) {
            buyerForm.login.password.valid = false;
            buyerForm.login.passwordconfirm.valid = false;
            buyerForm.login.passwordconfirm.error = Resource.msg('error.message.password.constraints.not.matched', 'forms', null);
            buyerForm.valid = false;
        }

        // form validation
        if (!validationHelper.valdateEmailId(buyerForm.customer.email.value.toLowerCase())) {
            buyerForm.customer.email.valid = false;
            buyerForm.customer.email.error =
                Resource.msg('error.message.invalid.email', 'forms', null);
            buyerForm.valid = false;
        }        

        // setting variables for the BeforeComplete function
        var buyerFormObj = {
            firstName: buyerForm.customer.firstname.value,
            lastName: buyerForm.customer.lastname.value,
            phone: buyerForm.customer.phone.value,
            email: buyerForm.customer.email.value,
            logonId: buyerForm.customer.logonId.value,
            password: buyerForm.login.password.value,
            passwordConfirm: buyerForm.login.passwordconfirm.value,
            validForm: buyerForm.valid,
            form: buyerForm
        };

        if (buyerForm.valid) {
            res.setViewData(buyerFormObj);

            this.on ('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
                var Transaction = require('dw/system/Transaction');
                var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');
                var authenticatedCustomer;
                var serverError;

                // getting variables for the BeforeComplete function
                var buyerForm = res.getViewData(); // eslint-disable-line
                var newBuyer;

                if (buyerForm.validForm) {
                    var login = buyerForm.logonId;
                    var password = buyerForm.password;

                    var adminUser = CustomerMgr.getCustomerByCustomerNumber(
                        req.currentCustomer.profile.customerNo
                    );
                    var adminUserProfile = adminUser.getProfile();
                
                    // attempt to create a new B2B buyer
                    try {
                        Transaction.wrap(function () {
                            newBuyer = CustomerMgr.createCustomer(login, password);
                            if (newBuyer) {
                                // assign values to the profile
                                var newBuyerProfile = newBuyer.getProfile();
                                newBuyerProfile.firstName = buyerForm.firstName;
                                newBuyerProfile.lastName = buyerForm.lastName;
                                newBuyerProfile.phoneHome = buyerForm.phone;
                                newBuyerProfile.email = buyerForm.email;

                                // assign the B2B account specific values  
                                newBuyerProfile.custom.b2bUser = true;
                                newBuyerProfile.custom.b2bAdmin = false;
                                newBuyerProfile.custom.b2bAdminApproved = false;
                                newBuyerProfile.custom.b2bWebEnabled = adminUserProfile.custom.b2bWebEnabled;
                                newBuyerProfile.custom.b2bPayByTerms = adminUserProfile.custom.b2bPayByTerms;
                                newBuyerProfile.custom.b2bPORequired = adminUserProfile.custom.b2bPORequired;
                                newBuyerProfile.custom.b2bAccountNumber = adminUserProfile.custom.b2bAccountNumber;
                                newBuyerProfile.custom.b2bSalesPersonInfo = adminUserProfile.custom.b2bSalesPersonInfo;
                                newBuyerProfile.custom.b2bBalanceDue = adminUserProfile.custom.b2bBalanceDue;
                                newBuyerProfile.custom.b2bCreditLimit = adminUserProfile.custom.b2bCreditLimit;
                                newBuyerProfile.custom.b2bOrganizationName = adminUserProfile.custom.b2bOrganizationName;                            
                            }
                        });
                    } catch (e) {
                        buyerForm.validForm = false;
                        buyerForm.form.customer.logonId.valid = false;
                        buyerForm.form.customer.logonId.error = Resource.msg('error.message.username.invalid', 'forms', null);
                    }
                }

                delete buyerForm.password;
                delete buyerForm.passwordConfirm;
                formErrors.removeFormValues(buyerForm.form);

                if (buyerForm.validForm) {
                    res.json({
                        success: true,
                        redirectUrl: URLUtils.url('B2BBuyer-List').toString()
                    });

                } else {
                    res.json({
                        fields: formErrors.getFormErrors(buyerForm)
                    });
                }
            });
        } else {
            res.json({
                fields: formErrors.getFormErrors(buyerForm)
            });
        }

        next();
    }
);

/**
 * Route to update the B2B buyer by the B2B Admin using the Manage Buyer functionality.
 * B2BBuyer-UpdateBuyer : The B2BBuyer-UpdateBuyer endpoint is the endpoint that gets executed when B2B Admin submits the update buyer information
 * @name B2BBuyer-UpdateBuyer
 * @function
 * @memberof Account
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {querystringparameter} - rurl - redirect url. The value of this is a number. This number then gets mapped to an endpoint set up in oAuthRenentryRedirectEndpoints.js
 * @param {httpparameter} - customerNo - the customer number parameter
 * @param {httpparameter} - dwfrm_profile_customer_firstname - Input field for the shoppers's first name
 * @param {httpparameter} - dwfrm_profile_customer_lastname - Input field for the shopper's last name
 * @param {httpparameter} - dwfrm_profile_customer_phone - Input field for the shopper's phone number
 * @param {httpparameter} - dwfrm_profile_customer_email - Input field for the shopper's email address
 * @param {httpparameter} - csrf_token - hidden input field CSRF token
 * @param {returns} - json
 * @param {serverfunction} - post
 */
 server.post(
    'UpdateBuyer',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var CustomerMgr = require('dw/customer/CustomerMgr');
        var Resource = require('dw/web/Resource');
        var formErrors = require('*/cartridge/scripts/formErrors');
        var buyerForm = server.forms.getForm('profile');

        // form validation
        if (!validationHelper.valdateEmailId(buyerForm.customer.email.value.toLowerCase())) {
            buyerForm.customer.email.valid = false;
            buyerForm.customer.email.error =
                Resource.msg('error.message.invalid.email', 'forms', null);
            buyerForm.valid = false;
        }        

        // setting variables for the BeforeComplete function
        var buyerFormObj = {
            firstName: buyerForm.customer.firstname.value,
            lastName: buyerForm.customer.lastname.value,
            phone: buyerForm.customer.phone.value,
            email: buyerForm.customer.email.value,
            form: buyerForm
        };

        if (buyerForm.valid) {
            res.setViewData(buyerFormObj);

            this.on ('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
                var Transaction = require('dw/system/Transaction');

                // getting variables for the BeforeComplete function
                var formInfo = res.getViewData(); // eslint-disable-line
                var customerNo = req.querystring.customerNo;
                var buyerUser = CustomerMgr.getCustomerByCustomerNumber(customerNo);
                var buyerUserProfile = buyerUser.getProfile();

                Transaction.wrap(function () {
                    // assign values to the profile
                    buyerUserProfile.firstName = formInfo.firstName;
                    buyerUserProfile.lastName = formInfo.lastName;
                    buyerUserProfile.phoneHome = formInfo.phone;
                    buyerUserProfile.email = formInfo.email;
                });

                delete formInfo.form;
                delete formInfo.logonId;

                res.json({
                    success: true,
                    redirectUrl: URLUtils.url('B2BBuyer-List').toString()
                });           
            });
        } else {
            res.json({
                success: false,
                fields: formErrors.getFormErrors(buyerForm)
            });
        }

        next();
    }
);

/**
 * B2BBuyer-DisableAccount : Disables the specified B2B buyer account.
 * @name B2BBuyer-DisableAccount
 * @function
 * @memberof Account
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {querystringparameter} - customerNo - a string used to identify the B2B user account
 * @param {category} - sensitive
 * @param {serverfunction} - get
 */
 server.get('DisableAccount', userLoggedIn.validateLoggedIn, function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Transaction = require('dw/system/Transaction');

    var customerNo = req.querystring.customerNo;
    var customer = CustomerMgr.getCustomerByCustomerNumber(customerNo);
 
    if (customer) {
        var profile = customer.getProfile();
        this.on('route:BeforeComplete', function () { // eslint-disable-line no-shadow
            Transaction.wrap(function () {
                customer.profile.credentials.setEnabledFlag(false);
                customer.profile.custom.b2bUser = false;
                customer.profile.custom.b2bWebEnabled = false;
            });

           res.redirect(URLUtils.url('B2BBuyer-List'));
        });
    }
    next();
});

/**
 * B2BBuyer-EnableAccount : Enaables the specified B2B buyer account.
 * @name B2BBuyer-EnableAccount
 * @function
 * @memberof Account
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {querystringparameter} - customerNo - a string used to identify the B2B user account
 * @param {category} - sensitive
 * @param {serverfunction} - get
 */
 server.get('EnableAccount', userLoggedIn.validateLoggedIn, function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Transaction = require('dw/system/Transaction');

    var customerNo = req.querystring.customerNo;
    var customer = CustomerMgr.getCustomerByCustomerNumber(customerNo);
 
    if (customer) {
        var profile = customer.getProfile();
        this.on('route:BeforeComplete', function () { // eslint-disable-line no-shadow
            Transaction.wrap(function () {
                customer.profile.credentials.setEnabledFlag(true);
                customer.profile.custom.b2bUser = true;
                customer.profile.custom.b2bWebEnabled = true;
            });

           res.redirect(URLUtils.url('B2BBuyer-List'));
        });
    }
    next();
});

module.exports = server.exports();
