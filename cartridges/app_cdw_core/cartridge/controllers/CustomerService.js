'use strict';

/**
 * @namespace ContactUs
 */

var server = require('server');
var messageHelper = require('~/cartridge/scripts/helpers/messageHelper');
var customerServiceHelper = require('~/cartridge/scripts/helpers/customerServiceHelper');
var contentAssetHelper = require('~/cartridge/scripts/helpers/contentAssetHelper');
var MessageConstants = require('*/cartridge/scripts/utils/cdwConstants').getConstants();
var Transaction = require('dw/system/Transaction');
var URLUtils = require('dw/web/URLUtils');
var Resource = require('dw/web/Resource');
var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
var emailHelper = require('*/cartridge/scripts/helpers/emailHelpers');
var validationHelper = require('*/cartridge/scripts/helpers/validationHelper');



/**
 * CustomerService-CULanding : This endpoint is called to load contact us landing page
 * @name Base/CustomerService-CULanding
 * @function
 * @memberof CustomerService
 * @param {middleware} - server.middleware.https
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('CULanding', server.middleware.https, function (req, res, next) {

    var computedMetaData = {
        title: Resource.msg('subscribe.to.contact.us.landing.title', 'customerService', null),
        description: Resource.msg('subscribe.to.contact.us.landing.description', 'customerService', null),
        keywords: Resource.msg('subscribe.to.contact.us.landing.keywords', 'customerService', null),
        pageMetaTags: []
    };

    var pageGroup = {name: Resource.msg('subscribe.to.contact.us.landing.pageGroup.name', 'customerService', null),
                    ID: Resource.msg('subscribe.to.contact.us.landing.pageGroup.name', 'customerService', null),
                    content: Resource.msg('subscribe.to.contact.us.landing.pageGroup.value', 'customerService', null)};
    var robots = {name: Resource.msg('subscribe.to.contact.us.landing.robots.name', 'customerService', null),
                    ID: Resource.msg('subscribe.to.contact.us.landing.robots.name', 'customerService', null),
                    content: Resource.msg('subscribe.to.contact.us.landing.robots.value', 'customerService', null)};                    
    computedMetaData.pageMetaTags.push(pageGroup);
    computedMetaData.pageMetaTags.push(robots);


    res.render('customerService/contactUs.isml', {
        actionUrl: URLUtils.url('CustomerService-CUSubscribe').toString(),
        CurrentPageMetaData: computedMetaData
    });


    next();
});

/**
 * CustomerService-CUSubscribe : Endpoint ContactUs Signup
 * @name Base/CustomerService-CUSubscribe
 * @memberof CustomerService
 * @param {middleware} - server.middleware.https
 * @param {httpparameter} - contactFirstName - First Name of the shopper
 * @param {httpparameter} - contactLastName - Last Name of the shopper
 * @param {httpparameter} - contactEmail - Email of the shopper
 * @param {httpparameter} - contactTopic - ID of the "Contact Us" topic
 * @param {httpparameter} - contactComment - Comments entered by the shopper
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post('CUSubscribe', server.middleware.https, function (req, res, next) {

    var myForm = req.form;
    
    
    var isValidEmailid = validationHelper.valdateEmailId(myForm.contactEmail);
    
    if (isValidEmailid) {
        var cuEmailContent = contentAssetHelper.getContentAssetBody('contact-us-email-m');                            
        
        var contactDetails = {
                                firstName: myForm.contactFirstName, 
                                lastName: myForm.contactLastName, 
                                email: myForm.contactEmail, 
                                topic: myForm.contactTopic, 
                                comment: myForm.contactComment,
                                company: myForm.contactCompany,
                                streetAddress: myForm.contactStreetAddress,
                                zipCode: myForm.contactZipCode,
                                city: myForm.contactCity,
                                state: myForm.contactState,
                                phone: myForm.contactPhone,                                                                                                                                            
                                orderNumber: myForm.contactOrderNumber,    
                                customerNumber: myForm.contactCustomerNumber,
                                cuEmailContent: cuEmailContent
                            };
        
        hooksHelper('app.contactUs.subscribe', 'sendContactUsEmail', contactDetails, function () {});

        //Send Newsletter Entry message now
        messageHelper.handleNewsletterSignup(myForm.contactAddToEmail,myForm.contactZipCode,myForm.contactEmail);

        res.json({
            success: true,
            msg: Resource.msg('subscribe.to.contact.us.success', 'customerService', null)
        });
    } else {
        res.json({
            error: true,
            msg: Resource.msg('subscribe.to.contact.us.email.invalid', 'customerService', null)
        });
    }

    next();
});

/**
 * CustomerService-RCLanding : This endpoint is called to load request catalog landing page
 * @name Base/CustomerService-RCLanding
 * @function
 * @memberof CustomerService
 * @param {middleware} - server.middleware.https
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
 server.get('RCLanding', server.middleware.https, function (req, res, next) {

    var computedMetaData = {
        title: Resource.msg('subscribe.to.request.catalog.landing.title', 'customerService', null),
        description: Resource.msg('subscribe.to.request.catalog.landing.description', 'customerService', null),
        keywords: Resource.msg('subscribe.to.request.catalog.landing.keywords', 'customerService', null),
        pageMetaTags: []
    };

    var pageGroup = {name: Resource.msg('subscribe.to.request.catalog.landing.pageGroup.name', 'customerService', null),
                    ID: Resource.msg('subscribe.to.request.catalog.landing.pageGroup.name', 'customerService', null),
                    content: Resource.msg('subscribe.to.request.catalog.landing.pageGroup.value', 'customerService', null)};
    var robots = {name: Resource.msg('subscribe.to.request.catalog.landing.robots.name', 'customerService', null),
                    ID: Resource.msg('subscribe.to.request.catalog.landing.robots.name', 'customerService', null),
                    content: Resource.msg('subscribe.to.request.catalog.landing.robots.value', 'customerService', null)};                    
    computedMetaData.pageMetaTags.push(pageGroup);
    computedMetaData.pageMetaTags.push(robots);

    res.render('customerService/requestCatalog.isml', {
        actionUrl: URLUtils.url('CustomerService-RCSubscribe').toString(),
        CurrentPageMetaData: computedMetaData
    });

    next();
});

/**
 * CustomerService-RCSubscribe : Request Catalog Signup
 * @name Base/CustomerService-RCSubscribe
 * @function
 * @memberof CustomerService
 * @param {middleware} - server.middleware.https
 * @param {httpparameter} - contactFirstName - First Name of the shopper
 * @param {httpparameter} - contactLastName - Last Name of the shopper
 * @param {httpparameter} - contactEmail - Email of the shopper
 * @param {httpparameter} - contactTopic - ID of the "Contact Us" topic
 * @param {httpparameter} - contactComment - Comments entered by the shopper
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post('RCSubscribe', server.middleware.https, function (req, res, next) {

    var myForm = req.form;
    //var isValidEmailid = emailHelper.validateEmail(myForm.contactEmail);
    var isValidEmailid = validationHelper.valdateEmailId(myForm.contactEmail);
    if (isValidEmailid) {
        var contactDetails = {
            "messageType": MessageConstants.RequestCatalogMessageType,
            "firstName": myForm.contactFirstName, 
            "lastName": myForm.contactLastName, 
            "email": myForm.contactEmail, 
            "company": myForm.contactCompany,
            "streetAddress": myForm.contactStreetAddress,
            "zipCode": myForm.contactZipCode,
            "city": myForm.contactCity,
            "state": myForm.contactState,
            "phone": myForm.contactPhone            
        };

        
        /**
         * Persist the data into Message Custom Object and ahve job comes and creates teh message for backend
         */
         Transaction.begin();
         try
         {
             var messageObject = messageHelper.createMessage(MessageConstants.RequestCatalogMessageType, contactDetails);

            //Send Newsletter Entry message now
            messageHelper.handleNewsletterSignup(myForm.contactAddToEmail,myForm.contactZipCode,myForm.contactEmail);

             Transaction.commit();
         }
         catch (e)
         {
             Transaction.rollback();
         }

         res.json({
            success: true,
            msg: Resource.msg('subscribe.to.request.catalog.success', 'customerService', null)
        });

    } else {
        res.json({
            error: true,
            msg: Resource.msg('subscribe.to.request.catalog.email.invalid', 'customerService', null)
        });
    }

    next();
});


