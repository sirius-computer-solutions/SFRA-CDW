'use strict';

var server = require('server');
server.extend(module.superModule);

/**
 * CustomerService-RQLanding : This endpoint is called to load request quote landing page
 * @name Base/Sitemap-Landing
 * @function
 * @memberof Sitemap
 * @param {middleware} - server.middleware.https
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.append('Landing', function (req, res, next) {
    
    var datalayer = require('*/cartridge/scripts/datalayer.js');
    datalayer.populate(datalayer.CONTEXT.STATIC, req, "SiteMapPage");

   next();
});


module.exports = server.exports();
