'use strict';

/**
 * @namespace Order
 */

var server = require('server');
server.extend(module.superModule);

var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
var Site = require('dw/system/Site');
var orderHelpers = require('*/cartridge/scripts/order/orderHelpers');


/**
 * Order-Track : This endpoint is used to track a placed Order
 * @name Base/Order-Track
 * @function
 * @memberof Order
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateRequest
 * @param {middleware} - csrfProtection.generateToken
 * @param {querystringparameter} - trackOrderNumber - Order Number to track
 * @param {querystringparameter} - trackOrderEmail - Email on the Order to track
 * @param {querystringparameter} - trackOrderPostal - Postal Code on the Order to track
 * @param {querystringparameter} - csrf_token - CSRF token
 * @param {querystringparameter} - submit - This is to submit the form
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - post
 */
server.replace(
    'Track',
    consentTracking.consent,
    server.middleware.https,
    csrfProtection.validateRequest,
    csrfProtection.generateToken,
    function (req, res, next) {
        var OrderMgr = require('dw/order/OrderMgr');
        var OrderModel = require('*/cartridge/models/order');
        var Locale = require('dw/util/Locale');
        var order;
        var validForm = true;
        var target = req.querystring.rurl || 1;
        var actionUrl = URLUtils.url('Account-Login', 'rurl', target);
        var profileForm = server.forms.getForm('profile');
        profileForm.clear();

        if (req.form.trackOrderPostal
            && req.form.trackOrderNumber) {

            var s2ktrackOrderRequest = {
                company: Site.current.getCustomPreferenceValue('s2kOrderLookupCompany'),
                zipCode: req.form.trackOrderPostal,
                queryString: req.form.trackOrderNumber
            };

            var s2kOrderLookupResponse = hooksHelper('app.s2k.order.status_lookup', 'OrderLookup', s2ktrackOrderRequest, function () {});
            
            //If s2kOrderLookupResponse has orderId, then make the order details call and get the response and populate the response into JSON for display
            if(!empty(s2kOrderLookupResponse) && s2kOrderLookupResponse.success && s2kOrderLookupResponse.totalCount == "1") {

                var s2kOrderDetailsRequest = {
                    company: Site.current.getCustomPreferenceValue('s2kOrderLookupCompany'),
                    customerId: s2kOrderLookupResponse.orderList[0].customer,
                    orderNo: s2kOrderLookupResponse.orderList[0].orderNo,
                    backOrderCode: Site.current.getCustomPreferenceValue('s2kOrderLookupBackOrderCode')
        
                };

                var s2kOrderDetailsLookupResponse = hooksHelper('app.s2k.order.details_lookup', 'OrderDetailsLookup', s2kOrderDetailsRequest, function () {});
                if(!empty(s2kOrderDetailsLookupResponse) && s2kOrderDetailsLookupResponse.success) {
                    order = orderHelpers.getS2KOrderDetailsFromResponse(s2kOrderDetailsLookupResponse);
                }   

            } else if(!empty(s2kOrderLookupResponse) && s2kOrderLookupResponse.success && s2kOrderLookupResponse.totalCount > 1) {
                var ordersResult;
                if(!empty(s2kOrderLookupResponse) && s2kOrderLookupResponse.success && s2kOrderLookupResponse.totalCount >0) {
                    ordersResult = orderHelpers.getOrderHistoryFromS2KResponse(s2kOrderLookupResponse);
                } 

                res.render('account/order/history', {
                    orders: ordersResult.orders,
                    accountlanding: false
                });

                return next();
            }else {
                validForm = false;    
            }

        } else {
            validForm = false;
        }

        if (!order) {
            res.render('/account/login', {
                navTabValue: 'login',
                orderTrackFormError: true,
                profileForm: profileForm,
                userName: '',
                actionUrl: actionUrl
            });
            next();
        } else {

            // check the email and postal code of the form
            //TODO Uncomment this.
            // if (req.form.trackOrderPostal
            //     !== order.billing.billingAddress.address.postalCode) {
            //     validForm = false;
            // }

            var payPal = {};
            if(!empty(order.paypal)) {
                payPal = order.paypal;
            }

            
            if (validForm) {
                var exitLinkText;
                var exitLinkUrl;

                exitLinkText = !req.currentCustomer.profile
                    ? Resource.msg('link.continue.shop', 'order', null)
                    : Resource.msg('link.orderdetails.myaccount', 'account', null);

                exitLinkUrl = !req.currentCustomer.profile
                    ? URLUtils.url('Login-Show')
                    : URLUtils.https('Account-Show');

                res.render('account/orderDetails', {
                    order: order,
                    returningCustomer: true,
                    orderDetailsRequest: true,                    
                    exitLinkText: exitLinkText,
                    exitLinkUrl: exitLinkUrl
                });
            } else {
                res.render('/account/login', {
                    navTabValue: 'login',
                    profileForm: profileForm,
                    orderTrackFormError: !validForm,
                    userName: '',
                    actionUrl: actionUrl
                });
            }

            next();
        }
    }
);