/**
 * CustomerService-RQLanding : This endpoint is called to load request quote landing page
 * @name Base/CustomerService-RQLanding
 * @function
 * @memberof CustomerService
 * @param {middleware} - server.middleware.https
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
 server.get('RQLanding', server.middleware.https, function (req, res, next) {
     var incomingProduct = {};


     var computedMetaData = {
        title: Resource.msg('subscribe.to.request.quote.landing.title', 'customerService', null),
        description: Resource.msg('subscribe.to.request.quote.landing.description', 'customerService', null),
        keywords: Resource.msg('subscribe.to.request.quote.landing.keywords', 'customerService', null),
        pageMetaTags: []
    };

    var pageGroup = {name: Resource.msg('subscribe.to.request.quote.landing.pageGroup.name', 'customerService', null),
                    ID: Resource.msg('subscribe.to.request.quote.landing.pageGroup.name', 'customerService', null),
                    content: Resource.msg('subscribe.to.request.quote.landing.pageGroup.value', 'customerService', null)};
    var robots = {name: Resource.msg('subscribe.to.request.quote.landing.robots.name', 'customerService', null),
                    ID: Resource.msg('subscribe.to.request.quote.landing.robots.name', 'customerService', null),
                    content: Resource.msg('subscribe.to.request.quote.landing.robots.value', 'customerService', null)};                    
    computedMetaData.pageMetaTags.push(pageGroup);
    computedMetaData.pageMetaTags.push(robots);

     if(req.querystring.productId && req.querystring.productQty) {
            incomingProduct.pid = req.querystring.productId;
            incomingProduct.pQty = req.querystring.productQty;
     }
    res.render('customerService/requestQuote.isml', {
        actionUrl: URLUtils.url('CustomerService-RQSubscribe').toString(),
        incomingProduct: incomingProduct,
        CurrentPageMetaData: computedMetaData
    });

    next();
});

/**
 * CustomerService-NLSubscribe : Request Quote Signup
 * @name Base/CustomerService-RQSubscribe
 * @function
 * @memberof CustomerService
 * @param {middleware} - server.middleware.https
 * @param {httpparameter} - contactFirstName - First Name of the shopper
 * @param {httpparameter} - contactLastName - Last Name of the shopper
 * @param {httpparameter} - contactEmail - Email of the shopper
 * @param {httpparameter} - contactTopic - ID of the "Contact Us" topic
 * @param {httpparameter} - contactComment - Comments entered by the shopper
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post('RQSubscribe', server.middleware.https, function (req, res, next) {
    
    var myForm = req.form;
    var isHeavyEquipPresent = false;
    //var isValidEmailid = emailHelper.validateEmail(myForm.contactEmail);
    var isValidEmailid = validationHelper.valdateEmailId(myForm.contactEmail);

    var productsQtyObj = customerServiceHelper.getProductQtyObj(myForm);
    var rqEmailContent = contentAssetHelper.getContentAssetBody('request-quote-email-m');

    if (productsQtyObj.error) {
        res.json({
            error: true,
            msg: Resource.msg('subscribe.to.request.quote.qty.invalid', 'customerService', null)
        });
        return next();
    }
    
    isHeavyEquipPresent = customerServiceHelper.checkHeavyEquipItem(productsQtyObj);

    if (isValidEmailid) {
        
        var contactDetails = {
            "messageType": MessageConstants.RequestQuoteMessageType,
            "firstName": myForm.contactFirstName, 
            "lastName": myForm.contactLastName, 
            "email": myForm.contactEmail, 
            "company": myForm.contactCompany,
            "streetAddress": myForm.contactStreetAddress,
            "zipCode": myForm.contactZipCode,
            "city": myForm.contactCity,
            "state": myForm.contactState,
            "phone": myForm.contactPhone,
            "products": productsQtyObj,
            "rqEmailContent": rqEmailContent,
            "heItemPresent": isHeavyEquipPresent           
        };
        
        /**
         * persist the message into Message Custom Object and have job create the file for back end
         */
         Transaction.begin();
         try
         {
             //Sending the  Message for Request Quote
             var messageObject = messageHelper.createMessage(MessageConstants.RequestQuoteMessageType, contactDetails);

            //Send Newsletter Entry message now
            messageHelper.handleNewsletterSignup(myForm.contactAddToEmail,myForm.contactZipCode,myForm.contactEmail);

            Transaction.commit();
         }
         catch (e)
         {

             Transaction.rollback();
         }
         
         //Send the Email, if HE Is Present it will copy to another team as well
        hooksHelper('app.requestQuote.subscribeEmail', 'sendRequestQuoteEmail', contactDetails, function () {});

        res.json({
            success: true,
            msg: Resource.msg('subscribe.to.request.quote.success', 'customerService', null)
        });
        
    } else {
        res.json({
            error: true,
            msg: Resource.msg('subscribe.to.request.quote.email.invalid', 'customerService', null)
        });
    }

    next();
});



