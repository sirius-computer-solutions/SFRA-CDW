'use strict';

var server = require('server');


server.extend(module.superModule);
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');


server.append('Show', consentTracking.consent, server.middleware.https, csrfProtection.generateToken, function (req, res, next) {

    var loggedIn = req.currentCustomer.profile;

    var breadcrumbs = [
        {
            htmlValue: Resource.msg('global.home', 'common', null),
            url: URLUtils.home().toString()
        }
    ];
    if (loggedIn) {
        breadcrumbs.push({
            htmlValue: Resource.msg('page.title.myaccount', 'account', null),
            url: URLUtils.url('Account-Show').toString()
        });
        breadcrumbs.push({
            htmlValue: Resource.msg('page.title.wishlist', 'account', null),
            url: URLUtils.url('Account-Show').toString()
        });        
    }else {
        breadcrumbs.push({
            htmlValue: Resource.msg('page.title.wishlist', 'account', null),
            url: URLUtils.url('Account-Show').toString()
        }); 
    }

    var computedMetaData = {
        title: Resource.msg('page.title.wishlist', 'account', null),
        description: Resource.msg('account.page.wishlist.list.description', 'account', null),
        keywords: Resource.msg('account.page.wishlist.list.description', 'account', null),
        pageMetaTags: []
    }

    var pageGroup = {
        name: Resource.msg('account.page.pageGroup.name', 'account', null),
        ID: Resource.msg('account.page.pageGroup.name', 'account', null),
        content: Resource.msg('account.page.wishlist.list.pageGroup.value', 'account', null)
    };
    var robots = {
        name: Resource.msg('account.page.robots.name', 'account', null),
        ID: Resource.msg('account.page.robots.name', 'account', null),
        content: Resource.msg('account.page.robots.value', 'account', null)
    };                    
    computedMetaData.pageMetaTags.push(pageGroup);
    computedMetaData.pageMetaTags.push(robots);


    res.setViewData({
        breadcrumbs: breadcrumbs,
        CurrentPageMetaData: computedMetaData
    });
    next();
});
module.exports = server.exports();