/**
 * Order-History : This endpoint is invoked to get Order History for the logged in shopper
 * @name Base/Order-History
 * @function
 * @memberof Order
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - server.middleware.https
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {category} - sensitive
 * @param {serverfunction} - get
 */
 server.replace(
    'History',
    consentTracking.consent,
    server.middleware.https,
    userLoggedIn.validateLoggedIn,
    function (req, res, next) {
        var orderHelpers = require('*/cartridge/scripts/order/orderHelpers');
        var ordersResult = {};
        var customer = req.currentCustomer.raw;
        var customerId = customer.profile.customerNo;
        //Construct this based on the filterParams getting passed from the page
        var queryStringParams = "*";
        
        //Check if the order is B2B Order and B2B AccountNumber Present, add it to the basket
        if(customer.registered && customer.profile && customer.profile.custom && customer.profile.custom.b2bUser && customer.profile.custom.b2bAccountNumber){
            customerId = customer.profile.custom.b2bAccountNumber;
        }


        var s2kOrderHistoryRequest = {
            company: Site.current.getCustomPreferenceValue('s2kOrderLookupCompany'),
            customerId: customerId,
            queryString: queryStringParams
        };

        if(req.querystring.orderFilterRequest) {
            var queryString = req.querystring;

            if(req.querystring.queryText) {
                s2kOrderHistoryRequest.queryString = req.querystring.queryText;
            }
            if(req.querystring.dateFilter){
                var dateFilter = req.querystring.dateFilter.split("&");
                s2kOrderHistoryRequest.fromDate = dateFilter[0];
                s2kOrderHistoryRequest.toDate = dateFilter[1];
            }
            //Construct the queryString for filter
        } else {
            var dateFilter = orderHelpers.getSixtiethDayBackFromToday().split("&");
            s2kOrderHistoryRequest.fromDate = dateFilter[0];
            s2kOrderHistoryRequest.toDate = dateFilter[1];

        }

        var s2kOrderHistoryLookupResponse = hooksHelper('app.s2k.order.status_lookup', 'OrderLookup', s2kOrderHistoryRequest, function () {});
        if(!empty(s2kOrderHistoryLookupResponse) && s2kOrderHistoryLookupResponse.success && s2kOrderHistoryLookupResponse.totalCount >0) {
            ordersResult = orderHelpers.getOrderHistoryFromS2KResponse(s2kOrderHistoryLookupResponse);
        }   
        
        var breadcrumbs = [
            {
                htmlValue: Resource.msg('global.home', 'common', null),
                url: URLUtils.home().toString()
            },
            {
                htmlValue: Resource.msg('page.title.myaccount', 'account', null),
                url: URLUtils.url('Account-Show').toString()
            },
            {
                htmlValue: Resource.msg('page.title.orderhistory', 'account', null),
                url: URLUtils.url('Account-Show').toString()
            }
        ];
        var computedMetaData = {
            title: Resource.msg('account.page.order.history.description', 'account', null), 
            description: Resource.msg('account.page.order.history.description', 'account', null),
            keywords: Resource.msg('account.page.order.history.description', 'account', null),
            pageMetaTags: []
        };
        var pageGroup = {name: Resource.msg('account.page.pageGroup.name', 'account', null),
                        ID: Resource.msg('account.page.pageGroup.name', 'account', null),
                        content: Resource.msg('account.page.order.history.pageGroup.value', 'account', null)};
        var robots = {name: Resource.msg('account.page.robots.name', 'account', null),
                        ID: Resource.msg('account.page.robots.name', 'account', null),
                        content: Resource.msg('account.page.robots.value', 'account', null)};                    
        computedMetaData.pageMetaTags.push(pageGroup);
        computedMetaData.pageMetaTags.push(robots);
    
        res.setViewData({
            CurrentPageMetaData: computedMetaData
        });

        if(req.querystring.orderFilterRequest) {
            res.render('account/order/orderList', {
                orders: ordersResult.orders,
                filterValues: orderHelpers.getFilterValues(),
                orderFilter: req.querystring.orderFilter,
                accountlanding: false
            });
        } else {
            res.render('account/order/history', {
                orders: ordersResult.orders,
                filterValues: orderHelpers.getFilterValues(),
                orderFilter: req.querystring.orderFilter,
                accountlanding: false,
                breadcrumbs: breadcrumbs
            });
    
        }
        next();
    }
);