/**
 * CustomerService-NLSubscribe : Endpoint NewsLetter Signup
 * @name Base/CustomerService-RQSubscribe
 * @function
 * @memberof CustomerService
 * @param {middleware} - server.middleware.https
 * @param {httpparameter} - contactFirstName - First Name of the shopper
 * @param {httpparameter} - contactLastName - Last Name of the shopper
 * @param {httpparameter} - contactEmail - Email of the shopper
 * @param {httpparameter} - contactTopic - ID of the "Contact Us" topic
 * @param {httpparameter} - contactComment - Comments entered by the shopper
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
 server.post('NLSubscribe', server.middleware.https, function (req, res, next) {

    var email = req.form.emailId;
    var zipCode = req.form.emailId;
    // var isValidEmailid = emailHelper.validateEmail(email);
    var isValidEmailid = validationHelper.valdateEmailId(email);
    if (isValidEmailid) {
        
        var contactDetails = {
            "messageType": MessageConstants.NewsletterMessageType,
            "email": email, 
            "zipCode": zipCode,
        };
        
        /**
         * persist the message into Message Custom Object and have job create the file for back end
         */
         Transaction.begin();
         try
         {
             var messageObject = messageHelper.createMessage(MessageConstants.NewsletterMessageType, contactDetails);
             hooksHelper('app.newsletter.subscribe', 'signup', contactDetails, function () {});    

             Transaction.commit();
         }
         catch (e)
         {
             Transaction.rollback();
         }

        res.json({
            success: true,
            msg: Resource.msg('subscribe.to.request.quote.success', 'customerService', null)
        });
        
    } else {
        res.json({
            error: true,
            msg: Resource.msg('subscribe.to.request.quote.email.invalid', 'customerService', null)
        });
    }

    next();
});




/**
 * CustomerService-NotifyMe : EndPoint for NotifyMe
 * @name Base/CustomerService-NotifyMe
 * @function
 * @memberof CustomerService
 * @param {middleware} - server.middleware.https
 * @param {emailid} - email ID
 * @param {returns} - json
 * @param {serverfunction} - post
 */
 server.post('NotifyMe', server.middleware.https, function (req, res, next) {

    var email = req.form.emailId;
    var addToEmailList = false;

    if(!empty(req.form.addToEmailList) && req.form.addToEmailList == 'true') {
        addToEmailList = true;
    }
    var isValidEmailid = validationHelper.valdateEmailId(email);
    if (isValidEmailid) {

        //Send Newsletter Entry message now
        messageHelper.handleNewsletterSignup(addToEmailList,request.geolocation.postalCode,email);

        res.json({
            success: true,
            msg: Resource.msg('subscribe.to.notify.me.success', 'customerService', null)
        });
        
    } else {
        res.json({
            error: true,
            msg: Resource.msg('subscribe.to.notify.me.email.invalid', 'customerService', null)
        });
    }

    next();
});

module.exports = server.exports();
