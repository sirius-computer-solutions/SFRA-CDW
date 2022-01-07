'use strict';

/**
 * @namespace Login
 */

var server = require('server');
server.extend(module.superModule);

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var Resource = require('dw/web/Resource');

/**
 * Login-Show : This endpoint is called to load the login page
 * @name Base/Login-Show
 * @function
 * @memberof Login
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.generateToken
 * @param {querystringparameter} - rurl - Redirect URL
 * @param {querystringparameter} - action - Action on submit of Login Form
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.append(
    'Show',
    consentTracking.consent,
    server.middleware.https,
    csrfProtection.generateToken,
    function (req, res, next) {

        var computedMetaData = {
            title: Resource.msg('login.page.title', 'login', null),
            description: Resource.msg('login.page.description', 'login', null),
            keywords: Resource.msg('login.page.keywords', 'login', null),
            pageMetaTags: []
        };
    
        var pageGroup = {name: Resource.msg('login.page.pageGroup.name', 'login', null),
                        ID: Resource.msg('login.page.pageGroup.name', 'login', null),
                        content: Resource.msg('login.page.pageGroup.value', 'login', null)};
        var robots = {name: Resource.msg('login.page.robots.name', 'login', null),
                        ID: Resource.msg('login.page.robots.name', 'login', null),
                        content: Resource.msg('login.page.robots.value', 'login', null)};                    
        computedMetaData.pageMetaTags.push(pageGroup);
        computedMetaData.pageMetaTags.push(robots);

        res.setViewData({
            CurrentPageMetaData: computedMetaData
        });
        next();
    }
);

module.exports = server.exports();