/**
 * Order-Details : This endpoint is called to get Order Details
 * @name Base/Order-Details
 * @function
 * @memberof Order
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - server.middleware.https
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {querystringparameter} - orderID - Order ID
 * @param {querystringparameter} - orderFilter - Order Filter ID
 * @param {category} - sensitive
 * @param {serverfunction} - get
 */
 server.replace(
    'Details',
    consentTracking.consent,
    server.middleware.https,
    function (req, res, next) {
        var orderHelpers = require('*/cartridge/scripts/order/orderHelpers');
        var orderId = req.querystring.orderID;
        var backOrderCode = req.querystring.backOrderCode;

        if(empty(backOrderCode)) {
            backOrderCode = Site.current.getCustomPreferenceValue('s2kOrderLookupBackOrderCode');
        }
        // var orderId = "15628697";

        // var order = OrderMgr.getOrder(req.querystring.orderID);
        var breadcrumbs;

        var customerId;
        var customer = req.currentCustomer.raw;
        if(customer.registered) {
            customerId = customer.profile.customerNo;
            breadcrumbs = [
                {
                    htmlValue: Resource.msg('global.home', 'common', null),
                    url: URLUtils.home().toString()
                },
                {
                    htmlValue: Resource.msg('page.title.myaccount', 'account', null),
                    url: URLUtils.url('Account-Show').toString()
                },
                {
                    htmlValue: Resource.msg('label.orderhistory', 'account', null),
                    url: URLUtils.url('Order-History').toString()
                },
                {
                    htmlValue: Resource.msg('page.title.orderdetails', 'account', null),
                    url: URLUtils.url('Order-History').toString()
                }
            ];
        } else {

            breadcrumbs = [
                {
                    htmlValue: Resource.msg('global.home', 'common', null),
                    url: URLUtils.home().toString()
                },
                {
                    htmlValue: Resource.msg('label.ordersearch', 'account', null),
                    url: URLUtils.url('Order-History').toString()
                },
                {
                    htmlValue: Resource.msg('page.title.orderdetails', 'account', null),
                    url: URLUtils.url('Order-History').toString()
                }
            ];
        }
        
        // var customerId = "W457895";
        var order = {};
        //Check if the order is B2B Order and B2B AccountNumber Present, add it to the basket
        if(customer.registered && customer.profile && customer.profile.custom && customer.profile.custom.b2bUser && customer.profile.custom.b2bAccountNumber){
            customerId = customer.profile.custom.b2bAccountNumber;
        } else if (!customer.registered) {
            customerId = req.querystring.s2kCustomerNumber;
        }

        var s2kOrderDetailsRequest = {
            company: Site.current.getCustomPreferenceValue('s2kOrderLookupCompany'),
            customerId: customerId,
            orderNo: orderId,
            backOrderCode: backOrderCode

        };

        var s2kOrderDetailsLookupResponse = hooksHelper('app.s2k.order.details_lookup', 'OrderDetailsLookup', s2kOrderDetailsRequest, function () {});
        if(!empty(s2kOrderDetailsLookupResponse) && s2kOrderDetailsLookupResponse.success) {
            order = orderHelpers.getS2KOrderDetailsFromResponse(s2kOrderDetailsLookupResponse);
        }   

        var payPal = {};
        if(!empty(order.paypal)) {
            payPal = order.paypal;
        }

        var computedMetaData = {
            title: Resource.msg('account.page.order.details.description', 'account', null), 
            description: Resource.msg('account.page.order.details.description', 'account', null),
            keywords: Resource.msg('account.page.order.details.description', 'account', null),
            pageMetaTags: []
        };
        var pageGroup = {name: Resource.msg('account.page.pageGroup.name', 'account', null),
                        ID: Resource.msg('account.page.pageGroup.name', 'account', null),
                        content: Resource.msg('account.page.order.details.pageGroup.value', 'account', null)};
        var robots = {name: Resource.msg('account.page.robots.name', 'account', null),
                        ID: Resource.msg('account.page.robots.name', 'account', null),
                        content: Resource.msg('account.page.robots.value', 'account', null)};                    
        computedMetaData.pageMetaTags.push(pageGroup);
        computedMetaData.pageMetaTags.push(robots);
    
        res.setViewData({
            CurrentPageMetaData: computedMetaData
        });

        // if (req.querystring.orderID && orderCustomerNo === currentCustomerNo) {
        if (!empty(order)) {
            var exitLinkText = Resource.msg('link.orderdetails.orderhistory', 'account', null);
            var exitLinkUrl =
                URLUtils.https('Order-History', 'orderFilter', req.querystring.orderFilter);
            res.render('account/orderDetails', {
                order: order,
                returningCustomer: true,
                orderDetailsRequest: true,
                exitLinkText: exitLinkText,
                exitLinkUrl: exitLinkUrl,
                breadcrumbs: breadcrumbs
            });
        } else {
            res.redirect(URLUtils.url('Account-Show'));
        }
        next();
    }
);


/**
 * Order-CreateAccount : This endpoint is invoked when a shopper has already placed an Order as a guest and then tries to create an account
 * @name Base/Order-CreateAccount
 * @function
 * @memberof Order
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {querystringparameter} - ID: Order ID
 * @param {httpparameter} - dwfrm_newPasswords_newpassword - Password
 * @param {httpparameter} - dwfrm_newPasswords_newpasswordconfirm - Confirm Password
 * @param {httpparameter} - csrf_token - CSRF token
 * @param {category} - sensitive
 * @param {serverfunction} - post
 */
 server.replace(
    'CreateAccount',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var OrderMgr = require('dw/order/OrderMgr');
        var CustomerMgr = require('dw/customer/CustomerMgr');
        var formErrors = require('*/cartridge/scripts/formErrors');

        var passwordForm = server.forms.getForm('newPasswords');
        var newPassword = passwordForm.newpassword.htmlValue;
        var confirmPassword = passwordForm.newpasswordconfirm.htmlValue;
        if (newPassword !== confirmPassword) {
            passwordForm.valid = false;
            passwordForm.newpasswordconfirm.valid = false;
            passwordForm.newpasswordconfirm.error =
                Resource.msg('error.message.mismatch.newpassword', 'forms', null);
        }

        if (passwordForm.valid && !CustomerMgr.isAcceptablePassword(newPassword)) {
            passwordForm.newpassword.valid = false;
            passwordForm.newpassword.error =
                Resource.msg('error.message.password.constraints.not.matched', 'forms', null);                
                passwordForm.valid = false;
        }

        var order = OrderMgr.getOrder(req.querystring.ID);
        if (!order || order.customer.ID !== req.currentCustomer.raw.ID || order.getUUID() !== req.querystring.UUID) {
            res.json({ error: [Resource.msg('error.message.unable.to.create.account', 'login', null)] });
            return next();
        }

        res.setViewData({ orderID: req.querystring.ID });
        var registrationObj = {
            firstName: order.billingAddress.firstName,
            lastName: order.billingAddress.lastName,
            phone: order.billingAddress.phone,
            email: order.customerEmail,
            password: newPassword
        };

        if (passwordForm.valid) {
            res.setViewData(registrationObj);
            res.setViewData({ passwordForm: passwordForm });

            this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
                var CustomerMgr = require('dw/customer/CustomerMgr');
                var Transaction = require('dw/system/Transaction');
                var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');
                var addressHelpers = require('*/cartridge/scripts/helpers/addressHelpers');

                var registrationData = res.getViewData();

                var login = registrationData.email;
                var password = registrationData.password;
                var newCustomer;
                var authenticatedCustomer;
                var newCustomerProfile;
                var errorObj = {};

                delete registrationData.email;
                delete registrationData.password;

                // attempt to create a new user and log that user in.
                try {
                    Transaction.wrap(function () {
                        var error = {};
                        newCustomer = CustomerMgr.createCustomer(login, password);

                        var authenticateCustomerResult = CustomerMgr.authenticateCustomer(login, password);
                        if (authenticateCustomerResult.status !== 'AUTH_OK') {
                            error = { authError: true, status: authenticateCustomerResult.status };
                            throw error;
                        }

                        authenticatedCustomer = CustomerMgr.loginCustomer(authenticateCustomerResult, false);

                        if (!authenticatedCustomer) {
                            error = { authError: true, status: authenticateCustomerResult.status };
                            throw error;
                        } else {
                            // assign values to the profile
                            newCustomerProfile = newCustomer.getProfile();

                            newCustomerProfile.firstName = registrationData.firstName;
                            newCustomerProfile.lastName = registrationData.lastName;
                            newCustomerProfile.phoneHome = registrationData.phone;
                            newCustomerProfile.email = login;

                            order.setCustomer(newCustomer);

                            // save all used shipping addresses to address book of the logged in customer
                            var allAddresses = addressHelpers.gatherShippingAddresses(order);
                            allAddresses.forEach(function (address) {
                                addressHelpers.saveAddress(address, { raw: newCustomer }, addressHelpers.generateAddressName(address));
                            });

                            res.setViewData({ newCustomer: newCustomer });
                            res.setViewData({ order: order });
                        }
                    });
                } catch (e) {
                    var a = e;
                    errorObj.error = true;
                    errorObj.errorMessage = e.authError
                        ? Resource.msg('error.message.unable.to.create.account', 'login', null)
                        : Resource.msg('error.message.account.create.error', 'forms', null);
                }

                delete registrationData.firstName;
                delete registrationData.lastName;
                delete registrationData.phone;

                if (errorObj.error) {
                    res.json({ error: [errorObj.errorMessage] });

                    return;
                }

                accountHelpers.sendCreateAccountEmail(authenticatedCustomer.profile);

                res.json({
                    success: true,
                    redirectUrl: URLUtils.url('Account-Show', 'registration', 'submitted').toString()
                });
            });
        } else {
            res.json({
                fields: formErrors.getFormErrors(passwordForm)
            });
        }

        return next();
    }
);



module.exports = server.exports();
